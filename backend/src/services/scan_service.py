from typing import Dict, List, Optional
import asyncio
import os
from src.services.nmap_service import nmap_service
from src.services.openvas_service import openvas_service
from src.services.asset_service import asset_service
from src.database import get_db
import subprocess
import sys
from datetime import datetime

# Add the backend directory to the path so we can import parse_openvas_reports
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)


class ScanService:
    def __init__(self):
        pass

    async def get_scan_tools_status(self) -> Dict:
        """Check the status of scanning tools"""
        tools_status = {
            "nmap": await self._check_nmap(),
            "openvas": await self._check_openvas(),
            "searchsploit": await self._check_searchsploit(),
        }

        return {
            "tools": tools_status,
            "all_available": all(tool["available"] for tool in tools_status.values()),
        }

    async def _check_nmap(self) -> Dict:
        """Check if Nmap is available"""
        try:
            result = subprocess.run(
                ["nmap", "--version"], capture_output=True, text=True, timeout=10
            )
            if result.returncode == 0:
                version_line = result.stdout.split("\n")[0]
                return {"available": True, "version": version_line, "status": "ready"}
            else:
                return {
                    "available": False,
                    "error": "nmap command failed",
                    "status": "error",
                }
        except subprocess.TimeoutExpired:
            return {
                "available": False,
                "error": "nmap command timed out",
                "status": "timeout",
            }
        except FileNotFoundError:
            return {
                "available": False,
                "error": "nmap not found in PATH",
                "status": "not_found",
            }
        except Exception as e:
            return {"available": False, "error": str(e), "status": "error"}

    async def _check_openvas(self) -> Dict:
        """Check if OpenVAS is available"""
        try:
            # Get OpenVAS configuration
            host = os.getenv("OPENVAS_HOST", "localhost")
            port = int(os.getenv("OPENVAS_PORT", "9390"))
            socket_path = os.getenv("OPENVAS_SOCKET", "/var/run/gvmd.sock")

            # Try to test actual connection to OpenVAS
            try:
                from src.services.openvas_service import openvas_service

                # Test connection by trying to connect
                gmp = openvas_service._connect_gmp()
                version = gmp.get_version()

                connection_type = "tls" if host != "localhost" else "unix_socket"
                return {
                    "available": True,
                    "connection": connection_type,
                    "status": "ready",
                    "host": host,
                    "port": port,
                    "version": str(version) if version else "unknown",
                }

            except Exception as conn_error:
                # If connection fails, still report configuration
                connection_type = (
                    "tls"
                    if host != "localhost" or not os.path.exists(socket_path)
                    else "unix_socket"
                )
                return {
                    "available": False,
                    "connection": connection_type,
                    "status": "connection_failed",
                    "host": host,
                    "port": port,
                    "error": str(conn_error),
                }

        except Exception as e:
            return {"available": False, "error": str(e), "status": "error"}

    async def _check_searchsploit(self) -> Dict:
        """Check if searchsploit is available"""
        try:
            searchsploit_path = os.getenv("SEARCHSPLOIT_PATH", "searchsploit")
            result = subprocess.run(
                [searchsploit_path, "--help"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            if result.returncode == 0:
                return {"available": True, "status": "ready"}
            else:
                return {
                    "available": False,
                    "error": "searchsploit command failed",
                    "status": "error",
                }
        except subprocess.TimeoutExpired:
            return {
                "available": False,
                "error": "searchsploit command timed out",
                "status": "timeout",
            }
        except FileNotFoundError:
            return {
                "available": False,
                "error": "searchsploit not found in PATH",
                "status": "not_found",
            }
        except Exception as e:
            return {"available": False, "error": str(e), "status": "error"}

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

            # Check database availability first
            from src.database import DATABASE_AVAILABLE, test_database_connection

            db_status = test_database_connection()
            print(f"Database status: {db_status}")

            if not DATABASE_AVAILABLE:
                print(
                    "⚠️ WARNING: Database is not available! Scan results will not be saved."
                )

            # Perform Nmap scan
            scan_result = await nmap_service.scan_network(network, save_xml=True)
            print(
                f"Nmap scan completed. Found {len(scan_result.get('hosts', []))} hosts"
            )

            if not scan_result.get("hosts"):
                return {
                    "success": True,
                    "network": network,
                    "message": "No hosts discovered in the network",
                    "hosts": [],
                    "total_hosts": 0,
                }

            # Save discovered assets to database
            saved_assets = []
            db = next(get_db())

            print(f"Database session obtained: {db is not None}")
            if db is None:
                print(
                    "❌ CRITICAL: Database session is None - cannot save scan results!"
                )
                return {
                    "success": False,
                    "error": "Database not available - scan results not saved",
                    "network": network,
                    "hosts": scan_result.get("hosts", []),
                }

            try:
                for i, host_info in enumerate(scan_result["hosts"]):
                    print(
                        f"\n--- Processing host {i + 1}/{len(scan_result['hosts'])}: {host_info.get('ip', 'unknown')} ---"
                    )
                    print(f"Host data: {host_info}")

                    try:
                        # Create or update asset
                        print("Creating/updating asset...")
                        asset = await asset_service.create_asset_from_scan(
                            host_info, db
                        )
                        print(f"✅ Asset created/updated: {asset.ip} (ID: {asset.id})")

                        # Save Nmap scan data
                        print("Saving Nmap scan data...")
                        nmap_scan = await asset_service.save_nmap_scan(
                            asset.id, host_info, db
                        )
                        print(
                            f"✅ Nmap scan data saved for asset {asset.ip} (scan ID: {nmap_scan.id})"
                        )

                        saved_assets.append(
                            {
                                "id": asset.id,
                                "ip": asset.ip,
                                "hostname": asset.hostname,
                                "os": asset.os,
                                "ports": host_info.get("ports", [])[
                                    :5
                                ],  # Show first 5 ports
                            }
                        )

                    except Exception as e:
                        print(
                            f"❌ Error saving asset {host_info.get('ip', 'unknown')}: {str(e)}"
                        )
                        import traceback

                        traceback.print_exc()
                        continue

            finally:
                if db:
                    db.close()
                    print("Database session closed")

            # Automatically parse OpenVAS reports after Nmap scan completes
            print("\n🔍 Auto-triggering OpenVAS report parsing...")
            try:
                from parse_openvas_reports import OpenVASReportProcessor

                processor = OpenVASReportProcessor()
                parse_success = await processor.process_reports()

                if parse_success:
                    print("✅ OpenVAS reports parsed successfully after Nmap scan")
                else:
                    print("⚠️ OpenVAS report parsing completed with some issues")

            except Exception as parse_error:
                print(f"⚠️ Auto-parsing OpenVAS reports failed: {str(parse_error)}")
                # Don't fail the entire Nmap scan if parsing fails
                import traceback

                traceback.print_exc()

            return {
                "success": True,
                "network": network,
                "scan_time": scan_result.get("scan_time"),
                "total_hosts": len(scan_result["hosts"]),
                "saved_assets": len(saved_assets),
                "hosts": saved_assets,
                "xml_path": scan_result.get("xml_path"),
                "openvas_parsing_triggered": True,
            }

        except Exception as e:
            return {"success": False, "error": f"Network discovery failed: {str(e)}"}

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
                    print(f"🎯 Creating scan task for asset: {asset.ip}")
                    task_result = await openvas_service.create_scan_task(
                        target_ip=asset.ip,
                        task_name=f"CTEM_Vuln_Scan_{asset.hostname or asset.ip}",
                    )
                    print(f"📋 Task creation result: {task_result}")

                    if task_result.get("success"):
                        print(f"✅ Task created successfully: {task_result['task_id']}")
                        # Start the scan
                        print(
                            f"🚀 Attempting to start scan for task: {task_result['task_id']}"
                        )
                        start_result = await openvas_service.start_scan(
                            task_result["task_id"]
                        )
                        print(f"📊 Start scan result: {start_result}")

                        if start_result.get("success"):
                            scan_tasks.append(
                                {
                                    "asset_id": asset_id,
                                    "asset_ip": asset.ip,
                                    "asset_hostname": asset.hostname,
                                    "task_id": task_result["task_id"],
                                    "status": "started",
                                }
                            )

            finally:
                db.close()

            return {
                "success": True,
                "total_assets": len(asset_ids),
                "started_scans": len(scan_tasks),
                "scan_tasks": scan_tasks,
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to start vulnerability scans: {str(e)}",
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

                if status_result.get("success"):
                    task_status = {
                        "task_id": task_id,
                        "status": status_result.get("status", "Unknown"),
                        "progress": status_result.get("progress", 0),
                    }
                    task_statuses.append(task_status)

                    if status_result.get("status") == "Done":
                        completed_tasks.append(task_id)

            return {
                "success": True,
                "total_tasks": len(task_ids),
                "completed_tasks": len(completed_tasks),
                "task_statuses": task_statuses,
                "all_completed": len(completed_tasks) == len(task_ids),
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to check scan progress: {str(e)}",
            }

    async def collect_scan_results(self, task_ids: List[str]) -> Dict:
        """
        Collect and process results from completed OpenVAS scans
        Args:
            task_ids: List of task IDs to collect results for
        Returns:
            Dictionary with collected results
        """
        try:
            results = []
            for task_id in task_ids:
                try:
                    # Get task results
                    task_results = await openvas_service.get_task_results(task_id)
                    if task_results.get("success"):
                        results.append(task_results)
                    else:
                        print(f"Failed to get results for task {task_id}")
                except Exception as e:
                    print(f"Error collecting results for task {task_id}: {str(e)}")
                    continue

            return {
                "success": True,
                "total_tasks": len(task_ids),
                "successful_collections": len(results),
                "results": results,
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to collect scan results: {str(e)}",
            }

    async def parse_openvas_reports(self) -> Dict:
        """
        Manually trigger parsing of OpenVAS reports
        Returns:
            Dictionary with parsing results
        """
        try:
            print("🔍 Manually triggering OpenVAS report parsing...")

            from parse_openvas_reports import OpenVASReportProcessor

            processor = OpenVASReportProcessor()
            parse_success = await processor.process_reports()

            if parse_success:
                return {
                    "success": True,
                    "message": "OpenVAS reports parsed successfully",
                    "timestamp": datetime.now().isoformat(),
                }
            else:
                return {
                    "success": False,
                    "message": "OpenVAS report parsing completed with some issues",
                    "timestamp": datetime.now().isoformat(),
                }

        except Exception as parse_error:
            print(f"❌ Manual OpenVAS report parsing failed: {str(parse_error)}")
            import traceback

            traceback.print_exc()

            return {
                "success": False,
                "error": f"Manual parsing failed: {str(parse_error)}",
                "timestamp": datetime.now().isoformat(),
            }


# Function to get scan tools status (for backwards compatibility)
async def get_scan_tools_status() -> Dict:
    """Get scan tools status"""
    scan_service = ScanService()
    return await scan_service.get_scan_tools_status()


# Global instance
scan_service = ScanService()
