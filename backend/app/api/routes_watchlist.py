from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.db.session import get_db
from app.schemas.watchlist import WatchlistUpdate, WatchlistResponse
from app.services.http.watchlist_service import WatchlistService

router = APIRouter(tags=["Watchlist"])

@router.get("/watchlist/{user_id}", response_model=WatchlistResponse)
async def get_watchlist(user_id: UUID, db: AsyncSession = Depends(get_db)):
    return await WatchlistService.get_watchlist(str(user_id), db)

@router.post("/watchlist/{user_id}")
async def set_watchlist(user_id: UUID, update: WatchlistUpdate, db: AsyncSession = Depends(get_db)):
    return await WatchlistService.set_watchlist(str(user_id), update, db)