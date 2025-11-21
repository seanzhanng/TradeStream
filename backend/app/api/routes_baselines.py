# app/api/routes_baselines.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.http.baseline_service import BaselineService

router = APIRouter(tags=["Baselines"])


@router.get("/baselines")
async def get_daily_baselines(
    symbols: str = Query(
        ...,
        description="Comma-separated symbols, e.g. AAPL,MSFT,TSLA",
    ),
    db: AsyncSession = Depends(get_db),
):
    # Parse "AAPL,MSFT,TSLA" → ["AAPL", "MSFT", "TSLA"]
    symbol_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]

    return await BaselineService.get_daily_baselines(symbol_list, db)