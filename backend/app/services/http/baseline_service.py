# app/services/http/baseline_service.py
from typing import Dict, List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text


class BaselineService:
    @staticmethod
    async def get_daily_baselines(
        symbols: List[str],
        db: AsyncSession,
    ) -> Dict[str, float]:
        """
        Returns {symbol: first_price_today} for each symbol that has ticks today.
        """
        result: Dict[str, float] = {}

        for sym in symbols:
            # first tick of CURRENT_DATE for this symbol
            rows = await db.execute(
                text(
                    """
                    SELECT price
                    FROM ticks
                    WHERE symbol = :symbol
                      AND ts::date = CURRENT_DATE
                    ORDER BY ts ASC
                    LIMIT 1
                    """
                ),
                {"symbol": sym},
            )
            row = rows.fetchone()
            if row is not None:
                result[sym] = float(row[0])

        return result