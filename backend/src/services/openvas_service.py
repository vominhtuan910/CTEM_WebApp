import os
from typing import Dict, List, Optional
from datetime import datetime
import xml.etree.ElementTree as ET

try:
    from gvm.connections import UnixSocketConnection, TLSConnection
    from gvm.protocols.gmp import GMP
    from gvm.transforms import EtreeTransform

    GVM_AVAILABLE = True
except ImportError:
    GVM_AVAILABLE = False
    print("⚠️ python-gvm not available. OpenVAS integration will be disabled.")


class OpenVASService:
    def __init__(self):
        # Remote connection settings (for connecting to Kali VM from Windows)
        self.host = os.getenv("OPENVAS_HOST", "localhost")
        self.port = int(os.getenv("OPENVAS_PORT", "9390"))
        self.socket_path = os.getenv("OPENVAS_SOCKET", "/var/run/gvmd.sock")
        self.username = os.getenv("OPENVAS_USERNAME", "admin")
        self.password = os.getenv("OPENVAS_PASSWORD", "your-password")
        self.config_id = os.getenv(
            "OPENVAS_CONFIG_ID", "daba56c8-73ec-11df-a475-002264764cea"
        )  # Full and fast

    def _get_connection(self):
        """Get the appropriate connection type for OpenVAS"""
        if not GVM_AVAILABLE:
            raise Exception("python-gvm library not available")

        # Prioritize remote TLS connection for Windows to Kali VM setup
        if self.host != "localhost" or not os.path.exists(self.socket_path):
            print(f"🔗 Connecting to OpenVAS at {self.host}:{self.port}")
            return TLSConnection(hostname=self.host, port=self.port)
        else:
            # Use Unix socket for local connections (Linux)
            print(f"🔗 Connecting to OpenVAS via Unix socket: {self.socket_path}")
            return UnixSocketConnection(path=self.socket_path)

    def _create_gmp_context(self):
        """Create a GMP context manager for proper resource management"""
        connection = self._get_connection()
        transform = EtreeTransform()
        return GMP(connection=connection, transform=transform)

    def _authenticate_gmp(self, gmp):
        """Authenticate GMP connection"""
        gmp.authenticate(self.username, self.password)
        print("✅ OpenVAS connection established successfully")

    async def _execute_with_gmp(self, operation):
        """
        Execute an operation with authenticated GMP connection
        This eliminates the connection duplication across all methods
        """
        try:
            with self._create_gmp_context() as gmp:
                self._authenticate_gmp(gmp)
                return await operation(gmp)
        except Exception as e:
            print(f"❌ OpenVAS connection failed: {str(e)}")
            return {"success": False, "error": str(e)}

    def _extract_id_from_response(self, response, resource_type="resource"):
        """Extract ID from OpenVAS response (works for targets, tasks, etc.)"""
        resource_id = None
        if hasattr(response, "attrib") and "id" in response.attrib:
            resource_id = response.attrib["id"]
        elif hasattr(response, "get"):
            resource_id = response.get("id")
        elif isinstance(response, dict):
            resource_id = response.get("id")

        if not resource_id:
            raise Exception(f"Failed to create {resource_type}. Response: {response}")

        return resource_id

    def _get_default_port_list(self, gmp):
        """Get default port list ID"""
        port_lists = gmp.get_port_lists()

        # Look for a suitable port list
        for port_list in port_lists.xpath("port_list"):
            name = port_list.find("name").text
            if "All IANA" in name or "OpenVAS Default" in name:
                return port_list.get("id")

        # If no suitable port list found, use the first available one
        if len(port_lists.xpath("port_list")) > 0:
            first_port_list = port_lists.xpath("port_list")[0]
            return first_port_list.get("id")

        raise Exception("No port lists available in OpenVAS")

    def _get_default_scanner(self, gmp):
        """Get default scanner ID"""
        scanners = gmp.get_scanners()

        # Look for OpenVAS Default scanner
        for scanner in scanners.xpath("scanner"):
            name = scanner.find("name").text
            if "OpenVAS Default" in name or "OpenVAS Scanner" in name:
                return scanner.get("id")

        # If no default scanner found, use the first available one
        if len(scanners.xpath("scanner")) > 0:
            first_scanner = scanners.xpath("scanner")[0]
            return first_scanner.get("id")

        raise Exception("No scanners available in OpenVAS")

    async def create_scan_task(
        self, target_ip: str, task_name: Optional[str] = None
    ) -> Dict:
        """
        Create an OpenVAS scan task for a target IP
        Args:
            target_ip: IP address to scan
            task_name: Optional custom task name
        Returns:
            Dictionary with task information
        """
        if not GVM_AVAILABLE:
            return {"success": False, "error": "OpenVAS (python-gvm) is not available."}

        async def _create_task_operation(gmp):
            # Generate task name if not provided
            if not task_name:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                task_name_final = f"CTEM_Scan_{target_ip}_{timestamp}"
            else:
                task_name_final = task_name

            # Create target
            target_name = (
                f"Target_{target_ip}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            )
            print(f"🎯 Creating target: {target_name} for IP: {target_ip}")

            port_list_id = self._get_default_port_list(gmp)
            target_response = gmp.create_target(
                name=target_name,
                hosts=[target_ip],
                port_list_id=port_list_id,
            )
            target_id = self._extract_id_from_response(target_response, "target")
            print(f"✅ Target created successfully with ID: {target_id}")

            # Create task
            print(f"📋 Creating task: {task_name_final}")
            scanner_id = self._get_default_scanner(gmp)
            task_response = gmp.create_task(
                name=task_name_final,
                config_id=self.config_id,
                target_id=target_id,
                scanner_id=scanner_id,
            )
            task_id = self._extract_id_from_response(task_response, "task")
            print(f"✅ Task created successfully with ID: {task_id}")

            return {
                "success": True,
                "task_id": task_id,
                "target_id": target_id,
                "task_name": task_name_final,
                "target_ip": target_ip,
                "created_at": datetime.now().isoformat(),
            }

        return await self._execute_with_gmp(_create_task_operation)

    async def start_scan(self, task_id: str) -> Dict:
        """Start an OpenVAS scan task"""
        if not GVM_AVAILABLE:
            return {"success": False, "error": "OpenVAS (python-gvm) is not available."}

        async def _start_scan_operation(gmp):
            print(f"🚀 Starting scan for task ID: {task_id}")
            # Start the scan task
            try:
                gmp.start_task(task_id)
                print(f"✅ Scan started successfully for task ID: {task_id}")
            except Exception as e:
                print(f"❌ Failed to start scan for task ID {task_id}: {str(e)}")
                raise

            return {
                "success": True,
                "task_id": task_id,
                "status": "started",
                "started_at": datetime.now().isoformat(),
            }

        return await self._execute_with_gmp(_start_scan_operation)

    async def get_scan_status(self, task_id: str) -> Dict:
        """Get the status of an OpenVAS scan"""
        if not GVM_AVAILABLE:
            return {"success": False, "error": "OpenVAS (python-gvm) is not available."}

        async def _get_status_operation(gmp):
            # Get task status
            task = gmp.get_task(task_id=task_id)

            status_elem = task.find(".//status")
            progress_elem = task.find(".//progress")

            status = status_elem.text if status_elem is not None else "Unknown"
            progress = progress_elem.text if progress_elem is not None else "0"

            return {
                "success": True,
                "task_id": task_id,
                "status": status,
                "progress": int(progress) if progress.isdigit() else 0,
                "checked_at": datetime.now().isoformat(),
            }

        return await self._execute_with_gmp(_get_status_operation)

    async def get_scan_report(self, task_id: str, save_xml: bool = True) -> Dict:
        """Get the scan report when completed"""
        if not GVM_AVAILABLE:
            return {"success": False, "error": "OpenVAS (python-gvm) is not available."}

        async def _get_report_operation(gmp):
            # Get task information
            task = gmp.get_task(task_id=task_id)

            status_elem = task.find(".//status")
            status = status_elem.text if status_elem is not None else "Unknown"

            if status != "Done":
                return {
                    "success": False,
                    "status": status,
                    "message": f"Scan not completed yet. Current status: {status}",
                }

            # Get report ID
            report_elem = task.find(".//last_report/report")
            if report_elem is None:
                return {
                    "success": False,
                    "error": "No report found for completed task",
                }

            report_id = report_elem.get("id")

            # Get detailed report
            report = gmp.get_report(report_id=report_id, details=True)

            # Parse findings
            findings = self._parse_openvas_report(report)

            result = {
                "success": True,
                "task_id": task_id,
                "report_id": report_id,
                "status": status,
                "findings_count": len(findings),
                "findings": findings,
                "generated_at": datetime.now().isoformat(),
            }

            if save_xml:
                xml_path = self._save_report_xml(task_id, report)
                result["xml_path"] = xml_path

            return result

        return await self._execute_with_gmp(_get_report_operation)

    def _parse_openvas_report(self, report_xml) -> List[Dict]:
        """Parse OpenVAS XML report and extract findings"""
        findings = []

        try:
            # Parse XML
            if isinstance(report_xml, str):
                root = ET.fromstring(report_xml)
            else:
                root = report_xml

            # Find all results
            for result in root.findall(".//result"):
                try:
                    finding = self._extract_finding_info(result)
                    if finding:
                        findings.append(finding)
                except Exception as e:
                    print(f"Error parsing finding: {str(e)}")
                    continue

        except Exception as e:
            print(f"Error parsing OpenVAS report: {str(e)}")

        return findings

    def _extract_finding_info(self, result_elem) -> Optional[Dict]:
        """Extract finding information from result element"""
        try:
            # Get basic info
            finding_id = result_elem.get("id", "")

            # Get NVT (Network Vulnerability Test) info
            nvt_elem = result_elem.find("nvt")
            if nvt_elem is None:
                return None

            nvt_name = nvt_elem.findtext("name", "Unknown")
            cve_elem = nvt_elem.find('.//ref[@type="cve"]')
            cve_id = cve_elem.get("id", "") if cve_elem is not None else ""

            # Get severity and CVSS
            severity_elem = result_elem.find("severity")
            severity_score = (
                float(severity_elem.text)
                if severity_elem is not None and severity_elem.text
                else 0.0
            )

            # Map severity score to level
            severity_level = self._map_severity_level(severity_score)

            # Get description
            description_elem = result_elem.find("description")
            description = description_elem.text if description_elem is not None else ""

            # Get host info
            host_elem = result_elem.find("host")
            host_ip = host_elem.text if host_elem is not None else ""

            # Get port info
            port_elem = result_elem.find("port")
            port = port_elem.text if port_elem is not None else ""

            return {
                "id": finding_id,
                "cve_id": cve_id,
                "title": nvt_name,
                "severity": severity_level,
                "cvss_score": severity_score,
                "description": description[:500]
                + (
                    "..." if len(description) > 500 else ""
                ),  # Truncate long descriptions
                "host_ip": host_ip,
                "port": port,
                "status": "NOT_VALIDATED",
                "discovered_at": datetime.now().isoformat(),
            }

        except Exception as e:
            print(f"Error extracting finding info: {str(e)}")
            return None

    def _map_severity_level(self, score: float) -> str:
        """Map CVSS score to severity level"""
        if score >= 9.0:
            return "Critical"
        elif score >= 7.0:
            return "High"
        elif score >= 4.0:
            return "Medium"
        elif score > 0.0:
            return "Low"
        else:
            return "Info"

    def _save_report_xml(self, task_id: str, report_xml) -> str:
        """Save OpenVAS report XML to file"""
        try:
            # Create reports directory
            report_dir = "output/reports"
            os.makedirs(report_dir, exist_ok=True)

            # Generate filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"openvas_report_{task_id}_{timestamp}.xml"
            filepath = os.path.join(report_dir, filename)

            # Convert to string if needed
            if hasattr(report_xml, "getroot"):
                xml_content = ET.tostring(report_xml.getroot(), encoding="unicode")
            elif isinstance(report_xml, str):
                xml_content = report_xml
            else:
                xml_content = ET.tostring(report_xml, encoding="unicode")

            # Save XML content
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(xml_content)

            return filepath

        except Exception as e:
            print(f"Error saving report XML: {str(e)}")
            return ""

    # Mock methods removed: returning explicit errors when OpenVAS is unavailable


# Global instance
openvas_service = OpenVASService()
