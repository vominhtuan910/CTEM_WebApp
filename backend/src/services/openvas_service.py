import os
from typing import Dict, List, Optional
from datetime import datetime
import xml.etree.ElementTree as ET
from lxml import etree
import asyncio
import json

try:
    from gvm.connections import UnixSocketConnection, TLSConnection
    from gvm.protocols.gmp import Gmp
    from gvm.errors import GvmError
    GVM_AVAILABLE = True
except ImportError:
    GVM_AVAILABLE = False
    print("⚠️ python-gvm not available. OpenVAS integration will be disabled.")

class OpenVASService:
    def __init__(self):
        self.socket_path = os.getenv("OPENVAS_SOCKET", "/var/run/gvmd.sock")
        self.username = os.getenv("OPENVAS_USERNAME", "admin")
        self.password = os.getenv("OPENVAS_PASSWORD", "your-password")
        self.config_id = os.getenv("OPENVAS_CONFIG_ID", "daba56c8-73ec-11df-a475-002264764cea")  # Full and fast
        
    def _connect_gmp(self):
        """Create GMP connection"""
        if not GVM_AVAILABLE:
            raise Exception("python-gvm library not available")
            
        try:
            # Try Unix socket first (Linux)
            if os.path.exists(self.socket_path):
                connection = UnixSocketConnection(path=self.socket_path)
            else:
                # Fallback to TLS connection (for remote or Windows)
                connection = TLSConnection(hostname="localhost", port=9390)
            
            gmp = Gmp(connection)
            gmp.authenticate(self.username, self.password)
            return gmp
            
        except Exception as e:
            raise Exception(f"Failed to connect to OpenVAS: {str(e)}")
    
    async def create_scan_task(self, target_ip: str, task_name: Optional[str] = None) -> Dict:
        """
        Create an OpenVAS scan task for a target IP
        Args:
            target_ip: IP address to scan
            task_name: Optional custom task name
        Returns:
            Dictionary with task information
        """
        if not GVM_AVAILABLE:
            return self._mock_create_task(target_ip, task_name)
            
        try:
            gmp = self._connect_gmp()
            
            # Generate task name if not provided
            if not task_name:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                task_name = f"CTEM_Scan_{target_ip}_{timestamp}"
            
            # Create target
            target_response = gmp.create_target(
                name=f"Target_{target_ip}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                hosts=[target_ip]
            )
            target_id = target_response.get('id')
            
            if not target_id:
                raise Exception("Failed to create target")
            
            # Create task
            task_response = gmp.create_task(
                name=task_name,
                config_id=self.config_id,
                target_id=target_id
            )
            task_id = task_response.get('id')
            
            if not task_id:
                raise Exception("Failed to create task")
            
            return {
                'success': True,
                'task_id': task_id,
                'target_id': target_id,
                'task_name': task_name,
                'target_ip': target_ip,
                'created_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def start_scan(self, task_id: str) -> Dict:
        """Start an OpenVAS scan task"""
        if not GVM_AVAILABLE:
            return self._mock_start_scan(task_id)
            
        try:
            gmp = self._connect_gmp()
            gmp.start_task(task_id)
            
            return {
                'success': True,
                'task_id': task_id,
                'status': 'started',
                'started_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_scan_status(self, task_id: str) -> Dict:
        """Get the status of an OpenVAS scan"""
        if not GVM_AVAILABLE:
            return self._mock_get_status(task_id)
            
        try:
            gmp = self._connect_gmp()
            task = gmp.get_task(task_id=task_id)
            
            status_elem = task.find(".//status")
            progress_elem = task.find(".//progress")
            
            status = status_elem.text if status_elem is not None else "Unknown"
            progress = progress_elem.text if progress_elem is not None else "0"
            
            return {
                'success': True,
                'task_id': task_id,
                'status': status,
                'progress': int(progress) if progress.isdigit() else 0,
                'checked_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_scan_report(self, task_id: str, save_xml: bool = True) -> Dict:
        """Get the scan report when completed"""
        if not GVM_AVAILABLE:
            return self._mock_get_report(task_id, save_xml)
            
        try:
            gmp = self._connect_gmp()
            task = gmp.get_task(task_id=task_id)
            
            status_elem = task.find(".//status")
            status = status_elem.text if status_elem is not None else "Unknown"
            
            if status != "Done":
                return {
                    'success': False,
                    'status': status,
                    'message': f'Scan not completed yet. Current status: {status}'
                }
            
            # Get report ID
            report_elem = task.find(".//last_report/report")
            if report_elem is None:
                return {
                    'success': False,
                    'error': 'No report found for completed task'
                }
            
            report_id = report_elem.get("id")
            
            # Get detailed report
            report = gmp.get_report(report_id=report_id, details=True)
            
            # Parse findings
            findings = self._parse_openvas_report(report)
            
            result = {
                'success': True,
                'task_id': task_id,
                'report_id': report_id,
                'status': status,
                'findings_count': len(findings),
                'findings': findings,
                'generated_at': datetime.now().isoformat()
            }
            
            if save_xml:
                xml_path = self._save_report_xml(task_id, report)
                result['xml_path'] = xml_path
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
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
            finding_id = result_elem.get('id', '')
            
            # Get NVT (Network Vulnerability Test) info
            nvt_elem = result_elem.find('nvt')
            if nvt_elem is None:
                return None
            
            nvt_name = nvt_elem.findtext('name', 'Unknown')
            cve_elem = nvt_elem.find('.//ref[@type="cve"]')
            cve_id = cve_elem.get('id', '') if cve_elem is not None else ''
            
            # Get severity and CVSS
            severity_elem = result_elem.find('severity')
            severity_score = float(severity_elem.text) if severity_elem is not None and severity_elem.text else 0.0
            
            # Map severity score to level
            severity_level = self._map_severity_level(severity_score)
            
            # Get description
            description_elem = result_elem.find('description')
            description = description_elem.text if description_elem is not None else ''
            
            # Get host info
            host_elem = result_elem.find('host')
            host_ip = host_elem.text if host_elem is not None else ''
            
            # Get port info
            port_elem = result_elem.find('port')
            port = port_elem.text if port_elem is not None else ''
            
            return {
                'id': finding_id,
                'cve_id': cve_id,
                'title': nvt_name,
                'severity': severity_level,
                'cvss_score': severity_score,
                'description': description[:500] + ('...' if len(description) > 500 else ''),  # Truncate long descriptions
                'host_ip': host_ip,
                'port': port,
                'status': 'NOT_VALIDATED',
                'discovered_at': datetime.now().isoformat()
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
            if hasattr(report_xml, 'getroot'):
                xml_content = ET.tostring(report_xml.getroot(), encoding='unicode')
            elif isinstance(report_xml, str):
                xml_content = report_xml
            else:
                xml_content = ET.tostring(report_xml, encoding='unicode')
            
            # Save XML content
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(xml_content)
            
            return filepath
            
        except Exception as e:
            print(f"Error saving report XML: {str(e)}")
            return ""
    
    # Mock methods for when OpenVAS is not available
    def _mock_create_task(self, target_ip: str, task_name: Optional[str] = None) -> Dict:
        """Mock method for creating task when OpenVAS is not available"""
        import uuid
        task_id = str(uuid.uuid4())
        
        return {
            'success': True,
            'task_id': task_id,
            'target_id': str(uuid.uuid4()),
            'task_name': task_name or f"Mock_Scan_{target_ip}",
            'target_ip': target_ip,
            'created_at': datetime.now().isoformat(),
            'mock': True
        }
    
    def _mock_start_scan(self, task_id: str) -> Dict:
        """Mock method for starting scan"""
        return {
            'success': True,
            'task_id': task_id,
            'status': 'started',
            'started_at': datetime.now().isoformat(),
            'mock': True
        }
    
    def _mock_get_status(self, task_id: str) -> Dict:
        """Mock method for getting scan status"""
        # Simulate scan progress
        import random
        progress = random.randint(10, 100)
        status = "Done" if progress == 100 else "Running"
        
        return {
            'success': True,
            'task_id': task_id,
            'status': status,
            'progress': progress,
            'checked_at': datetime.now().isoformat(),
            'mock': True
        }
    
    def _mock_get_report(self, task_id: str, save_xml: bool = True) -> Dict:
        """Mock method for getting scan report"""
        # Generate mock findings
        mock_findings = [
            {
                'id': 'mock-1',
                'cve_id': 'CVE-2023-12345',
                'title': 'Mock SQL Injection Vulnerability',
                'severity': 'High',
                'cvss_score': 8.5,
                'description': 'Mock vulnerability for testing purposes',
                'host_ip': '192.168.1.100',
                'port': '80/tcp',
                'status': 'NOT_VALIDATED',
                'discovered_at': datetime.now().isoformat()
            },
            {
                'id': 'mock-2',
                'cve_id': 'CVE-2023-67890',
                'title': 'Mock Cross-Site Scripting',
                'severity': 'Medium',
                'cvss_score': 6.2,
                'description': 'Mock XSS vulnerability for testing',
                'host_ip': '192.168.1.100',
                'port': '443/tcp',
                'status': 'NOT_VALIDATED',
                'discovered_at': datetime.now().isoformat()
            }
        ]
        
        return {
            'success': True,
            'task_id': task_id,
            'report_id': f'mock-report-{task_id}',
            'status': 'Done',
            'findings_count': len(mock_findings),
            'findings': mock_findings,
            'generated_at': datetime.now().isoformat(),
            'mock': True
        }

# Global instance
openvas_service = OpenVASService()
