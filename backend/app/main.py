from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import engine, Base
from app.api.routes_users import router as users_router
from app.api.routes_analytics_ws import router as analytics_router
from app.core.logger import logger
from app.api.routes_watchlist import router as watchlist_router
from app.services.ws.analytics_broadcaster import analytics_kafka_consumer
from app.api.routes_ticks_ws import router as ticks_router
from app.services.ws.tick_broadcaster import tick_kafka_consumer

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting backend...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    asyncio.create_task(tick_kafka_consumer())
    logger.info("Tick background consumer started")

    asyncio.create_task(analytics_kafka_consumer())
    logger.info("Analytics background consumer started")

    yield

    logger.info("Shutting down backend...")

app = FastAPI(title="Tradestream Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    logger.info("Health check OK")
    return {"status": "ok"}

app.include_router(users_router, prefix="/api")
app.include_router(watchlist_router, prefix="/api")
app.include_router(analytics_router)
app.include_router(ticks_router)
