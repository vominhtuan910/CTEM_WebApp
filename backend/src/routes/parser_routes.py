from fastapi import APIRouter

router = APIRouter()

@router.post("/parse")
async def parse_scan():
    """Parse scan results (placeholder)"""
    return {"message": "Parser endpoint - to be implemented"}

@router.post("/save")
async def save_scan_results():
    """Save parsed scan results (placeholder)"""
    return {"message": "Save results endpoint - to be implemented"}
