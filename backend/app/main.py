from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import engine, Base
from app.api.routes_users import router as users_router
from app.core.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Tradestream backend...")

    # Create tables asynchronously
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield
    logger.info("Closing backend...")

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
