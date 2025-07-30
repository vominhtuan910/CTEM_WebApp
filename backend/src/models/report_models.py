from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ReportFormat(str, Enum):
    json = "json"
    markdown = "markdown"
    pdf = "pdf"

class ReportType(str, Enum):
    asset = "asset"
    vulnerability = "vulnerability"
    summary = "summary"

class ReportRequest(BaseModel):
    format: ReportFormat = ReportFormat.json
    asset_id: Optional[str] = None
    vulnerability_id: Optional[str] = None
    include_scans: bool = True

class ReportFile(BaseModel):
    file_name: str
    file_path: str
    report_type: ReportType
    file_format: str
    size: int
    created: datetime
    modified: datetime

class ReportResponse(BaseModel):
    success: bool
    report_type: str
    file_path: str
    file_name: str
    data: Optional[Dict[str, Any]] = None

class ReportsListResponse(BaseModel):
    success: bool
    data: List[ReportFile]
    total: int

class DeleteReportResponse(BaseModel):
    success: bool
    message: str 