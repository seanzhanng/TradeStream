from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.user_service import UserService
from app.schemas.user import UserCreate, UserOut
from app.schemas.response import Response

router = APIRouter()

@router.post("/users", response_model=Response)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    return await UserService.create_user(user, db)

@router.get("/users", response_model=list[UserOut])
async def get_users(db: AsyncSession = Depends(get_db)):
    return await UserService.get_all_users(db)