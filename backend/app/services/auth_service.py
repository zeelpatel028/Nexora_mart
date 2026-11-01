from typing import Optional
from sqlalchemy.orm import Session
from ..models.user import User
from ..schemas.auth_schema import UserRegisterRequest, UserLoginRequest
from ..utils.security import get_password_hash, verify_password, create_access_token

class AuthService:
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.lower().strip()).first()

    @staticmethod
    def register_user(db: Session, request_data: UserRegisterRequest) -> User:
        existing = AuthService.get_user_by_email(db, request_data.email)
        if existing:
            raise ValueError("An account with this email address already exists")

        user = User(
            first_name=request_data.firstName.strip(),
            surname=request_data.surname.strip(),
            email=request_data.email.lower().strip(),
            phone=request_data.phone.strip(),
            store_type=request_data.storeType.strip(),
            hashed_password=get_password_hash(request_data.password)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, request_data: UserLoginRequest) -> tuple[User, str]:
        user = AuthService.get_user_by_email(db, request_data.email)
        if not user or not verify_password(request_data.password, user.hashed_password):
            raise ValueError("Invalid email or password")

        token = create_access_token(data={"sub": str(user.id), "email": user.email})
        return user, token
