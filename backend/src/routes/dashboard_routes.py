from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.models.vulnerability_models import Finding
from src.models.asset_models import Asset
from typing import Dict

router = APIRouter()

@router.get("/", response_model=Dict)
async def get_dashboard_data(db: Session = Depends(get_db)):
    """Get dashboard summary data"""
    try:
        # Get total assets
        total_assets = db.query(Asset).count()
        
        # Get total findings
        total_findings = db.query(Finding).count()
        
        # Get findings by severity
        critical_findings = db.query(Finding).filter(Finding.severity == "Critical").count()
        high_findings = db.query(Finding).filter(Finding.severity == "High").count()
        medium_findings = db.query(Finding).filter(Finding.severity == "Medium").count()
        low_findings = db.query(Finding).filter(Finding.severity == "Low").count()
        
        # Get validated findings
        validated_findings = db.query(Finding).filter(Finding.status == "VALIDATED").count()
        
        # Calculate health score (simple formula)
        if total_findings > 0:
            risk_score = (critical_findings * 10 + high_findings * 7 + medium_findings * 4 + low_findings * 1)
            max_possible_score = total_findings * 10
            health_score = max(0, 100 - int((risk_score / max_possible_score) * 100)) if max_possible_score > 0 else 100
        else:
            health_score = 100
        
        return {
            "success": True,
            "data": {
                "total_assets": total_assets,
                "total_findings": total_findings,
                "health_score": health_score,
                "severity_breakdown": {
                    "critical": critical_findings,
                    "high": high_findings,
                    "medium": medium_findings,
                    "low": low_findings
                },
                "validated_findings": validated_findings,
                "exploitable_findings": validated_findings  # Assuming validated = exploitable
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
