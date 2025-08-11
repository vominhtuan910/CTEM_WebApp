#!/usr/bin/env python3
"""
Script to parse OpenVAS XML reports and populate the database tables.
This script will parse the two OpenVAS reports and insert data into:
- assets table (if assets don't exist)
- openvas_scans table
- findings table
"""

import os
import sys
import asyncio
from datetime import datetime, timezone
from typing import Dict, Optional

# Add the src directory to the path so we can import modules
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from src.database import get_db, DATABASE_AVAILABLE
from src.models.asset_models import Asset
from src.models.vulnerability_models import OpenVasScan, Finding
from src.services.openvas_parser_service import OpenVASParserService
from src.services.asset_service import AssetService
from sqlalchemy.orm import Session


class OpenVASReportProcessor:
    """Process OpenVAS XML reports and populate database"""

    def __init__(self):
        self.parser_service = OpenVASParserService()
        self.asset_service = AssetService()
        self.report_files = [
            "output/scans/openvas_scan_192.168.56.101_report.xml",
            "output/scans/openvas_scan_192.168.56.102_report.xml",
        ]

    async def process_reports(self):
        """Main method to process all OpenVAS reports"""
        if not DATABASE_AVAILABLE:
            print(
                "❌ Database is not available. Please check your database connection."
            )
            return False

        print("🚀 Starting OpenVAS report processing...")

        # Get database session
        db = next(get_db())
        if db is None:
            print("❌ Failed to get database session")
            return False

        try:
            total_scans = 0
            total_findings = 0

            for report_file in self.report_files:
                if not os.path.exists(report_file):
                    print(f"⚠️ Report file not found: {report_file}")
                    continue

                print(f"\n📄 Processing report: {report_file}")

                # Extract IP from filename
                ip_address = self._extract_ip_from_filename(report_file)
                if not ip_address:
                    print(
                        f"❌ Could not extract IP address from filename: {report_file}"
                    )
                    continue

                # Process single report
                scan_count, finding_count = await self._process_single_report(
                    report_file, ip_address, db
                )

                total_scans += scan_count
                total_findings += finding_count

                print(
                    f"✅ Processed {report_file}: {scan_count} scans, {finding_count} findings"
                )

            print(f"\n🎉 Processing complete!")
            print(f"📊 Total scans created: {total_scans}")
            print(f"📊 Total findings created: {total_findings}")

            return True

        except Exception as e:
            print(f"❌ Error processing reports: {str(e)}")
            db.rollback()
            return False
        finally:
            db.close()

    async def _process_single_report(
        self, report_file: str, ip_address: str, db: Session
    ) -> tuple:
        """Process a single OpenVAS report file"""
        try:
            # 1. Ensure asset exists
            asset = await self._ensure_asset_exists(ip_address, db)
            if not asset:
                print(f"❌ Failed to create/find asset for IP: {ip_address}")
                return 0, 0

            # 2. Parse the XML report
            threats = self.parser_service._parse_single_report(report_file)
            if not threats:
                print(f"⚠️ No threats found in report: {report_file}")
                return 0, 0

            # 3. Extract scan metadata from the report
            scan_metadata = self._extract_scan_metadata(report_file)

            # 4. Create OpenVAS scan record
            openvas_scan = await self._create_openvas_scan(
                asset.id, report_file, scan_metadata, db
            )

            # 5. Create findings
            findings_created = 0
            for threat in threats:
                try:
                    await self._create_finding(openvas_scan.id, threat, db)
                    findings_created += 1
                except Exception as e:
                    print(f"⚠️ Failed to create finding: {str(e)}")
                    continue

            return 1, findings_created

        except Exception as e:
            print(f"❌ Error processing report {report_file}: {str(e)}")
            return 0, 0

    async def _ensure_asset_exists(
        self, ip_address: str, db: Session
    ) -> Optional[Asset]:
        """Ensure asset exists in database, create if not found"""
        try:
            # Check if asset already exists
            existing_asset = db.query(Asset).filter(Asset.ip == ip_address).first()
            if existing_asset:
                print(f"📍 Found existing asset: {ip_address}")
                return existing_asset

            # Create new asset
            new_asset = Asset(
                ip=ip_address,
                hostname=f"host-{ip_address.replace('.', '-')}",
                status="active",
            )

            db.add(new_asset)
            db.commit()
            db.refresh(new_asset)

            print(f"✅ Created new asset: {ip_address} (ID: {new_asset.id})")
            return new_asset

        except Exception as e:
            print(f"❌ Error ensuring asset exists: {str(e)}")
            db.rollback()
            return None

    async def _create_openvas_scan(
        self, asset_id: int, report_file: str, scan_metadata: Dict, db: Session
    ) -> OpenVasScan:
        """Create OpenVAS scan record"""
        try:
            # Read the XML content
            with open(report_file, "r", encoding="utf-8") as f:
                xml_content = f.read()

            openvas_scan = OpenVasScan(
                asset_id=asset_id,
                scan_date=scan_metadata.get("scan_date", datetime.now(timezone.utc)),
                report_xml=xml_content,
                status="completed",
                scan_duration=scan_metadata.get("scan_duration"),
                scan_config=scan_metadata.get("scan_config", "Full and fast"),
            )

            db.add(openvas_scan)
            db.commit()
            db.refresh(openvas_scan)

            print(f"✅ Created OpenVAS scan record (ID: {openvas_scan.id})")
            return openvas_scan

        except Exception as e:
            print(f"❌ Error creating OpenVAS scan: {str(e)}")
            db.rollback()
            raise

    async def _create_finding(
        self, openvas_scan_id: int, threat_data: Dict, db: Session
    ):
        """Create finding record"""
        try:
            # Map severity to match database constraints
            severity = self._normalize_severity(threat_data.get("severity", "Low"))

            finding = Finding(
                openvas_scan_id=openvas_scan_id,
                cve_id=threat_data.get("cve_references", []) or None,
                title=threat_data.get("title", "Unknown Threat")[
                    :255
                ],  # Ensure title fits
                severity=severity,
                cvss_score=threat_data.get("cvss_score", 0.0),
                status="NOT_VALIDATED",
                discovered_at=datetime.now(timezone.utc),
            )

            db.add(finding)
            db.commit()
            db.refresh(finding)

        except Exception as e:
            print(f"❌ Error creating finding: {str(e)}")
            db.rollback()
            raise

    def _extract_ip_from_filename(self, filename: str) -> Optional[str]:
        """Extract IP address from filename"""
        try:
            # Extract IP from filename like "openvas_scan_192.168.56.101_report.xml"
            parts = filename.split("_")
            for part in parts:
                if "." in part and all(p.isdigit() for p in part.split(".")):
                    return part
            return None
        except Exception:
            return None

    def _extract_scan_metadata(self, report_file: str) -> Dict:
        """Extract scan metadata from XML report"""
        try:
            import xml.etree.ElementTree as ET

            tree = ET.parse(report_file)
            root = tree.getroot()

            # Extract scan date
            scan_date = None
            scan_start_elem = root.find(".//scan_start")
            if scan_start_elem is not None and scan_start_elem.text:
                try:
                    scan_date = datetime.fromisoformat(
                        scan_start_elem.text.replace("Z", "+00:00")
                    )
                except:
                    scan_date = datetime.now(timezone.utc)
            else:
                scan_date = datetime.now(timezone.utc)

            # Try to extract scan duration (if available)
            scan_duration = None
            # This would require parsing scan_start and scan_end times

            return {
                "scan_date": scan_date,
                "scan_duration": scan_duration,
                "scan_config": "Full and fast",  # Default config
            }

        except Exception as e:
            print(f"⚠️ Error extracting scan metadata: {str(e)}")
            return {
                "scan_date": datetime.now(timezone.utc),
                "scan_duration": None,
                "scan_config": "Full and fast",
            }

    def _normalize_severity(self, severity: str) -> str:
        """Normalize severity to match database constraints"""
        severity_map = {
            "Critical": "Critical",
            "High": "High",
            "Medium": "Medium",
            "Low": "Low",
            "Info": "Low",  # Map Info to Low since Info is not in DB constraints
            "Informational": "Low",
        }
        return severity_map.get(severity, "Low")


# Function to run the processor (for standalone execution)
async def run_processor():
    """Run the OpenVAS report processor"""
    print("🔍 OpenVAS Report Parser")
    print("=" * 50)

    processor = OpenVASReportProcessor()
    success = await processor.process_reports()

    if success:
        print("\n✅ All reports processed successfully!")
        return 0
    else:
        print("\n❌ Some reports failed to process")
        return 1


# Only run if script is executed directly
if __name__ == "__main__":
    exit_code = asyncio.run(run_processor())
    sys.exit(exit_code)
