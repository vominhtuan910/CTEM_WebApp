from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from src.database import get_db
from src.models.asset_models import Asset
from src.models.scan_models import NmapScan
from src.models.vulnerability_models import OpenVasScan, Finding
from datetime import datetime
import json


class AssetService:
    def __init__(self):
        pass

    async def create_asset_from_scan(self, host_info: Dict, db: Session) -> Asset:
        """
        Create or update asset from Nmap scan results
        Args:
            host_info: Host information from Nmap scan
            db: Database session
        Returns:
            Asset object
        """
        try:
            # Check if asset already exists
            existing_asset = db.query(Asset).filter(Asset.ip == host_info["ip"]).first()

            if existing_asset:
                # Update existing asset
                existing_asset.hostname = host_info.get(
                    "hostname", existing_asset.hostname
                )
                if host_info.get("os"):
                    # Handle both string and dict formats for OS info
                    if isinstance(host_info["os"], str):
                        existing_asset.os = host_info["os"]
                    else:
                        existing_asset.os = host_info["os"].get(
                            "name", existing_asset.os
                        )
                db.commit()
                db.refresh(existing_asset)
                return existing_asset
            else:
                # Create new asset
                # Handle both string and dict formats for OS info
                os_info = host_info.get("os", "Unknown")
                if isinstance(os_info, str):
                    os_name = os_info
                else:
                    os_name = os_info.get("name", "Unknown")

                new_asset = Asset(
                    ip=host_info["ip"],
                    hostname=host_info.get("hostname"),
                    os=os_name,
                    created_at=datetime.utcnow(),
                )
                db.add(new_asset)
                db.commit()
                db.refresh(new_asset)
                return new_asset

        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to create/update asset: {str(e)}")

    async def save_nmap_scan(
        self, asset_id: int, scan_data: Dict, db: Session
    ) -> NmapScan:
        """
        Save Nmap scan results to database
        Args:
            asset_id: Asset ID
            scan_data: Scan data from Nmap
            db: Database session
        Returns:
            NmapScan object
        """
        try:
            nmap_scan = NmapScan(
                asset_id=asset_id,
                scan_date=datetime.utcnow(),
                ports=scan_data.get("ports", []),
                os=scan_data.get("os", {}).get("name"),
            )

            db.add(nmap_scan)
            db.commit()
            db.refresh(nmap_scan)
            return nmap_scan

        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to save Nmap scan: {str(e)}")

    async def save_openvas_scan(
        self, asset_id: int, scan_data: Dict, db: Session
    ) -> OpenVasScan:
        """
        Save OpenVAS scan results to database
        Args:
            asset_id: Asset ID
            scan_data: Scan data from OpenVAS
            db: Database session
        Returns:
            OpenVasScan object
        """
        try:
            openvas_scan = OpenVasScan(
                asset_id=asset_id,
                scan_date=datetime.utcnow(),
                report_xml=scan_data.get("xml_content", ""),
            )

            db.add(openvas_scan)
            db.commit()
            db.refresh(openvas_scan)

            # Save findings if present
            if "findings" in scan_data:
                for finding_data in scan_data["findings"]:
                    await self.save_finding(openvas_scan.id, finding_data, db)

            return openvas_scan

        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to save OpenVAS scan: {str(e)}")

    async def save_finding(
        self, openvas_scan_id: int, finding_data: Dict, db: Session
    ) -> Finding:
        """
        Save finding to database
        Args:
            openvas_scan_id: OpenVAS scan ID
            finding_data: Finding data
            db: Database session
        Returns:
            Finding object
        """
        try:
            finding = Finding(
                openvas_scan_id=openvas_scan_id,
                cve_id=finding_data.get("cve_id", ""),
                title=finding_data.get("title", ""),
                severity=finding_data.get("severity", ""),
                cvss_score=finding_data.get("cvss_score", 0.0),
                status=finding_data.get("status", "NOT_VALIDATED"),
                exploit_command=finding_data.get("exploit_command"),
            )

            db.add(finding)
            db.commit()
            db.refresh(finding)
            return finding

        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to save finding: {str(e)}")

    async def get_all_assets(self, db: Session) -> List[Asset]:
        """Get all assets from database"""
        try:
            return db.query(Asset).all()
        except Exception as e:
            raise Exception(f"Failed to get assets: {str(e)}")

    async def get_asset_by_id(self, asset_id: int, db: Session) -> Optional[Asset]:
        """Get asset by ID"""
        try:
            return db.query(Asset).filter(Asset.id == asset_id).first()
        except Exception as e:
            raise Exception(f"Failed to get asset: {str(e)}")

    async def get_asset_by_ip(self, ip: str, db: Session) -> Optional[Asset]:
        """Get asset by IP address"""
        try:
            return db.query(Asset).filter(Asset.ip == ip).first()
        except Exception as e:
            raise Exception(f"Failed to get asset: {str(e)}")

    async def get_assets_with_vulnerabilities(self, db: Session) -> List[Dict]:
        """Get assets with their vulnerability counts"""
        try:
            assets = db.query(Asset).all()
            assets_with_vulns = []

            for asset in assets:
                # Count total findings
                total_findings = 0
                high_severity_count = 0
                critical_severity_count = 0

                for openvas_scan in asset.openvas_scans:
                    scan_findings = len(openvas_scan.findings)
                    total_findings += scan_findings

                    for finding in openvas_scan.findings:
                        if finding.severity == "Critical":
                            critical_severity_count += 1
                        elif finding.severity == "High":
                            high_severity_count += 1

                asset_data = {
                    "id": str(asset.id),  # Convert to string for frontend compatibility
                    "hostname": asset.hostname or "",
                    "ip_address": asset.ip,
                    "ip_addresses": [asset.ip],  # For now, single IP as array
                    "status": "active",  # Default status since we removed the column
                    "health_score": None,  # Not available in simple schema
                    "issues_count": total_findings,  # Calculate from findings
                    "labels": [],  # Not available in simple schema
                    "agent_status": "not_installed",  # Default value
                    "os_name": asset.os or "Unknown",
                    "os_version": "",  # Not available in simple schema
                    "os_architecture": "",  # Not available in simple schema
                    "os_build_number": "",  # Not available in simple schema
                    "os_last_boot_time": "",  # Not available in simple schema
                    "confidentiality": 1,  # Default value
                    "integrity": 1,  # Default value
                    "availability": 1,  # Default value
                    "department": None,  # Not available in simple schema
                    "location": None,  # Not available in simple schema
                    "owner": None,  # Not available in simple schema
                    "created_at": asset.created_at.isoformat()
                    if asset.created_at
                    else None,
                    "updated_at": asset.created_at.isoformat()  # Use created_at as updated_at
                    if asset.created_at
                    else None,
                    "services": [],  # TODO: Add services relationship
                    "applications": [],  # TODO: Add applications relationship
                    "total_findings": total_findings,
                    "critical_findings": critical_severity_count,
                    "high_findings": high_severity_count,
                    "last_scan": None,
                }

                # Get last scan date
                if asset.openvas_scans:
                    last_scan = max(asset.openvas_scans, key=lambda x: x.scan_date)
                    asset_data["last_scan"] = last_scan.scan_date.isoformat()
                elif asset.nmap_scans:
                    last_scan = max(asset.nmap_scans, key=lambda x: x.scan_date)
                    asset_data["last_scan"] = last_scan.scan_date.isoformat()

                assets_with_vulns.append(asset_data)

            return assets_with_vulns

        except Exception as e:
            raise Exception(f"Failed to get assets with vulnerabilities: {str(e)}")

    async def create_asset(self, asset_data: Dict, db: Session) -> Asset:
        """Create a new asset"""
        try:
            # Check if asset with this IP already exists
            existing_asset = (
                db.query(Asset).filter(Asset.ip == asset_data.get("ipAddress")).first()
            )
            if existing_asset:
                raise Exception(
                    f"Asset with IP {asset_data.get('ipAddress')} already exists"
                )

            # Extract OS information (simplified)
            os_info = asset_data.get("os", {})
            os_name = "Unknown"
            if isinstance(os_info, dict):
                os_name = os_info.get("name", "Unknown")
            elif os_info:
                os_name = str(os_info)

            new_asset = Asset(
                ip=asset_data.get("ipAddress"),
                hostname=asset_data.get("hostname"),
                os=os_name,
                created_at=datetime.utcnow(),
            )

            db.add(new_asset)
            db.commit()
            db.refresh(new_asset)
            return new_asset

        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to create asset: {str(e)}")

    async def update_asset(
        self, asset_id: int, asset_data: Dict, db: Session
    ) -> Optional[Asset]:
        """Update an existing asset"""
        try:
            asset = db.query(Asset).filter(Asset.id == asset_id).first()
            if not asset:
                return None

            # Update basic fields if provided
            if "hostname" in asset_data and asset_data["hostname"] is not None:
                asset.hostname = asset_data["hostname"]
            if "ipAddress" in asset_data and asset_data["ipAddress"] is not None:
                # Check if new IP conflicts with existing asset
                existing_asset = (
                    db.query(Asset)
                    .filter(Asset.ip == asset_data["ipAddress"], Asset.id != asset_id)
                    .first()
                )
                if existing_asset:
                    raise Exception(
                        f"Asset with IP {asset_data['ipAddress']} already exists"
                    )
                asset.ip = asset_data["ipAddress"]

            # Handle OS information (simplified)
            if "os" in asset_data and asset_data["os"] is not None:
                os_info = asset_data["os"]
                if isinstance(os_info, dict):
                    asset.os = os_info.get("name", asset.os)
                else:
                    asset.os = str(os_info)

            db.commit()
            db.refresh(asset)
            return asset

        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to update asset: {str(e)}")

    async def delete_asset(self, asset_id: int, db: Session) -> bool:
        """Delete asset and all related data"""
        try:
            asset = db.query(Asset).filter(Asset.id == asset_id).first()
            if not asset:
                return False

            db.delete(asset)
            db.commit()
            return True

        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to delete asset: {str(e)}")

    async def update_finding_status(
        self,
        finding_id: int,
        status: str,
        exploit_command: str = None,
        db: Session = None,
    ) -> bool:
        """Update finding validation status"""
        try:
            finding = db.query(Finding).filter(Finding.id == finding_id).first()
            if not finding:
                return False

            finding.status = status
            if exploit_command:
                finding.exploit_command = exploit_command

            db.commit()
            return True

        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to update finding status: {str(e)}")


# Global instance
asset_service = AssetService()
