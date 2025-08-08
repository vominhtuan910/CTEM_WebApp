import os
import xml.etree.ElementTree as ET
from typing import List, Dict, Optional
from datetime import datetime
import re


class OpenVASParserService:
    """Service to parse OpenVAS XML reports and extract threat information"""
    
    def __init__(self):
        self.scan_reports_dir = "output/scans"
    
    def parse_openvas_reports(self) -> List[Dict]:
        """
        Parse all OpenVAS XML reports in the scans directory
        Returns a list of threats with required fields
        """
        threats = []
        
        # Get all OpenVAS XML files
        if not os.path.exists(self.scan_reports_dir):
            return threats
            
        for filename in os.listdir(self.scan_reports_dir):
            if filename.startswith("openvas_scan_") and filename.endswith(".xml"):
                filepath = os.path.join(self.scan_reports_dir, filename)
                file_threats = self._parse_single_report(filepath)
                threats.extend(file_threats)
        
        return threats
    
    def _parse_single_report(self, filepath: str) -> List[Dict]:
        """Parse a single OpenVAS XML report file"""
        threats = []
        
        try:
            tree = ET.parse(filepath)
            root = tree.getroot()
            
            # Extract scan metadata
            scan_date = self._extract_scan_date(root)
            
            # Find all result elements (threats/vulnerabilities)
            results = root.findall(".//result")
            
            for result in results:
                threat = self._extract_threat_info(result, scan_date)
                if threat:
                    threats.append(threat)
                    
        except Exception as e:
            print(f"Error parsing OpenVAS report {filepath}: {str(e)}")
            
        return threats
    
    def _extract_threat_info(self, result_elem, scan_date: str) -> Optional[Dict]:
        """Extract threat information from a result element"""
        try:
            # Get threat ID
            threat_id = result_elem.get("id", "")
            
            # Get NVT (Network Vulnerability Test) information
            nvt_elem = result_elem.find("nvt")
            if nvt_elem is None:
                return None
                
            # Extract basic threat information
            title = nvt_elem.findtext("name", "Unknown Threat")
            
            # Extract CVSS score and severity
            severity_elem = result_elem.find("severity")
            cvss_score = 0.0
            if severity_elem is not None and severity_elem.text:
                try:
                    cvss_score = float(severity_elem.text)
                except ValueError:
                    cvss_score = 0.0
            
            # Map CVSS score to severity level
            severity = self._map_cvss_to_severity(cvss_score)
            
            # Extract CVE references
            cve_refs = self._extract_cve_references(nvt_elem)
            
            # Extract affected asset IP
            host_elem = result_elem.find("host")
            affected_asset_ip = host_elem.text if host_elem is not None else "Unknown"
            
            # Extract port information
            port_elem = result_elem.find("port")
            port = port_elem.text if port_elem is not None else ""
            
            # Extract description
            description_elem = result_elem.find("description")
            description = description_elem.text if description_elem is not None else ""
            
            # Extract threat level
            threat_elem = result_elem.find("threat")
            threat_level = threat_elem.text if threat_elem is not None else severity
            
            return {
                "id": threat_id,
                "title": title,
                "cvss_score": cvss_score,
                "severity": severity,
                "cve_references": cve_refs,
                "affected_asset_ip": affected_asset_ip,
                "port": port,
                "description": description[:500] + ("..." if len(description) > 500 else ""),
                "threat_level": threat_level,
                "discovery_date": scan_date,
                "status": "Not Fixed"  # Default status
            }
            
        except Exception as e:
            print(f"Error extracting threat info: {str(e)}")
            return None
    
    def _extract_cve_references(self, nvt_elem) -> List[str]:
        """Extract CVE references from NVT element"""
        cve_refs = []
        
        # Look for CVE references in refs section
        refs = nvt_elem.findall(".//ref[@type='cve']")
        for ref in refs:
            cve_id = ref.get("id", "")
            if cve_id and cve_id not in cve_refs:
                cve_refs.append(cve_id)
        
        # Also check in tags for CVE references
        tags_elem = nvt_elem.find("tags")
        if tags_elem is not None and tags_elem.text:
            # Look for CVE patterns in tags text
            cve_pattern = r'CVE-\d{4}-\d{4,7}'
            found_cves = re.findall(cve_pattern, tags_elem.text)
            for cve in found_cves:
                if cve not in cve_refs:
                    cve_refs.append(cve)
        
        return cve_refs
    
    def _extract_scan_date(self, root) -> str:
        """Extract scan date from report"""
        try:
            # Try to get scan start time
            scan_start_elem = root.find(".//scan_start")
            if scan_start_elem is not None and scan_start_elem.text:
                return scan_start_elem.text
            
            # Fallback to creation time
            creation_time_elem = root.find(".//creation_time")
            if creation_time_elem is not None and creation_time_elem.text:
                return creation_time_elem.text
            
            # Fallback to current time
            return datetime.now().isoformat()
            
        except Exception:
            return datetime.now().isoformat()
    
    def _map_cvss_to_severity(self, cvss_score: float) -> str:
        """Map CVSS score to severity level"""
        if cvss_score >= 9.0:
            return "Critical"
        elif cvss_score >= 7.0:
            return "High"
        elif cvss_score >= 4.0:
            return "Medium"
        elif cvss_score > 0.0:
            return "Low"
        else:
            return "Info"
    
    def get_threats_summary(self, threats: List[Dict]) -> Dict:
        """Generate summary statistics for threats"""
        if not threats:
            return {
                "total": 0,
                "critical": 0,
                "high": 0,
                "medium": 0,
                "low": 0,
                "info": 0,
                "fixed": 0,
                "not_fixed": 0,
                "in_progress": 0,
                "most_affected_asset": {"name": "", "count": 0}
            }
        
        # Count by severity
        severity_counts = {
            "Critical": 0,
            "High": 0,
            "Medium": 0,
            "Low": 0,
            "Info": 0
        }
        
        # Count by status
        status_counts = {
            "Fixed": 0,
            "Not Fixed": 0,
            "In Progress": 0
        }
        
        # Count by affected asset
        asset_counts = {}
        
        for threat in threats:
            # Count severity
            severity = threat.get("severity", "Info")
            if severity in severity_counts:
                severity_counts[severity] += 1
            
            # Count status
            status = threat.get("status", "Not Fixed")
            if status in status_counts:
                status_counts[status] += 1
            
            # Count affected assets
            asset_ip = threat.get("affected_asset_ip", "Unknown")
            asset_counts[asset_ip] = asset_counts.get(asset_ip, 0) + 1
        
        # Find most affected asset
        most_affected_asset = {"name": "", "count": 0}
        if asset_counts:
            most_affected_ip = max(asset_counts, key=asset_counts.get)
            most_affected_asset = {
                "name": most_affected_ip,
                "count": asset_counts[most_affected_ip]
            }
        
        return {
            "total": len(threats),
            "critical": severity_counts["Critical"],
            "high": severity_counts["High"],
            "medium": severity_counts["Medium"],
            "low": severity_counts["Low"],
            "info": severity_counts["Info"],
            "fixed": status_counts["Fixed"],
            "not_fixed": status_counts["Not Fixed"],
            "in_progress": status_counts["In Progress"],
            "most_affected_asset": most_affected_asset
        }


# Global instance
openvas_parser_service = OpenVASParserService()
