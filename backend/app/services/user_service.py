from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import User
from app.schemas.user import UserCreate
from app.schemas.response import Response
from fastapi import status
from hashlib import sha256
from datetime import datetime
from uuid import uuid4

class UserService:
    @staticmethod
    async def create_user(new_user: UserCreate, db: AsyncSession):
        try:
            result = await db.execute(select(User).filter(User.email == new_user.email))
            existing = result.scalar_one_or_none()

            if existing:
                return Response(
                    message="User already exists",
                    status_code=status.HTTP_200_OK,
                    is_success=True
                )

            hashed_pw = sha256(new_user.password.encode()).hexdigest()
            user = User(
                id=uuid4(),
                username=new_user.username,
                email=new_user.email,
                hashed_password=hashed_pw,
                created_at=datetime.utcnow()
            )

            db.add(user)
            await db.commit()

            return Response(
                message="User created successfully",
                status_code=status.HTTP_201_CREATED,
                is_success=True
            )

        except Exception as e:
            return Response(
                message=f"Failed to create user: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                is_success=False
            )

    @staticmethod
    async def get_all_users(db: AsyncSession):
        result = await db.execute(select(User))
        return result.scalars().all()