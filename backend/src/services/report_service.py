import json
import os
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path
from ..models.report_models import (
    ReportRequest, ReportFile, ReportType, ReportFormat
)

class ReportService:
    """Report service for generating various report formats"""
    
    def __init__(self):
        self.output_dir = Path("output/reports")
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    async def generate_json_report(self, request: ReportRequest) -> Dict[str, Any]:
        """Generate a JSON report"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if request.asset_id:
            report_type = "asset"
            filename = f"asset_report_{request.asset_id[:8]}_{timestamp}.json"
            report_data = await self._generate_asset_report(request.asset_id, request.include_scans)
        elif request.vulnerability_id:
            report_type = "vulnerability"
            filename = f"vulnerability_report_{request.vulnerability_id[:8]}_{timestamp}.json"
            report_data = await self._generate_vulnerability_report(request.vulnerability_id)
        else:
            report_type = "summary"
            filename = f"summary_report_{timestamp}.json"
            report_data = await self._generate_summary_report()
        
        # Write to file
        file_path = self.output_dir / filename
        with open(file_path, 'w') as f:
            json.dump(report_data, f, indent=2, default=str)
        
        return {
            "success": True,
            "report_type": report_type,
            "file_path": str(file_path),
            "file_name": filename,
            "data": report_data
        }
    
    async def generate_markdown_report(self, request: ReportRequest) -> Dict[str, Any]:
        """Generate a Markdown report"""
        # First generate JSON data
        json_report = await self.generate_json_report(request)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if json_report["report_type"] == "asset":
            filename = f"asset_report_{request.asset_id[:8]}_{timestamp}.md"
            markdown_content = await self._generate_asset_markdown(json_report["data"])
        elif json_report["report_type"] == "vulnerability":
            filename = f"vulnerability_report_{request.vulnerability_id[:8]}_{timestamp}.md"
            markdown_content = await self._generate_vulnerability_markdown(json_report["data"])
        else:
            filename = f"summary_report_{timestamp}.md"
            markdown_content = await self._generate_summary_markdown(json_report["data"])
        
        # Write to file
        file_path = self.output_dir / filename
        with open(file_path, 'w') as f:
            f.write(markdown_content)
        
        return {
            "success": True,
            "report_type": json_report["report_type"],
            "file_path": str(file_path),
            "file_name": filename
        }
    
    async def list_reports(self) -> List[ReportFile]:
        """List available reports"""
        reports = []
        
        if not self.output_dir.exists():
            return reports
        
        for file_path in self.output_dir.iterdir():
            if file_path.is_file() and file_path.suffix in ['.json', '.md', '.pdf']:
                stat = file_path.stat()
                
                # Determine report type from filename
                report_type = ReportType.unknown
                if file_path.stem.startswith("asset_report_"):
                    report_type = ReportType.asset
                elif file_path.stem.startswith("vulnerability_report_"):
                    report_type = ReportType.vulnerability
                elif file_path.stem.startswith("summary_report_"):
                    report_type = ReportType.summary
                
                reports.append(ReportFile(
                    file_name=file_path.name,
                    file_path=str(file_path),
                    report_type=report_type,
                    file_format=file_path.suffix[1:],
                    size=stat.st_size,
                    created=datetime.fromtimestamp(stat.st_ctime),
                    modified=datetime.fromtimestamp(stat.st_mtime)
                ))
        
        # Sort by modification time, newest first
        reports.sort(key=lambda x: x.modified, reverse=True)
        return reports
    
    async def delete_report(self, filename: str) -> bool:
        """Delete a report file"""
        file_path = self.output_dir / filename
        
        if file_path.exists() and file_path.is_file():
            file_path.unlink()
            return True
        return False
    
    async def _generate_asset_report(self, asset_id: str, include_scans: bool) -> Dict[str, Any]:
        """Generate asset report data (mock implementation)"""
        return {
            "timestamp": datetime.now().isoformat(),
            "report_type": "Asset Vulnerability Report",
            "asset": {
                "id": asset_id,
                "hostname": "server-01",
                "name": "Production Server 1",
                "ip_address": "192.168.1.100",
                "os_info": {
                    "name": "Ubuntu",
                    "version": "22.04 LTS",
                    "architecture": "x86_64"
                },
                "health_score": 85.5,
                "last_scan": datetime.now().isoformat(),
                "services": [
                    {"name": "nginx", "port": 80, "protocol": "tcp", "version": "1.18.0"},
                    {"name": "ssh", "port": 22, "protocol": "tcp", "version": "8.9p1"}
                ],
                "applications": [
                    {"name": "Docker", "version": "24.0.5", "publisher": "Docker Inc."}
                ]
            },
            "vulnerabilities": [
                {
                    "id": "vuln-001",
                    "name": "SSH Root Login Enabled",
                    "type": "configuration",
                    "cvss_score": 5.0,
                    "severity_level": "medium",
                    "status": "not_fixed",
                    "description": "SSH root login is enabled, which is a security risk"
                }
            ],
            "summary": {
                "total": 1,
                "critical": 0,
                "high": 0,
                "medium": 1,
                "low": 0,
                "fixed": 0,
                "in_progress": 0,
                "not_fixed": 1
            }
        }
    
    async def _generate_vulnerability_report(self, vulnerability_id: str) -> Dict[str, Any]:
        """Generate vulnerability report data (mock implementation)"""
        return {
            "timestamp": datetime.now().isoformat(),
            "report_type": "Vulnerability Report",
            "vulnerability": {
                "id": vulnerability_id,
                "name": "SSH Root Login Enabled",
                "type": "configuration",
                "cvss_score": 5.0,
                "severity_level": "medium",
                "status": "not_fixed",
                "description": "SSH root login is enabled, which is a security risk"
            },
            "affected_assets": [
                {"hostname": "server-01", "ip_address": "192.168.1.100", "os": "Ubuntu 22.04"}
            ],
            "summary": {
                "total_assets": 1,
                "total_applications": 0
            }
        }
    
    async def _generate_summary_report(self) -> Dict[str, Any]:
        """Generate summary report data (mock implementation)"""
        return {
            "timestamp": datetime.now().isoformat(),
            "report_type": "Summary Report",
            "assets": [
                {
                    "id": "asset-001",
                    "hostname": "server-01",
                    "ip_address": "192.168.1.100",
                    "os_name": "Ubuntu",
                    "os_version": "22.04 LTS",
                    "health_score": 85.5,
                    "vulnerabilities_count": 1
                }
            ],
            "vulnerability_summary": {
                "total": 1,
                "by_severity": {"critical": 0, "high": 0, "medium": 1, "low": 0},
                "by_status": {"fixed": 0, "in_progress": 0, "not_fixed": 1}
            },
            "asset_summary": {
                "total": 1,
                "with_vulnerabilities": 1
            }
        }
    
    async def _generate_asset_markdown(self, data: Dict[str, Any]) -> str:
        """Generate asset report in Markdown format"""
        asset = data["asset"]
        vulns = data["vulnerabilities"]
        summary = data["summary"]
        
        markdown = f"# Asset Vulnerability Report: {asset['name']}\n\n"
        markdown += f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        
        markdown += "## Asset Information\n\n"
        markdown += f"- **Hostname:** {asset['hostname']}\n"
        markdown += f"- **IP Address:** {asset['ip_address']}\n"
        markdown += f"- **OS:** {asset['os_info']['name']} {asset['os_info']['version']}\n"
        markdown += f"- **Health Score:** {asset['health_score']}\n\n"
        
        markdown += "## Vulnerability Summary\n\n"
        markdown += f"- **Total Vulnerabilities:** {summary['total']}\n"
        markdown += f"- **Critical:** {summary['critical']}\n"
        markdown += f"- **High:** {summary['high']}\n"
        markdown += f"- **Medium:** {summary['medium']}\n"
        markdown += f"- **Low:** {summary['low']}\n\n"
        
        if vulns:
            markdown += "## Vulnerabilities\n\n"
            for vuln in vulns:
                markdown += f"### {vuln['name']}\n\n"
                markdown += f"- **Severity:** {vuln['severity_level']}\n"
                markdown += f"- **CVSS Score:** {vuln['cvss_score']}\n"
                markdown += f"- **Status:** {vuln['status']}\n\n"
                markdown += f"{vuln['description']}\n\n"
        
        return markdown
    
    async def _generate_vulnerability_markdown(self, data: Dict[str, Any]) -> str:
        """Generate vulnerability report in Markdown format"""
        vuln = data["vulnerability"]
        assets = data["affected_assets"]
        
        markdown = f"# Vulnerability Report: {vuln['name']}\n\n"
        markdown += f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        
        markdown += "## Vulnerability Information\n\n"
        markdown += f"- **Severity:** {vuln['severity_level']}\n"
        markdown += f"- **CVSS Score:** {vuln['cvss_score']}\n"
        markdown += f"- **Status:** {vuln['status']}\n\n"
        markdown += f"{vuln['description']}\n\n"
        
        if assets:
            markdown += "## Affected Assets\n\n"
            for asset in assets:
                markdown += f"- **{asset['hostname']}** ({asset['ip_address']}) - {asset['os']}\n"
        
        return markdown
    
    async def _generate_summary_markdown(self, data: Dict[str, Any]) -> str:
        """Generate summary report in Markdown format"""
        assets = data["assets"]
        vuln_summary = data["vulnerability_summary"]
        
        markdown = "# CTEM Summary Report\n\n"
        markdown += f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        
        markdown += "## Vulnerability Summary\n\n"
        markdown += f"- **Total Vulnerabilities:** {vuln_summary['total']}\n\n"
        
        markdown += "### By Severity\n\n"
        for severity, count in vuln_summary['by_severity'].items():
            markdown += f"- {severity.title()}: {count}\n"
        
        markdown += "\n## Assets Summary\n\n"
        markdown += f"- **Total Assets:** {data['asset_summary']['total']}\n"
        markdown += f"- **Assets with Vulnerabilities:** {data['asset_summary']['with_vulnerabilities']}\n\n"
        
        if assets:
            markdown += "## Asset List\n\n"
            for asset in assets:
                markdown += f"- **{asset['hostname']}** ({asset['ip_address']}) - {asset['os_name']} {asset['os_version']} - Score: {asset['health_score']} - Vulnerabilities: {asset['vulnerabilities_count']}\n"
        
        return markdown

# Global instance
report_service = ReportService() 