from fastapi import APIRouter

router = APIRouter()

@router.post("/generate")
async def generate_report():
    """Generate report (placeholder)"""
    return {"message": "Report generation endpoint - to be implemented"}

@router.get("/")
async def get_reports():
    """Get reports list (placeholder)"""
    return {"message": "Reports list endpoint - to be implemented"}
