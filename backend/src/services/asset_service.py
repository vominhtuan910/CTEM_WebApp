import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from ..models.asset_models import (
    Asset, AssetCreate, AssetUpdate, AssetFilters, 
    Service, Application, AssetStatus, AgentStatus
)

class AssetService:
    """Asset service with mock data storage (database removed as requested)"""
    
    def __init__(self):
        # Mock data storage
        self._assets: Dict[str, Asset] = {}
        self._load_mock_data()
    
    def _load_mock_data(self):
        """Load some mock assets for testing"""
        mock_assets = [
            {
                "id": str(uuid.uuid4()),
                "hostname": "server-01",
                "name": "Production Server 1",
                "ip_address": "192.168.1.100",
                "ip_addresses": ["192.168.1.100", "10.0.0.100"],
                "status": AssetStatus.active,
                "health_score": 85.5,
                "issues_count": 3,
                "labels": ["production", "web-server"],
                "agent_status": AgentStatus.installed,
                "os_name": "Ubuntu",
                "os_version": "22.04 LTS",
                "os_architecture": "x86_64",
                "os_platform": "linux",
                "confidentiality": 3,
                "integrity": 2,
                "availability": 3,
                "department": "IT",
                "location": "Data Center A",
                "owner": "System Admin",
                "last_scan": datetime.now(),
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
                "services": [
                    Service(
                        id=str(uuid.uuid4()),
                        name="nginx",
                        display_name="Nginx Web Server",
                        status="running",
                        port=80,
                        protocol="tcp",
                        version="1.18.0",
                        service_type="network_service"
                    ),
                    Service(
                        id=str(uuid.uuid4()),
                        name="ssh",
                        display_name="OpenSSH Server",
                        status="running",
                        port=22,
                        protocol="tcp",
                        version="8.9p1",
                        service_type="network_service"
                    )
                ],
                "applications": [
                    Application(
                        id=str(uuid.uuid4()),
                        name="Docker",
                        version="24.0.5",
                        publisher="Docker Inc.",
                        install_date=datetime.now(),
                        type="container_platform"
                    )
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "hostname": "workstation-01",
                "name": "Developer Workstation",
                "ip_address": "192.168.1.101",
                "ip_addresses": ["192.168.1.101"],
                "status": AssetStatus.active,
                "health_score": 92.0,
                "issues_count": 1,
                "labels": ["development", "workstation"],
                "agent_status": AgentStatus.installed,
                "os_name": "Windows 11",
                "os_version": "22H2",
                "os_architecture": "x64",
                "os_platform": "win32",
                "confidentiality": 2,
                "integrity": 2,
                "availability": 1,
                "department": "Development",
                "location": "Office Building B",
                "owner": "John Developer",
                "last_scan": datetime.now(),
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
                "services": [
                    Service(
                        id=str(uuid.uuid4()),
                        name="Visual Studio Code",
                        display_name="VS Code",
                        status="running",
                        service_type="application"
                    )
                ],
                "applications": [
                    Application(
                        id=str(uuid.uuid4()),
                        name="Visual Studio Code",
                        version="1.85.0",
                        publisher="Microsoft Corporation",
                        install_date=datetime.now(),
                        type="development_tool"
                    ),
                    Application(
                        id=str(uuid.uuid4()),
                        name="Node.js",
                        version="18.17.0",
                        publisher="Node.js Foundation",
                        install_date=datetime.now(),
                        type="runtime"
                    )
                ]
            }
        ]
        
        for asset_data in mock_assets:
            asset = Asset(**asset_data)
            self._assets[asset.id] = asset
    
    async def get_all_assets(self, filters: Optional[AssetFilters] = None) -> List[Asset]:
        """Get all assets with optional filtering"""
        assets = list(self._assets.values())
        
        if filters:
            if filters.search:
                search_term = filters.search.lower()
                assets = [
                    asset for asset in assets
                    if (search_term in asset.hostname.lower() or
                        search_term in asset.ip_address.lower() or
                        (asset.name and search_term in asset.name.lower()))
                ]
            
            if filters.status:
                assets = [asset for asset in assets if asset.status == filters.status]
            
            if filters.labels:
                assets = [
                    asset for asset in assets
                    if any(label in asset.labels for label in filters.labels)
                ]
        
        return assets
    
    async def get_asset_by_id(self, asset_id: str) -> Optional[Asset]:
        """Get asset by ID"""
        return self._assets.get(asset_id)
    
    async def create_asset(self, asset_data: AssetCreate) -> Asset:
        """Create a new asset"""
        asset_id = str(uuid.uuid4())
        now = datetime.now()
        
        asset = Asset(
            id=asset_id,
            **asset_data.dict(),
            created_at=now,
            updated_at=now
        )
        
        self._assets[asset_id] = asset
        return asset
    
    async def update_asset(self, asset_id: str, asset_data: AssetUpdate) -> Optional[Asset]:
        """Update an existing asset"""
        if asset_id not in self._assets:
            return None
        
        asset = self._assets[asset_id]
        
        # Update only provided fields
        update_data = asset_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(asset, field, value)
        
        asset.updated_at = datetime.now()
        return asset
    
    async def delete_asset(self, asset_id: str) -> bool:
        """Delete an asset"""
        if asset_id in self._assets:
            del self._assets[asset_id]
            return True
        return False
    
    async def update_asset_from_scan(self, asset_id: str, scan_data: Dict[str, Any]) -> Optional[Asset]:
        """Update asset from scan results"""
        if asset_id not in self._assets:
            return None
        
        asset = self._assets[asset_id]
        
        # Update scan-related fields
        asset.last_scan = datetime.now()
        
        if 'health_score' in scan_data:
            asset.health_score = scan_data['health_score']
        
        if 'issues_count' in scan_data:
            asset.issues_count = scan_data['issues_count']
        
        if 'os_name' in scan_data:
            asset.os_name = scan_data['os_name']
        
        if 'os_version' in scan_data:
            asset.os_version = scan_data['os_version']
        
        if 'os_architecture' in scan_data:
            asset.os_architecture = scan_data['os_architecture']
        
        if 'labels' in scan_data:
            # Merge labels
            existing_labels = set(asset.labels)
            new_labels = set(scan_data['labels'])
            asset.labels = list(existing_labels.union(new_labels))
        
        if 'services' in scan_data:
            asset.services = [
                Service(**service_data) for service_data in scan_data['services']
            ]
        
        if 'applications' in scan_data:
            asset.applications = [
                Application(**app_data) for app_data in scan_data['applications']
            ]
        
        asset.updated_at = datetime.now()
        return asset 