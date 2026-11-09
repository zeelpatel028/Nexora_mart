import datetime
import uuid
from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models.user import User
from ..models.store import (
    Store,
    ShopCategory,
    StoreOwnerDetails,
    StoreAddress,
    StoreBusinessDetails,
    StoreConfiguration,
    DocumentSequence,
)
from ..models.store_type import StoreType
from ..models.refresh_token import RefreshToken
from ..schemas.auth_schema import UserRegisterRequest, UserLoginRequest
from ..utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    generate_refresh_token,
    hash_refresh_token
)
from ..core.config import settings

class AuthService:
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        ident = email.strip().lower()
        return db.query(User).filter(
            (User.email.ilike(ident)) |
            (User.phone == ident) |
            (User.first_name.ilike(ident))
        ).first()

    @staticmethod
    def resolve_store_type(db: Session, request_data: UserRegisterRequest) -> StoreType:
        """
        Validates store type from database.
        Never trusts unverified store types.
        """
        store_type: Optional[StoreType] = None

        if request_data.store_type_id:
            store_type = db.query(StoreType).filter(
                StoreType.id == request_data.store_type_id,
                StoreType.is_active == True
            ).first()

        if not store_type and request_data.store_type_code:
            store_type = db.query(StoreType).filter(
                StoreType.code == request_data.store_type_code.strip().lower(),
                StoreType.is_active == True
            ).first()

        if not store_type and request_data.storeType:
            st_name = request_data.storeType.strip()
            store_type = db.query(StoreType).filter(
                (StoreType.code.ilike(st_name)) |
                (StoreType.name.ilike(f"%{st_name}%")),
                StoreType.is_active == True
            ).first()

        if not store_type:
            raise ValueError("Invalid or inactive store type. Please select a valid store type.")

        return store_type

    @staticmethod
    def register_user(db: Session, request_data: UserRegisterRequest) -> Tuple[User, Store, str, str]:
        """
        Creates user and their store using a database transaction.
        Issues 15-minute access JWT and 15-hour refresh token.
        """
        normalized_email = request_data.email.lower().strip()
        existing = db.query(User).filter(User.email == normalized_email).first()
        if existing:
            raise ValueError("An account with this email address already exists")

        # Validate Store Type from DB
        store_type = AuthService.resolve_store_type(db, request_data)

        # Parse name
        if request_data.name and not request_data.firstName:
            parts = request_data.name.strip().split(maxsplit=1)
            first_name = parts[0]
            surname = parts[1] if len(parts) > 1 else "Owner"
        else:
            first_name = (request_data.firstName or "Store").strip()
            surname = (request_data.surname or "Owner").strip()

        phone = (request_data.phone or "").strip()

        # Find matching legacy shop category for backward compatibility
        matching_cat = db.query(ShopCategory).filter(
            (ShopCategory.code.ilike(store_type.code)) |
            (ShopCategory.name.ilike(f"%{store_type.name}%"))
        ).first()
        cat_id = matching_cat.id if matching_cat else None

        # Execute creation in transaction
        try:
            user = User(
                first_name=first_name,
                surname=surname,
                email=normalized_email,
                phone=phone or "+91-9876543210",
                store_type=store_type.name,
                shop_category=store_type.name,
                shop_category_id=cat_id,
                hashed_password=get_password_hash(request_data.password),
                plain_password=request_data.password,
                is_active=True
            )
            db.add(user)
            db.flush()

            store_title = request_data.store_name.strip() if request_data.store_name else f"{user.first_name}'s {store_type.name}"
            store = Store(
                user_id=user.id,
                store_type_id=store_type.id,
                shop_category_id=cat_id,
                name=store_title,
                code=f"STR-{user.id:03d}",
                store_code=f"STR-{user.id:03d}",
                store_type=store_type.name,
                store_category="Retail",
                currency="INR",
                currency_symbol="₹",
                is_active=True
            )
            db.add(store)
            db.flush()

            # Store owner details
            owner_details = StoreOwnerDetails(
                store_id=store.id,
                owner_id=f"OWN{user.id:03d}",
                owner_name=user.full_name,
                contact_phone=user.phone,
                contact_email=user.email
            )
            db.add(owner_details)

            # Store address
            addr = StoreAddress(
                store_id=store.id,
                address_line1="Main Market Commercial Center",
                city="Ahmedabad",
                state="Gujarat",
                country="India",
                postal_code="380001",
                is_primary=True
            )
            db.add(addr)

            # Business details
            biz = StoreBusinessDetails(
                store_id=store.id,
                legal_name=store.name,
                business_type="Retail",
                tax_type="GST"
            )
            db.add(biz)

            # Store configuration
            cfg = StoreConfiguration(
                store_id=store.id,
                currency="INR (₹)",
                default_tax_rate=5.0,
                invoice_prefix="INV",
                invoice_starting_number=1,
                low_stock_alert=5
            )
            db.add(cfg)

            # Standard document sequences
            sequences = [
                DocumentSequence(store_id=store.id, document_type="INVOICE", prefix="INV", next_number=1, padding=6, sample_example=f"INV-STR{user.id:03d}-000001"),
                DocumentSequence(store_id=store.id, document_type="DEBIT_CUSTOMER", prefix="DBC", next_number=1, padding=6, sample_example=f"DBC-STR{user.id:03d}-000001"),
                DocumentSequence(store_id=store.id, document_type="WALKIN_CUSTOMER", prefix="WIC", next_number=1, padding=6, sample_example=f"WIC-STR{user.id:03d}-000001"),
                DocumentSequence(store_id=store.id, document_type="SUPPLIER", prefix="SUP", next_number=1, padding=6, sample_example=f"SUP-STR{user.id:03d}-000001"),
                DocumentSequence(store_id=store.id, document_type="ORDER", prefix="ORD", next_number=1, padding=6, sample_example=f"ORD-STR{user.id:03d}-000001"),
            ]
            for seq in sequences:
                db.add(seq)

            # Session & Tokens
            session_id = uuid.uuid4().hex
            plain_refresh = generate_refresh_token()
            token_hash = hash_refresh_token(plain_refresh)
            expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=settings.REFRESH_TOKEN_EXPIRE_HOURS)

            rt = RefreshToken(
                user_id=user.id,
                token_hash=token_hash,
                session_id=session_id,
                expires_at=expires_at,
                revoked_at=None
            )
            db.add(rt)
            db.commit()
            db.refresh(user)
            db.refresh(store)

            access_token = create_access_token(data={"sub": str(user.id), "sid": session_id, "email": user.email})
            return user, store, access_token, plain_refresh
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def authenticate_user(db: Session, request_data: UserLoginRequest) -> Tuple[User, Store, str, str]:
        """
        Authenticates user by email/phone and password.
        Issues 15-minute access token and 15-hour refresh token.
        """
        ident = request_data.email.strip().lower()
        user = db.query(User).filter(
            (User.email.ilike(ident)) |
            (User.phone == ident) |
            (User.first_name.ilike(ident))
        ).first()

        if not user or not verify_password(request_data.password, user.hashed_password):
            raise ValueError("Invalid credentials. Please verify your email and password.")

        if not user.is_active:
            raise ValueError("This user account has been deactivated.")

        user.last_login = datetime.datetime.now(datetime.timezone.utc)

        # Ensure store exists
        store = db.query(Store).filter(Store.user_id == user.id, Store.is_active == True).first()
        if not store:
            from .store_service import StoreService
            store = StoreService.get_user_store(db, user)

        # Issue 15-hour refresh token and 15-minute access token
        session_id = uuid.uuid4().hex
        plain_refresh = generate_refresh_token()
        token_hash = hash_refresh_token(plain_refresh)
        expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=settings.REFRESH_TOKEN_EXPIRE_HOURS)

        rt = RefreshToken(
            user_id=user.id,
            token_hash=token_hash,
            session_id=session_id,
            expires_at=expires_at,
            revoked_at=None
        )
        db.add(rt)
        db.commit()
        db.refresh(user)
        db.refresh(store)

        access_token = create_access_token(data={"sub": str(user.id), "sid": session_id, "email": user.email})
        return user, store, access_token, plain_refresh

    @staticmethod
    def refresh_session(db: Session, plain_refresh_token: str) -> Tuple[User, Store, str, str]:
        """
        Validates refresh token, enforces 15-hour absolute session ceiling,
        rotates the refresh token (revokes previous), and issues new 15-minute access JWT.
        """
        if not plain_refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token required"
            )

        token_hash = hash_refresh_token(plain_refresh_token)
        now = datetime.datetime.now(datetime.timezone.utc)

        rt = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
        if not rt or rt.revoked_at is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid, expired or revoked refresh session. Please log in again."
            )

        # Ensure expires_at comparison is timezone-aware
        exp = rt.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=datetime.timezone.utc)

        if exp <= now:
            rt.revoked_at = now
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired (15-hour absolute lifetime reached). Please log in again."
            )

        user = db.query(User).filter(User.id == rt.user_id, User.is_active == True).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive."
            )

        store = db.query(Store).filter(Store.user_id == user.id, Store.is_active == True).first()
        if not store:
            from .store_service import StoreService
            store = StoreService.get_user_store(db, user)

        # Rotate refresh token: revoke current, issue new with SAME session_id and SAME absolute expires_at
        rt.revoked_at = now
        rt.last_used_at = now

        new_plain_refresh = generate_refresh_token()
        new_token_hash = hash_refresh_token(new_plain_refresh)

        new_rt = RefreshToken(
            user_id=user.id,
            token_hash=new_token_hash,
            session_id=rt.session_id,
            expires_at=rt.expires_at,  # Strict: Does NOT extend 15-hour absolute limit
            revoked_at=None
        )
        db.add(new_rt)
        db.commit()

        new_access_token = create_access_token(data={"sub": str(user.id), "sid": rt.session_id, "email": user.email})
        return user, store, new_access_token, new_plain_refresh

    @staticmethod
    def revoke_token(db: Session, plain_refresh_token: Optional[str] = None, user_id: Optional[int] = None) -> bool:
        now = datetime.datetime.now(datetime.timezone.utc)
        if plain_refresh_token:
            token_hash = hash_refresh_token(plain_refresh_token)
            rt = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
            if rt:
                rt.revoked_at = now
                db.commit()
                return True
        elif user_id:
            db.query(RefreshToken).filter(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked_at.is_(None)
            ).update({"revoked_at": now})
            db.commit()
            return True
        return False
