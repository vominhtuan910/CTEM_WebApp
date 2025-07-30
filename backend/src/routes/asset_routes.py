from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..models.asset_models import (
    Asset, AssetCreate, AssetUpdate, AssetFilters, 
    AssetResponse, AssetsResponse, AssetStatus
)
from ..services.asset_service import AssetService

router = APIRouter()

# Initialize service
asset_service = AssetService()

@router.get("/", response_model=AssetsResponse)
async def get_assets(
    search: Optional[str] = Query(None, description="Search term for hostname, IP, or name"),
    status: Optional[AssetStatus] = Query(None, description="Filter by asset status"),
    labels: Optional[str] = Query(None, description="Comma-separated list of labels to filter by")
):
    """Get all assets with optional filtering"""
    try:
        # Parse labels if provided
        labels_list = None
        if labels:
            labels_list = [label.strip() for label in labels.split(",") if label.strip()]
        
        filters = AssetFilters(
            search=search,
            status=status,
            labels=labels_list
        )
        
        assets = await asset_service.get_all_assets(filters)
        
        return AssetsResponse(
            success=True,
            data=assets,
            total=len(assets)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve assets: {str(e)}")

@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(asset_id: str):
    """Get asset by ID"""
    try:
        asset = await asset_service.get_asset_by_id(asset_id)
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        return AssetResponse(
            success=True,
            data=asset
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve asset: {str(e)}")

@router.post("/", response_model=AssetResponse, status_code=201)
async def create_asset(asset_data: AssetCreate):
    """Create a new asset"""
    try:
        asset = await asset_service.create_asset(asset_data)
        
        return AssetResponse(
            success=True,
            data=asset,
            message="Asset created successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create asset: {str(e)}")

@router.put("/{asset_id}", response_model=AssetResponse)
async def update_asset(asset_id: str, asset_data: AssetUpdate):
    """Update an existing asset"""
    try:
        asset = await asset_service.update_asset(asset_id, asset_data)
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        return AssetResponse(
            success=True,
            data=asset,
            message="Asset updated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update asset: {str(e)}")

@router.delete("/{asset_id}", response_model=AssetResponse)
async def delete_asset(asset_id: str):
    """Delete an asset"""
    try:
        success = await asset_service.delete_asset(asset_id)
        if not success:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        return AssetResponse(
            success=True,
            message="Asset deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete asset: {str(e)}") 