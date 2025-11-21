# backend/app/api/routes_health.py
from fastapi import APIRouter
from app.services.http.health_service import HealthService

router = APIRouter(tags=["Health"])

@router.get("/health")
async def get_health():
    return await HealthService.get_health()