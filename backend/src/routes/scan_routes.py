from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, Any
from ..models.scan_models import (
    ScanToolsStatus, ScanRequest, ScanOptions, ScanResponse, 
    ScanHistoryResponse, ScanHistoryItem
)
from ..services.scan_service import (
    get_scan_tools_status, run_scan, get_scan_history, get_scan_by_id
)

router = APIRouter()

@router.get("/tools", response_model=ScanToolsStatus)
async def get_scan_tools():
    """Get status of available scanning tools"""
    try:
        return await get_scan_tools_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check scan tools: {str(e)}")

@router.post("/start", response_model=ScanResponse)
async def start_scan(scan_request: ScanRequest):
    """Start a new scan"""
    try:
        # Transform request to scan options
        scan_options = ScanOptions(
            target=scan_request.target,
            run_nmap=scan_request.run_nmap,
            run_lynis=scan_request.run_lynis,
            run_powershell=scan_request.run_powershell,
            auto_detect_os=scan_request.auto_detect_os
        )
        
        # Apply scan options if provided
        if scan_request.scan_options:
            if 'system_scan' in scan_request.scan_options:
                scan_options.scan_packages = scan_request.scan_options['system_scan']
                scan_options.scan_vulnerabilities = scan_request.scan_options['system_scan']
            
            if 'network_scan' in scan_request.scan_options:
                scan_options.scan_network_config = scan_request.scan_options['network_scan']
            
            if 'services_scan' in scan_request.scan_options:
                scan_options.scan_services = scan_request.scan_options['services_scan']
        
        # Run the scan
        scan_result = await run_scan(scan_options)
        
        return ScanResponse(
            success=True,
            scan_id=scan_result.scan_id,
            timestamp=scan_result.timestamp,
            target=scan_result.target,
            platform=scan_result.platform,
            scan_status=scan_result.scan_status,
            report_file=scan_result.report_file,
            errors=scan_result.errors
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to run scan: {str(e)}")

@router.get("/history", response_model=ScanHistoryResponse)
async def get_scan_history_endpoint(
    limit: int = Query(10, description="Maximum number of scan results to return")
):
    """Get scan history"""
    try:
        history = await get_scan_history(limit)
        
        return ScanHistoryResponse(
            success=True,
            data=history,
            total=len(history)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get scan history: {str(e)}")

@router.get("/{scan_id}")
async def get_scan_by_id_endpoint(scan_id: str):
    """Get scan results by ID"""
    try:
        scan_data = await get_scan_by_id(scan_id)
        if not scan_data:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        return {
            "success": True,
            "data": scan_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get scan: {str(e)}")

@router.post("/assets/{asset_id}")
async def scan_asset(asset_id: str):
    """Start scan for a specific asset (placeholder implementation)"""
    try:
        # This is a placeholder implementation
        # In a real implementation, this would:
        # 1. Get the asset details from the database
        # 2. Run a scan with those details (IP address, etc.)
        # 3. Parse the results
        # 4. Update the asset with the findings
        
        return {
            "success": True,
            "message": "Asset scan initiated",
            "asset_id": asset_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scan asset: {str(e)}") 