from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from src.database import get_db
from src.services.asset_service import asset_service
from src.services.scan_service import scan_service
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class NetworkScanRequest(BaseModel):
    network: str  # e.g., "192.168.1.0/24"
    save_to_db: bool = True


class AssetCreateRequest(BaseModel):
    hostname: str
    ipAddress: str
    os: Optional[Dict] = None


class AssetUpdateRequest(BaseModel):
    hostname: Optional[str] = None
    ipAddress: Optional[str] = None
    os: Optional[Dict] = None


class AssetResponse(BaseModel):
    id: int
    ip: str
    hostname: str = None
    os: str = None
    created_at: str = None
    total_findings: int = 0
    critical_findings: int = 0
    high_findings: int = 0
    last_scan: str = None


@router.get("/", response_model=Dict)
async def get_all_assets(db: Session = Depends(get_db)):
    """Get all assets with vulnerability information"""
    try:
        assets = await asset_service.get_assets_with_vulnerabilities(db)

        return {"success": True, "data": assets, "total": len(assets)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{asset_id}", response_model=Dict)
async def get_asset_by_id(asset_id: str, db: Session = Depends(get_db)):
    """Get specific asset by ID"""
    try:
        asset = await asset_service.get_asset_by_id(int(asset_id), db)

        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")

        # Get related scan data
        nmap_scans = []
        for scan in asset.nmap_scans:
            nmap_scans.append(
                {
                    "id": scan.id,
                    "scan_date": scan.scan_date.isoformat(),
                    "ports": scan.ports,
                    "os": scan.os,
                }
            )

        openvas_scans = []
        for scan in asset.openvas_scans:
            findings = []
            for finding in scan.findings:
                findings.append(
                    {
                        "id": finding.id,
                        "cve_id": finding.cve_id,
                        "title": finding.title,
                        "severity": finding.severity,
                        "cvss_score": finding.cvss_score,
                        "status": finding.status,
                    }
                )

            openvas_scans.append(
                {
                    "id": scan.id,
                    "scan_date": scan.scan_date.isoformat(),
                    "findings_count": len(findings),
                    "findings": findings,
                }
            )

        return {
            "success": True,
            "data": {
                "id": asset.id,
                "ip": asset.ip,
                "hostname": asset.hostname,
                "os": asset.os,
                "created_at": asset.created_at.isoformat()
                if asset.created_at
                else None,
                "nmap_scans": nmap_scans,
                "openvas_scans": openvas_scans,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Dict)
async def create_asset(asset_data: AssetCreateRequest, db: Session = Depends(get_db)):
    """Create a new asset"""
    try:
        # Create asset using the service
        new_asset = await asset_service.create_asset(asset_data.dict(), db)

        return {
            "success": True,
            "data": {
                "id": str(new_asset.id),  # Convert to string for frontend compatibility
                "hostname": new_asset.hostname,
                "ip_address": new_asset.ip,
                "ip_addresses": [new_asset.ip],
                "status": "active",  # Default value
                "os_name": new_asset.os,
                "os_version": "",
                "os_architecture": "",
                "os_build_number": "",
                "os_last_boot_time": "",
                "created_at": new_asset.created_at.isoformat()
                if new_asset.created_at
                else None,
                "updated_at": new_asset.created_at.isoformat()
                if new_asset.created_at
                else None,
                "services": [],
                "applications": [],
                "labels": [],
                "health_score": None,
                "issues_count": 0,
                "agent_status": "not_installed",
                "confidentiality": 1,
                "integrity": 1,
                "availability": 1,
                "department": None,
                "location": None,
                "owner": None,
                "last_scan": None,
                "total_findings": 0,
                "critical_findings": 0,
                "high_findings": 0,
            },
            "message": "Asset created successfully",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{asset_id}", response_model=Dict)
async def update_asset(
    asset_id: str, asset_data: AssetUpdateRequest, db: Session = Depends(get_db)
):
    """Update an existing asset"""
    try:
        # Update asset using the service
        updated_asset = await asset_service.update_asset(
            int(asset_id), asset_data.dict(exclude_unset=True), db
        )

        if not updated_asset:
            raise HTTPException(status_code=404, detail="Asset not found")

        return {
            "success": True,
            "data": {
                "id": str(
                    updated_asset.id
                ),  # Convert to string for frontend compatibility
                "hostname": updated_asset.hostname,
                "ip_address": updated_asset.ip,
                "status": "active",
                "os_name": updated_asset.os,
                "updated_at": datetime.now().isoformat(),
                "services": [],
                "applications": [],
                "labels": [],
                "health_score": None,
                "issues_count": 0,
                "agent_status": "not_installed",
                "confidentiality": 1,
                "integrity": 1,
                "availability": 1,
            },
            "message": "Asset updated successfully",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/scan-network")
async def scan_network(request: NetworkScanRequest, db: Session = Depends(get_db)):
    """
    Stage 1: Scan network range to discover assets
    """
    try:
        result = await scan_service.perform_network_discovery(request.network)

        return {
            "success": result.get("success", False),
            "message": f"Network scan completed for {request.network}",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/vulnerability-scan")
async def start_vulnerability_scan(asset_ids: List[int], db: Session = Depends(get_db)):
    """
    Stage 2: Start OpenVAS vulnerability scans for selected assets
    """
    try:
        if not asset_ids:
            raise HTTPException(status_code=400, detail="No asset IDs provided")

        result = await scan_service.start_vulnerability_scan(asset_ids)

        return {
            "success": result.get("success", False),
            "message": f"Started vulnerability scans for {len(asset_ids)} assets",
            "data": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/scan-progress/{task_ids}")
async def check_scan_progress(task_ids: str):
    """
    Check progress of vulnerability scans
    task_ids should be comma-separated list of task IDs
    """
    try:
        task_id_list = [tid.strip() for tid in task_ids.split(",")]
        result = await scan_service.check_scan_progress(task_id_list)

        return {"success": result.get("success", False), "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/clear-all")
async def clear_all_assets(db: Session = Depends(get_db)):
    """Delete all assets and related data"""
    try:
        result = await asset_service.clear_all_assets(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{asset_id}")
async def delete_asset(asset_id: str, db: Session = Depends(get_db)):
    """Delete an asset and all related data"""
    try:
        success = await asset_service.delete_asset(int(asset_id), db)

        if not success:
            raise HTTPException(status_code=404, detail="Asset not found")

        return {"success": True, "message": f"Asset {asset_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
