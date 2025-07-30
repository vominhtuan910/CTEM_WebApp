import os
import json
import asyncio
import subprocess
import platform
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path
from ..models.scan_models import (
    ScanToolsStatus, ToolStatus, ScanOptions, ScanResult, 
    ScanHistoryItem, ScanStatus
)

class ScanService:
    """Scan service for running security scans"""
    
    def __init__(self):
        self.output_dir = Path("output/scans")
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    async def get_scan_tools_status(self) -> ScanToolsStatus:
        """Get status of available scanning tools"""
        current_platform = platform.system().lower()
        
        tools = {}
        
        # Check Nmap
        try:
            result = subprocess.run(['nmap', '--version'], 
                                  capture_output=True, text=True, timeout=5)
            tools['nmap'] = ToolStatus.installed if result.returncode == 0 else ToolStatus.not_installed
        except (subprocess.TimeoutExpired, FileNotFoundError):
            tools['nmap'] = ToolStatus.not_installed
        
        # Check Lynis
        try:
            result = subprocess.run(['lynis', '--version'], 
                                  capture_output=True, text=True, timeout=5)
            tools['lynis'] = ToolStatus.installed if result.returncode == 0 else ToolStatus.not_installed
        except (subprocess.TimeoutExpired, FileNotFoundError):
            tools['lynis'] = ToolStatus.not_installed
        
        # Check PowerShell (Windows only)
        if current_platform == 'windows':
            tools['powershell'] = ToolStatus.available
        else:
            tools['powershell'] = ToolStatus.not_applicable
        
        # Check WSL (Windows only)
        if current_platform == 'windows':
            try:
                result = subprocess.run(['wsl', '--status'], 
                                      capture_output=True, text=True, timeout=5)
                tools['wsl'] = ToolStatus.available if result.returncode == 0 else ToolStatus.not_available
            except (subprocess.TimeoutExpired, FileNotFoundError):
                tools['wsl'] = ToolStatus.not_available
        else:
            tools['wsl'] = ToolStatus.not_applicable
        
        return ScanToolsStatus(platform=current_platform, tools=tools)
    
    async def run_scan(self, options: ScanOptions) -> ScanResult:
        """Run a comprehensive security scan"""
        scan_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        timestamp = datetime.now()
        
        # Create scan directory
        scan_dir = self.output_dir / scan_id
        scan_dir.mkdir(exist_ok=True)
        
        # Initialize scan result
        scan_result = ScanResult(
            scan_id=scan_id,
            timestamp=timestamp,
            target=options.target,
            platform=platform.system().lower(),
            scan_status={
                "overall": ScanStatus.in_progress,
                "system_info": ScanStatus.completed,
                "nmap": ScanStatus.skipped,
                "lynis": ScanStatus.skipped,
                "powershell": ScanStatus.skipped
            },
            system_info=await self._get_system_info(options.target),
            network={"open_ports": [], "running_services": []},
            packages={"count": 0, "outdated": [], "scan_disabled": not options.scan_packages},
            security={"findings": [], "hardening_index": 0, "vulnerabilities": []},
            services=[],
            services_count=0,
            errors={},
            report_file=str(scan_dir / f"scan_report_{scan_id}.json")
        )
        
        # Run Nmap scan if enabled
        if options.run_nmap or (options.run_nmap is None and options.scan_services):
            try:
                nmap_result = await self._run_nmap_scan(options.target)
                scan_result.network.update(nmap_result)
                scan_result.scan_status["nmap"] = ScanStatus.completed
            except Exception as e:
                scan_result.scan_status["nmap"] = ScanStatus.failed
                scan_result.errors["nmap"] = str(e)
        
        # Run Lynis scan if enabled
        if options.run_lynis or (options.run_lynis is None and options.scan_vulnerabilities):
            try:
                lynis_result = await self._run_lynis_scan()
                scan_result.security.update(lynis_result)
                scan_result.scan_status["lynis"] = ScanStatus.completed
            except Exception as e:
                scan_result.scan_status["lynis"] = ScanStatus.failed
                scan_result.errors["lynis"] = str(e)
        
        # Run PowerShell scan if enabled (Windows only)
        if (options.run_powershell or (options.run_powershell is None and platform.system().lower() == 'windows')):
            try:
                powershell_result = await self._run_powershell_scan()
                scan_result.services = powershell_result.get("services", [])
                scan_result.services_count = len(scan_result.services)
                scan_result.scan_status["powershell"] = ScanStatus.completed
            except Exception as e:
                scan_result.scan_status["powershell"] = ScanStatus.failed
                scan_result.errors["powershell"] = str(e)
        
        # Update overall status
        failed_scans = [status for status in scan_result.scan_status.values() if status == ScanStatus.failed]
        if failed_scans:
            scan_result.scan_status["overall"] = ScanStatus.partial if any(status == ScanStatus.completed for status in scan_result.scan_status.values()) else ScanStatus.failed
        else:
            scan_result.scan_status["overall"] = ScanStatus.completed
        
        # Save scan result to file
        with open(scan_result.report_file, 'w') as f:
            json.dump(scan_result.dict(), f, indent=2, default=str)
        
        return scan_result
    
    async def get_scan_history(self, limit: int = 10) -> List[ScanHistoryItem]:
        """Get scan history"""
        history = []
        
        if not self.output_dir.exists():
            return history
        
        # Get all scan report files
        scan_files = list(self.output_dir.glob("scan_report_*.json"))
        scan_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        
        for scan_file in scan_files[:limit]:
            try:
                with open(scan_file, 'r') as f:
                    scan_data = json.load(f)
                
                history.append(ScanHistoryItem(
                    scan_id=scan_data.get("scan_id", ""),
                    timestamp=datetime.fromisoformat(scan_data.get("timestamp", datetime.now().isoformat())),
                    target=scan_data.get("target", ""),
                    scan_status=scan_data.get("scan_status", {}),
                    report_file=str(scan_file)
                ))
            except Exception as e:
                # Create error entry for corrupted files
                scan_id = scan_file.stem.replace("scan_report_", "")
                history.append(ScanHistoryItem(
                    scan_id=scan_id,
                    timestamp=datetime.now(),
                    target="unknown",
                    scan_status={"overall": ScanStatus.failed},
                    report_file=str(scan_file),
                    error=f"Could not read scan file: {str(e)}"
                ))
        
        return history
    
    async def get_scan_by_id(self, scan_id: str) -> Optional[Dict[str, Any]]:
        """Get scan results by ID"""
        scan_file = self.output_dir / f"scan_report_{scan_id}.json"
        
        if not scan_file.exists():
            return None
        
        try:
            with open(scan_file, 'r') as f:
                return json.load(f)
        except Exception:
            return None
    
    async def _get_system_info(self, target: str) -> Dict[str, Any]:
        """Get basic system information"""
        return {
            "hostname": target,
            "platform": platform.system(),
            "platform_version": platform.version(),
            "architecture": platform.machine(),
            "processor": platform.processor(),
            "python_version": platform.python_version()
        }
    
    async def _run_nmap_scan(self, target: str) -> Dict[str, Any]:
        """Run Nmap scan (mock implementation)"""
        # Mock Nmap results
        return {
            "open_ports": [
                {"port": 22, "protocol": "tcp", "service": "ssh"},
                {"port": 80, "protocol": "tcp", "service": "http"},
                {"port": 443, "protocol": "tcp", "service": "https"}
            ],
            "running_services": [
                {"name": "ssh", "port": 22, "protocol": "tcp", "version": "OpenSSH 8.9p1"},
                {"name": "http", "port": 80, "protocol": "tcp", "version": "nginx 1.18.0"},
                {"name": "https", "port": 443, "protocol": "tcp", "version": "nginx 1.18.0"}
            ]
        }
    
    async def _run_lynis_scan(self) -> Dict[str, Any]:
        """Run Lynis scan (mock implementation)"""
        # Mock Lynis results
        return {
            "findings": [
                "Warning: SSH root login is enabled",
                "Warning: Unnecessary network services are running"
            ],
            "hardening_index": 65,
            "vulnerabilities": [
                {"name": "SSH Root Login", "severity": "medium", "description": "SSH root login is enabled"}
            ]
        }
    
    async def _run_powershell_scan(self) -> Dict[str, Any]:
        """Run PowerShell scan (mock implementation)"""
        # Mock PowerShell results
        return {
            "services": [
                {"name": "spooler", "display_name": "Print Spooler", "status": "running"},
                {"name": "wuauserv", "display_name": "Windows Update", "status": "running"},
                {"name": "bits", "display_name": "Background Intelligent Transfer Service", "status": "running"}
            ],
            "software": [
                {"name": "Visual Studio Code", "version": "1.85.0", "publisher": "Microsoft Corporation"},
                {"name": "Node.js", "version": "18.17.0", "publisher": "Node.js Foundation"}
            ]
        }

# Global instance
scan_service = ScanService()

# Convenience functions
async def get_scan_tools_status() -> ScanToolsStatus:
    return await scan_service.get_scan_tools_status()

async def run_scan(options: ScanOptions) -> ScanResult:
    return await scan_service.run_scan(options)

async def get_scan_history(limit: int = 10) -> List[ScanHistoryItem]:
    return await scan_service.get_scan_history(limit)

async def get_scan_by_id(scan_id: str) -> Optional[Dict[str, Any]]:
    return await scan_service.get_scan_by_id(scan_id) 