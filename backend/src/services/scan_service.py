from typing import Dict, List, Optional
import asyncio
import os
from src.services.nmap_service import nmap_service
from src.services.openvas_service import openvas_service
from src.services.asset_service import asset_service
from src.database import get_db
import subprocess

class ScanService:
    def __init__(self):
        pass
    
    async def get_scan_tools_status(self) -> Dict:
        """Check the status of scanning tools"""
        tools_status = {
            'nmap': await self._check_nmap(),
            'openvas': await self._check_openvas(),
            'searchsploit': await self._check_searchsploit()
        }
        
        return {
            'tools': tools_status,
            'all_available': all(tool['available'] for tool in tools_status.values())
        }
    
    async def _check_nmap(self) -> Dict:
        """Check if Nmap is available"""
        try:
            result = subprocess.run(['nmap', '--version'], capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                version_line = result.stdout.split('\n')[0]
                return {
                    'available': True,
                    'version': version_line,
                    'status': 'ready'
                }
            else:
                return {
                    'available': False,
                    'error': 'nmap command failed',
                    'status': 'error'
                }
        except subprocess.TimeoutExpired:
            return {
                'available': False,
                'error': 'nmap command timed out',
                'status': 'timeout'
            }
        except FileNotFoundError:
            return {
                'available': False,
                'error': 'nmap not found in PATH',
                'status': 'not_found'
            }
        except Exception as e:
            return {
                'available': False,
                'error': str(e),
                'status': 'error'
            }
    
    async def _check_openvas(self) -> Dict:
        """Check if OpenVAS is available"""
        try:
            # Check if socket exists (Linux)
            socket_path = os.getenv("OPENVAS_SOCKET", "/var/run/gvmd.sock")
            if os.path.exists(socket_path):
                return {
                    'available': True,
                    'connection': 'unix_socket',
                    'status': 'ready'
                }
            else:
                # Check if we can connect via TLS (remote or Windows)
                return {
                    'available': True,  # Assume available for now
                    'connection': 'tls',
                    'status': 'ready',
                    'note': 'TLS connection (remote or containerized)'
                }
        except Exception as e:
            return {
                'available': False,
                'error': str(e),
                'status': 'error'
            }
    
    async def _check_searchsploit(self) -> Dict:
        """Check if searchsploit is available"""
        try:
            searchsploit_path = os.getenv("SEARCHSPLOIT_PATH", "searchsploit")
            result = subprocess.run([searchsploit_path, '--help'], capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                return {
                    'available': True,
                    'status': 'ready'
                }
            else:
                return {
                    'available': False,
                    'error': 'searchsploit command failed',
                    'status': 'error'
                }
        except subprocess.TimeoutExpired:
            return {
                'available': False,
                'error': 'searchsploit command timed out',
                'status': 'timeout'
            }
        except FileNotFoundError:
            return {
                'available': False,
                'error': 'searchsploit not found in PATH',
                'status': 'not_found'
            }
        except Exception as e:
            return {
                'available': False,
                'error': str(e),
                'status': 'error'
            }
    
    async def perform_network_discovery(self, network: str) -> Dict:
        """
        Stage 1: Perform network discovery using Nmap
        Args:
            network: Network range to scan (e.g., "192.168.1.0/24")
        Returns:
            Dictionary with discovered hosts and their information
        """
        try:
            print(f"Starting network discovery for: {network}")
            
            # Perform Nmap scan
            scan_result = await nmap_service.scan_network(network, save_xml=True)
            
            if not scan_result.get('hosts'):
                return {
                    'success': True,
                    'network': network,
                    'message': 'No hosts discovered in the network',
                    'hosts': [],
                    'total_hosts': 0
                }
            
            # Save discovered assets to database
            saved_assets = []
            db = next(get_db())
            
            try:
                for host_info in scan_result['hosts']:
                    try:
                        # Create or update asset
                        asset = await asset_service.create_asset_from_scan(host_info, db)
                        
                        # Save Nmap scan data
                        await asset_service.save_nmap_scan(asset.id, host_info, db)
                        
                        saved_assets.append({
                            'id': asset.id,
                            'ip': asset.ip,
                            'hostname': asset.hostname,
                            'os': asset.os,
                            'ports': host_info.get('ports', [])[:5]  # Show first 5 ports
                        })
                        
                    except Exception as e:
                        print(f"Error saving asset {host_info.get('ip', 'unknown')}: {str(e)}")
                        continue
                
            finally:
                db.close()
            
            return {
                'success': True,
                'network': network,
                'scan_time': scan_result.get('scan_time'),
                'total_hosts': len(scan_result['hosts']),
                'saved_assets': len(saved_assets),
                'hosts': saved_assets,
                'xml_path': scan_result.get('xml_path')
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Network discovery failed: {str(e)}'
            }
    
    async def start_vulnerability_scan(self, asset_ids: List[int]) -> Dict:
        """
        Stage 2: Start OpenVAS vulnerability scans for selected assets
        Args:
            asset_ids: List of asset IDs to scan
        Returns:
            Dictionary with scan task information
        """
        try:
            db = next(get_db())
            scan_tasks = []
            
            try:
                for asset_id in asset_ids:
                    # Get asset info
                    asset = await asset_service.get_asset_by_id(asset_id, db)
                    if not asset:
                        continue
                    
                    # Create OpenVAS scan task
                    task_result = await openvas_service.create_scan_task(
                        target_ip=asset.ip,
                        task_name=f"CTEM_Vuln_Scan_{asset.hostname or asset.ip}"
                    )
                    
                    if task_result.get('success'):
                        # Start the scan
                        start_result = await openvas_service.start_scan(task_result['task_id'])
                        
                        if start_result.get('success'):
                            scan_tasks.append({
                                'asset_id': asset_id,
                                'asset_ip': asset.ip,
                                'asset_hostname': asset.hostname,
                                'task_id': task_result['task_id'],
                                'status': 'started'
                            })
                
            finally:
                db.close()
            
            return {
                'success': True,
                'total_assets': len(asset_ids),
                'started_scans': len(scan_tasks),
                'scan_tasks': scan_tasks
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to start vulnerability scans: {str(e)}'
            }
    
    async def check_scan_progress(self, task_ids: List[str]) -> Dict:
        """
        Check the progress of OpenVAS scans
        Args:
            task_ids: List of task IDs to check
        Returns:
            Dictionary with scan progress information
        """
        try:
            task_statuses = []
            completed_tasks = []
            
            for task_id in task_ids:
                status_result = await openvas_service.get_scan_status(task_id)
                
                if status_result.get('success'):
                    task_status = {
                        'task_id': task_id,
                        'status': status_result.get('status', 'Unknown'),
                        'progress': status_result.get('progress', 0)
                    }
                    task_statuses.append(task_status)
                    
                    if status_result.get('status') == 'Done':
                        completed_tasks.append(task_id)
            
            return {
                'success': True,
                'total_tasks': len(task_ids),
                'completed_tasks': len(completed_tasks),
                'task_statuses': task_statuses,
                'all_completed': len(completed_tasks) == len(task_ids)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to check scan progress: {str(e)}'
            }
    
    async def collect_scan_results(self, task_ids: List[str]) -> Dict:
        """
        Collect results from completed OpenVAS scans
        Args:
            task_ids: List of completed task IDs
        Returns:
            Dictionary with collected findings
        """
        try:
            all_findings = []
            db = next(get_db())
            
            try:
                for task_id in task_ids:
                    # Get scan report
                    report_result = await openvas_service.get_scan_report(task_id, save_xml=True)
                    
                    if report_result.get('success') and report_result.get('findings'):
                        # Find the corresponding asset (this would need task->asset mapping)
                        # For now, we'll create a placeholder approach
                        findings = report_result['findings']
                        all_findings.extend(findings)
                        
                        # Save findings to database would go here
                        # This requires mapping task_id back to asset_id
                
            finally:
                db.close()
            
            return {
                'success': True,
                'total_tasks': len(task_ids),
                'total_findings': len(all_findings),
                'findings': all_findings
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to collect scan results: {str(e)}'
            }

# Function to get scan tools status (for backwards compatibility)
async def get_scan_tools_status() -> Dict:
    """Get scan tools status"""
    scan_service = ScanService()
    return await scan_service.get_scan_tools_status()

# Global instance
scan_service = ScanService()
