from fastapi import APIRouter, HTTPException
from src.services.scan_service import scan_service

router = APIRouter()

@router.get("/tools")
async def get_scan_tools_status():
    """Get the status of scanning tools (Nmap, OpenVAS, searchsploit)"""
    try:
        status = await scan_service.get_scan_tools_status()
        return {
            "success": True,
            "data": status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/network")
async def scan_network_endpoint(network: str):
    """Scan network range using Nmap"""
    try:
        result = await scan_service.perform_network_discovery(network)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{task_ids}")
async def get_scan_status(task_ids: str):
    """Get status of OpenVAS scan tasks"""
    try:
        task_id_list = [tid.strip() for tid in task_ids.split(',')]
        result = await scan_service.check_scan_progress(task_id_list)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
