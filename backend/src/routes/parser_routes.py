from fastapi import APIRouter, HTTPException
from typing import Optional, Dict, Any
from pydantic import BaseModel

router = APIRouter()

class ParseRequest(BaseModel):
    scan_id: Optional[str] = None
    scan_file: Optional[str] = None

class SaveRequest(BaseModel):
    scan_id: Optional[str] = None
    scan_file: Optional[str] = None
    asset_id: Optional[str] = None

@router.post("/parse")
async def parse_scan_results(request: ParseRequest):
    """Parse scan results without saving to database"""
    try:
        # Validate inputs
        if not request.scan_id and not request.scan_file:
            raise HTTPException(
                status_code=400,
                detail="Either scanId or scanFile must be provided"
            )
        
        # Mock implementation - in real implementation this would parse actual scan files
        parsed_results = {
            "asset_info": {
                "hostname": "server-01",
                "ip_address": "192.168.1.100",
                "os_name": "Ubuntu",
                "os_version": "22.04 LTS"
            },
            "services": [
                {"name": "nginx", "port": 80, "protocol": "tcp", "version": "1.18.0"},
                {"name": "ssh", "port": 22, "protocol": "tcp", "version": "8.9p1"}
            ],
            "applications": [
                {"name": "Docker", "version": "24.0.5", "publisher": "Docker Inc."}
            ],
            "vulnerabilities": [
                {
                    "name": "SSH Root Login Enabled",
                    "severity": "medium",
                    "description": "SSH root login is enabled"
                }
            ],
            "health_score": 85.5,
            "issues_count": 1
        }
        
        return {
            "success": True,
            "parsed_results": parsed_results
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse scan results: {str(e)}")

@router.post("/save")
async def save_scan_results(request: SaveRequest):
    """Parse and save scan results to database"""
    try:
        # Validate inputs
        if not request.scan_id and not request.scan_file:
            raise HTTPException(
                status_code=400,
                detail="Either scanId or scanFile must be provided"
            )
        
        # Mock implementation - in real implementation this would:
        # 1. Parse the scan file
        # 2. Save to database
        # 3. Update or create asset
        
        parsed_results = {
            "asset_info": {
                "hostname": "server-01",
                "ip_address": "192.168.1.100",
                "os_name": "Ubuntu",
                "os_version": "22.04 LTS"
            },
            "services": [
                {"name": "nginx", "port": 80, "protocol": "tcp", "version": "1.18.0"},
                {"name": "ssh", "port": 22, "protocol": "tcp", "version": "8.9p1"}
            ],
            "applications": [
                {"name": "Docker", "version": "24.0.5", "publisher": "Docker Inc."}
            ],
            "vulnerabilities": [
                {
                    "name": "SSH Root Login Enabled",
                    "severity": "medium",
                    "description": "SSH root login is enabled"
                }
            ],
            "health_score": 85.5,
            "issues_count": 1
        }
        
        # Mock asset data
        asset_data = {
            "id": request.asset_id or "asset-001",
            "hostname": parsed_results["asset_info"]["hostname"],
            "ip_address": parsed_results["asset_info"]["ip_address"],
            "os_name": parsed_results["asset_info"]["os_name"],
            "os_version": parsed_results["asset_info"]["os_version"],
            "health_score": parsed_results["health_score"],
            "issues_count": parsed_results["issues_count"],
            "services": parsed_results["services"],
            "applications": parsed_results["applications"]
        }
        
        return {
            "success": True,
            "message": "Asset updated with scan results" if request.asset_id else "New asset created from scan results",
            "asset": asset_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save scan results: {str(e)}") 