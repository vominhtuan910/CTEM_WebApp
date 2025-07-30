from fastapi import APIRouter, HTTPException
from typing import List
from ..models.dashboard_models import (
    DashboardData, HealthScore, ThreatsSummary, MetricItem,
    ErrorToWatch, Threat
)
from ..services.dashboard_service import DashboardService

router = APIRouter()

# Initialize service
dashboard_service = DashboardService()

@router.get("/", response_model=DashboardData)
async def get_dashboard_data():
    """Get complete dashboard data"""
    try:
        dashboard_data = await dashboard_service.get_dashboard_data()
        return dashboard_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve dashboard data: {str(e)}")

@router.get("/health-score", response_model=HealthScore)
async def get_health_score():
    """Get security health score"""
    try:
        health_score = await dashboard_service.get_health_score()
        return health_score
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve health score: {str(e)}")

@router.get("/threats", response_model=ThreatsSummary)
async def get_threats_summary():
    """Get threats summary"""
    try:
        threats_summary = await dashboard_service.get_threats_summary()
        return threats_summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve threats summary: {str(e)}")

@router.get("/metrics", response_model=dict)
async def get_metrics():
    """Get all dashboard metrics"""
    try:
        metrics = await dashboard_service.get_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve metrics: {str(e)}")

@router.get("/errors-to-watch", response_model=List[ErrorToWatch])
async def get_errors_to_watch():
    """Get errors to watch list"""
    try:
        errors = await dashboard_service.get_errors_to_watch()
        return errors
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve errors to watch: {str(e)}")

@router.get("/common-threats", response_model=List[MetricItem])
async def get_common_threats():
    """Get common threats metrics"""
    try:
        common_threats = await dashboard_service.get_common_threats()
        return common_threats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve common threats: {str(e)}")

@router.get("/attacked-assets", response_model=List[MetricItem])
async def get_attacked_assets():
    """Get attacked assets metrics"""
    try:
        attacked_assets = await dashboard_service.get_attacked_assets()
        return attacked_assets
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve attacked assets: {str(e)}")

@router.get("/attack-methods", response_model=List[MetricItem])
async def get_attack_methods():
    """Get attack methods metrics"""
    try:
        attack_methods = await dashboard_service.get_attack_methods()
        return attack_methods
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve attack methods: {str(e)}") 