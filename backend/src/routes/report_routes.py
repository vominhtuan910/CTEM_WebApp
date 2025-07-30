from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import FileResponse
from typing import Optional
from ..models.report_models import (
    ReportRequest, ReportResponse, ReportsListResponse, 
    DeleteReportResponse, ReportFormat
)
from ..services.report_service import report_service

router = APIRouter()

@router.get("/", response_model=ReportsListResponse)
async def list_reports():
    """List available reports"""
    try:
        reports = await report_service.list_reports()
        
        return ReportsListResponse(
            success=True,
            data=reports,
            total=len(reports)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list reports: {str(e)}")

@router.post("/generate", response_model=ReportResponse)
async def generate_report(request: ReportRequest):
    """Generate a new report"""
    try:
        # Validate required parameters
        if not request.asset_id and not request.vulnerability_id and request.format != ReportFormat.summary:
            raise HTTPException(
                status_code=400,
                detail="Either assetId or vulnerabilityId is required, or format must be 'summary'"
            )
        
        # Generate report based on format
        if request.format == ReportFormat.json:
            result = await report_service.generate_json_report(request)
        elif request.format in [ReportFormat.markdown, "md"]:
            result = await report_service.generate_markdown_report(request)
        elif request.format == ReportFormat.pdf:
            raise HTTPException(
                status_code=501,
                detail="PDF report generation not implemented yet"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Format '{request.format}' is not supported. Use 'json', 'markdown', or 'pdf'"
            )
        
        return ReportResponse(
            success=True,
            report_type=result["report_type"],
            file_path=result["file_path"],
            file_name=result["file_name"],
            data=result.get("data")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@router.get("/download/{filename}")
async def download_report(filename: str):
    """Download a report file"""
    try:
        from pathlib import Path
        import os
        
        file_path = Path("output/reports") / filename
        
        # Check if file exists
        if not file_path.exists() or not file_path.is_file():
            raise HTTPException(status_code=404, detail="Report file not found")
        
        # Determine content type based on file extension
        content_type = "application/octet-stream"
        if file_path.suffix.lower() == ".json":
            content_type = "application/json"
        elif file_path.suffix.lower() == ".md":
            content_type = "text/markdown"
        elif file_path.suffix.lower() == ".pdf":
            content_type = "application/pdf"
        
        return FileResponse(
            path=str(file_path),
            filename=filename,
            media_type=content_type
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download report: {str(e)}")

@router.delete("/{filename}", response_model=DeleteReportResponse)
async def delete_report(filename: str):
    """Delete a report file"""
    try:
        success = await report_service.delete_report(filename)
        if not success:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return DeleteReportResponse(
            success=True,
            message=f"Report {filename} deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete report: {str(e)}") 