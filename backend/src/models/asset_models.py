from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class AssetStatus(str, Enum):
    active = "active"
    inactive = "inactive"

class AgentStatus(str, Enum):
    installed = "installed"
    not_installed = "not_installed"
    error = "error"

class AssetBase(BaseModel):
    hostname: str
    name: Optional[str] = None
    ip_address: str
    ip_addresses: List[str] = Field(default_factory=list)
    status: AssetStatus = AssetStatus.active
    health_score: Optional[float] = None
    issues_count: int = 0
    labels: List[str] = Field(default_factory=list)
    agent_status: AgentStatus = AgentStatus.not_installed
    
    # OS details
    os_name: Optional[str] = None
    os_version: Optional[str] = None
    os_architecture: Optional[str] = None
    os_build_number: Optional[str] = None
    os_last_boot_time: Optional[datetime] = None
    os_platform: Optional[str] = None
    os_kernel_version: Optional[str] = None
    
    # Priority/risk info
    confidentiality: int = 1
    integrity: int = 1
    availability: int = 1
    
    # Additional fields
    department: Optional[str] = None
    location: Optional[str] = None
    owner: Optional[str] = None

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    hostname: Optional[str] = None
    name: Optional[str] = None
    ip_address: Optional[str] = None
    ip_addresses: Optional[List[str]] = None
    status: Optional[AssetStatus] = None
    health_score: Optional[float] = None
    issues_count: Optional[int] = None
    labels: Optional[List[str]] = None
    agent_status: Optional[AgentStatus] = None
    
    # OS details
    os_name: Optional[str] = None
    os_version: Optional[str] = None
    os_architecture: Optional[str] = None
    os_build_number: Optional[str] = None
    os_last_boot_time: Optional[datetime] = None
    os_platform: Optional[str] = None
    os_kernel_version: Optional[str] = None
    
    # Priority/risk info
    confidentiality: Optional[int] = None
    integrity: Optional[int] = None
    availability: Optional[int] = None
    
    # Additional fields
    department: Optional[str] = None
    location: Optional[str] = None
    owner: Optional[str] = None

class Service(BaseModel):
    id: Optional[str] = None
    name: str
    display_name: Optional[str] = None
    status: Optional[str] = None
    port: Optional[int] = None
    protocol: Optional[str] = None
    version: Optional[str] = None
    description: Optional[str] = None
    service_type: Optional[str] = None

class Application(BaseModel):
    id: Optional[str] = None
    name: str
    version: Optional[str] = None
    publisher: Optional[str] = None
    install_date: Optional[datetime] = None
    type: Optional[str] = None
    description: Optional[str] = None
    path: Optional[str] = None

class Asset(AssetBase):
    id: str
    last_scan: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    services: List[Service] = Field(default_factory=list)
    applications: List[Application] = Field(default_factory=list)

    class Config:
        from_attributes = True

class AssetResponse(BaseModel):
    success: bool
    data: Optional[Asset] = None
    message: Optional[str] = None

class AssetsResponse(BaseModel):
    success: bool
    data: List[Asset]
    total: int
    message: Optional[str] = None

class AssetFilters(BaseModel):
    search: Optional[str] = None
    status: Optional[AssetStatus] = None
    labels: Optional[List[str]] = None 