from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ScanStatus(str, Enum):
    in_progress = "in_progress"
    completed = "completed"
    failed = "failed"
    partial = "partial"
    skipped = "skipped"

class ToolStatus(str, Enum):
    installed = "installed"
    not_installed = "not_installed"
    available = "available"
    not_available = "not_available"
    not_applicable = "not_applicable"

class ScanToolsStatus(BaseModel):
    platform: str
    tools: Dict[str, ToolStatus]

class ScanOptions(BaseModel):
    target: str = "localhost"
    scan_packages: bool = False
    scan_services: bool = True
    scan_vulnerabilities: bool = True
    scan_network_config: bool = True
    quick_scan: bool = False
    auto_detect_os: bool = True
    run_nmap: Optional[bool] = None
    run_lynis: Optional[bool] = None
    run_powershell: Optional[bool] = None

class ScanRequest(BaseModel):
    target: str = "localhost"
    run_nmap: Optional[bool] = None
    run_lynis: Optional[bool] = None
    run_powershell: Optional[bool] = None
    auto_detect_os: bool = True
    scan_options: Optional[Dict[str, bool]] = None

class ScanResult(BaseModel):
    scan_id: str
    timestamp: datetime
    target: str
    platform: str
    scan_status: Dict[str, ScanStatus]
    system_info: Optional[Dict[str, Any]] = None
    network: Dict[str, Any] = Field(default_factory=dict)
    packages: Dict[str, Any] = Field(default_factory=dict)
    security: Dict[str, Any] = Field(default_factory=dict)
    services: Optional[List[Dict[str, Any]]] = None
    services_count: Optional[int] = None
    errors: Optional[Dict[str, str]] = None
    report_file: Optional[str] = None

class ScanHistoryItem(BaseModel):
    scan_id: str
    timestamp: datetime
    target: str
    scan_status: Dict[str, ScanStatus]
    report_file: str
    error: Optional[str] = None

class ScanResponse(BaseModel):
    success: bool
    scan_id: str
    timestamp: datetime
    target: str
    platform: str
    scan_status: Dict[str, ScanStatus]
    report_file: Optional[str] = None
    errors: Optional[Dict[str, str]] = None

class ScanHistoryResponse(BaseModel):
    success: bool
    data: List[ScanHistoryItem]
    total: int 