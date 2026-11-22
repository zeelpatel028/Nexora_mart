from fastapi import APIRouter, Depends
from ...dependencies.auth import get_current_user
from ...models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "surname": user.surname,
        "phone": user.phone,
        "is_active": user.is_active,
    }
