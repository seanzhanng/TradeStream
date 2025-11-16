from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import Watchlist
from app.schemas.watchlist import WatchlistUpdate, WatchlistResponse
from fastapi import HTTPException
from symbols import allowed_symbols

class WatchlistService:

    @staticmethod
    async def get_watchlist(user_id: str, db: AsyncSession) -> WatchlistResponse:
        result = await db.execute(
            select(Watchlist).filter(Watchlist.user_id == user_id)
        )
        row = result.scalar_one_or_none()

        if not row:
            return WatchlistResponse(symbols=[])

        symbols = row.symbols.split(",") if row.symbols else []
        return WatchlistResponse(symbols=symbols)

    @staticmethod
    async def set_watchlist(user_id: str, new_list: WatchlistUpdate, db: AsyncSession):

        symbols = [s.upper() for s in new_list.symbols]

        invalid = [s for s in symbols if s not in allowed_symbols]

        if invalid:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid symbols: {', '.join(invalid)}"
            )

        csv = ",".join(symbols)

        result = await db.execute(
            select(Watchlist).filter(Watchlist.user_id == user_id)
        )
        row = result.scalar_one_or_none()

        if row:
            row.symbols = csv
        else:
            row = Watchlist(user_id=user_id, symbols=csv)
            db.add(row)

        await db.commit()
        return {"message": "Watchlist updated", "symbols": symbols}
