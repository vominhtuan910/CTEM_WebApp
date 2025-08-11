import subprocess
import os
import tempfile
from typing import Dict, List


class MetasploitService:
    def __init__(self):
        # Metasploit configuration
        self.msfconsole_path = os.getenv("MSFCONSOLE_PATH", "msfconsole")
        self.is_available = self._check_availability()

    def _check_availability(self) -> bool:
        """Check if Metasploit Framework is available locally"""
        try:
            import platform

            is_windows = platform.system().lower() == "windows"

            result = subprocess.run(
                [self.msfconsole_path, "--version"],
                capture_output=True,
                text=True,
                timeout=30,
                shell=is_windows,
            )
            return result.returncode == 0
        except Exception as e:
            print(f"Metasploit availability check failed: {e}")
            return False

    async def search_cve(self, cve_id: str) -> Dict:
        """Search for exploits for a specific CVE using Metasploit"""
        if not self.is_available:
            return {
                "success": False,
                "cve_id": cve_id,
                "exploitable": False,
                "error": "Metasploit Framework is not available",
            }

        try:
            # Clean CVE ID
            cve_clean = cve_id.strip().upper()
            if not cve_clean.startswith("CVE-"):
                cve_clean = f"CVE-{cve_clean}"

            # Create a temporary script file for the CVE search
            with tempfile.NamedTemporaryFile(
                mode="w", suffix=".rc", delete=False
            ) as temp_file:
                temp_file.write(f"search cve:{cve_clean}\n")
                temp_file.write("exit\n")
                temp_file_path = temp_file.name

            try:
                # Execute using the script file
                import platform

                is_windows = platform.system().lower() == "windows"

                result = subprocess.run(
                    [self.msfconsole_path, "-q", "-r", temp_file_path],
                    capture_output=True,
                    text=True,
                    timeout=60,
                    shell=is_windows,
                )

                if result.returncode == 0:
                    return self._parse_simple_output(result.stdout, cve_clean)
                else:
                    return {
                        "success": False,
                        "cve_id": cve_clean,
                        "exploitable": False,
                        "error": f"Metasploit search failed: {result.stderr}",
                    }

            finally:
                # Clean up the temporary file
                try:
                    os.unlink(temp_file_path)
                except Exception as e:
                    print(
                        f"Warning: Could not delete temporary file {temp_file_path}: {e}"
                    )

        except Exception as e:
            return {
                "success": False,
                "cve_id": cve_id,
                "exploitable": False,
                "error": f"CVE search error: {str(e)}",
            }

    def _parse_simple_output(self, output: str, cve_id: str) -> Dict:
        """Parse Metasploit search output to extract basic exploit information"""
        try:
            exploits = []
            lines = output.split("\n")

            for line in lines:
                line = line.strip()

                # Skip marker lines
                if line.startswith("===") and "CVE_START" in line:
                    continue
                if line.startswith("===") and "CVE_END" in line:
                    continue

                # Look for exploit lines that contain "exploit/" (they start with a number)
                if line and line[0].isdigit() and "exploit/" in line:
                    # Parse the format: "0   exploit/multi/http/log4shell_header_injection  2021-12-09      excellent  Yes    Log4Shell HTTP Header Injection"
                    parts = line.split(None, 5)  # Split on whitespace, max 6 parts
                    if len(parts) >= 6:
                        module = parts[1]  # exploit path (index 1 after the number)
                        rank = parts[3]  # exploit rank (index 3)
                        description = parts[5]  # description (index 5)

                        exploit_info = {
                            "module": module,
                            "rank": rank,
                            "description": description,
                        }
                        exploits.append(exploit_info)

            if exploits:
                return {
                    "success": True,
                    "cve_id": cve_id,
                    "exploitable": True,
                    "exploit_count": len(exploits),
                    "exploits": exploits,
                }
            else:
                return {
                    "success": True,
                    "cve_id": cve_id,
                    "exploitable": False,
                    "exploit_count": 0,
                    "exploits": [],
                }

        except Exception as e:
            return {
                "success": False,
                "cve_id": cve_id,
                "exploitable": False,
                "error": f"Parse error: {str(e)}",
            }

    async def search_multiple_cves(self, cve_list: List[str]) -> Dict:
        """Search for exploits for multiple CVEs"""
        if not self.is_available:
            return {
                "success": False,
                "error": "Metasploit Framework is not available",
                "results": {},
            }

        if not cve_list:
            return {"success": True, "total_cves": 0, "results": {}}

        results = {}
        exploitable_count = 0
        total_exploits = 0

        for cve_id in cve_list:
            try:
                result = await self.search_cve(cve_id)
                results[cve_id] = result

                if result.get("success") and result.get("exploitable"):
                    exploitable_count += 1
                    total_exploits += result.get("exploit_count", 0)

            except Exception as e:
                results[cve_id] = {
                    "success": False,
                    "cve_id": cve_id,
                    "exploitable": False,
                    "error": f"Search failed: {str(e)}",
                }

        return {
            "success": True,
            "total_cves": len(cve_list),
            "exploitable_cves": exploitable_count,
            "total_exploits": total_exploits,
            "results": results,
        }

    async def validate_finding(self, finding_id: str, cve_ids) -> Dict:
        """Validate a finding by checking if CVEs are exploitable"""
        # Handle both single CVE and array of CVEs
        if isinstance(cve_ids, str):
            cve_list = [cve_ids] if cve_ids.strip() else []
        elif isinstance(cve_ids, list):
            cve_list = [cve for cve in cve_ids if cve and cve.strip()]
        else:
            cve_list = []

        if not cve_list:
            return {
                "success": False,
                "finding_id": finding_id,
                "error": "No valid CVE IDs provided",
            }

        # Search for exploits for all CVEs
        search_results = await self.search_multiple_cves(cve_list)

        if not search_results.get("success", False):
            return {
                "success": False,
                "finding_id": finding_id,
                "error": search_results.get("error", "Search failed"),
            }

        # Check if any CVEs are exploitable
        exploitable_cves = []
        all_exploits = []

        for cve_id, cve_result in search_results.get("results", {}).items():
            if cve_result.get("success", False) and cve_result.get(
                "exploitable", False
            ):
                exploitable_cves.append(cve_id)
                all_exploits.extend(cve_result.get("exploits", []))

        # Determine status
        if exploitable_cves:
            status = "VALIDATED"
            exploitable = True
        else:
            status = "NOT_CONFIRM"
            exploitable = False

        return {
            "success": True,
            "finding_id": finding_id,
            "cve_ids": cve_ids,
            "exploitable_cves": exploitable_cves,
            "status": status,
            "exploitable": exploitable,
            "exploit_count": len(all_exploits),
            "exploits": all_exploits,
        }

    async def validate_multiple_findings_simplified(
        self, findings_data: List[Dict]
    ) -> Dict:
        """
        OPTIMIZED: Validate multiple findings using a single batch Metasploit session
        Much faster than individual CVE searches
        """
        if not self.is_available:
            return {
                "success": False,
                "error": "Metasploit Framework is not available",
                "results": {},
            }

        results = {}
        validated_count = 0
        not_confirmed_count = 0
        error_count = 0

        try:
            # Collect all unique CVEs from all findings
            all_cves = set()
            finding_cve_map = {}

            for finding_data in findings_data:
                finding_id = finding_data["finding_id"]
                cve_ids = finding_data["cve_ids"]

                # Handle both single CVE and array of CVEs
                if isinstance(cve_ids, str):
                    cve_list = [cve_ids] if cve_ids.strip() else []
                elif isinstance(cve_ids, list):
                    cve_list = [cve for cve in cve_ids if cve and cve.strip()]
                else:
                    cve_list = []

                if cve_list:
                    finding_cve_map[finding_id] = cve_list
                    all_cves.update(cve_list)

            # Batch search all unique CVEs in ONE session
            if all_cves:
                print(
                    f"🚀 METASPLOIT: Batch searching {len(all_cves)} unique CVEs for {len(findings_data)} findings"
                )
                batch_results = await self.search_multiple_cves_optimized(
                    list(all_cves)
                )
                cve_exploit_map = batch_results.get("results", {})
            else:
                cve_exploit_map = {}

            # Process each finding using the cached CVE results
            for finding_data in findings_data:
                finding_id = finding_data["finding_id"]

                if finding_id not in finding_cve_map:
                    results[finding_id] = {
                        "success": False,
                        "finding_id": finding_id,
                        "status": "NOT_VALIDATED",
                        "error": "No valid CVE IDs",
                    }
                    error_count += 1
                    continue

                cve_list = finding_cve_map[finding_id]

                # Aggregate results for this finding's CVEs
                exploitable_cves = []
                all_exploits = []

                for cve_id in cve_list:
                    cve_result = cve_exploit_map.get(cve_id, {})

                    if cve_result.get("success", False) and cve_result.get(
                        "exploitable", False
                    ):
                        exploitable_cves.append(cve_id)
                        all_exploits.extend(cve_result.get("exploits", []))

                # Determine status
                if exploitable_cves:
                    status = "VALIDATED"
                    exploitable = True
                    validated_count += 1
                else:
                    status = "NOT_CONFIRM"
                    exploitable = False
                    not_confirmed_count += 1

                results[finding_id] = {
                    "success": True,
                    "finding_id": finding_id,
                    "cve_ids": finding_data["cve_ids"],
                    "exploitable_cves": exploitable_cves,
                    "status": status,
                    "exploitable": exploitable,
                    "exploit_count": len(all_exploits),
                    "exploits": all_exploits,
                }

            return {
                "success": True,
                "total_findings": len(findings_data),
                "validated_count": validated_count,
                "not_confirmed_count": not_confirmed_count,
                "error_count": error_count,
                "results": results,
                "performance_note": f"Metasploit batch processed {len(all_cves)} unique CVEs instead of {sum(len(finding_cve_map.get(f['finding_id'], [])) for f in findings_data)} individual searches",
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Batch validation error: {str(e)}",
                "results": results,
            }

    async def search_multiple_cves_optimized(self, cve_list: List[str]) -> Dict:
        """
        OPTIMIZED: Search for exploits for multiple CVEs using a single Metasploit session
        Uses a single msfconsole session for all CVE searches
        """
        if not self.is_available:
            return {
                "success": False,
                "error": "Metasploit Framework is not available",
                "results": {},
            }

        if not cve_list:
            return {"success": True, "total_cves": 0, "results": {}}

        try:
            # Clean CVE IDs
            clean_cves = []
            for cve_id in cve_list:
                cve_clean = cve_id.strip().upper()
                if not cve_clean.startswith("CVE-"):
                    cve_clean = f"CVE-{cve_clean}"
                clean_cves.append(cve_clean)

            print(f"🚀 METASPLOIT OPTIMIZED: Batch search for {len(clean_cves)} CVEs")

            # Create a temporary script file to avoid command line length issues
            with tempfile.NamedTemporaryFile(
                mode="w", suffix=".rc", delete=False
            ) as temp_file:
                # Write individual search commands for each CVE
                for cve in clean_cves:
                    temp_file.write(f"search cve:{cve}\n")
                    temp_file.write("back\n")  # Return to main prompt after each search
                temp_file.write("exit\n")
                temp_file_path = temp_file.name

            # Debug: Print the script contents
            print(f"🔍 DEBUG: Created batch script: {temp_file_path}")
            with open(temp_file_path, "r") as f:
                print(f"🔍 DEBUG: Script contents:")
                print(f.read())

            try:
                # Execute using the script file
                import platform

                is_windows = platform.system().lower() == "windows"

                result = subprocess.run(
                    [self.msfconsole_path, "-q", "-r", temp_file_path],
                    capture_output=True,
                    text=True,
                    timeout=300,
                    shell=is_windows,  # Use shell for .bat files on Windows
                )

                if result.returncode == 0:
                    results = self._parse_batch_msf_output(result.stdout, clean_cves)
                else:
                    print(f"Batch Metasploit search failed: {result.stderr}")
                    # Fallback to individual searches
                    results = {}
                    for cve in clean_cves:
                        try:
                            individual_result = await self.search_cve(cve)
                            results[cve] = individual_result
                        except Exception as e:
                            results[cve] = {
                                "success": False,
                                "cve_id": cve,
                                "exploitable": False,
                                "error": f"Search failed: {str(e)}",
                            }

            finally:
                # Clean up the temporary file
                try:
                    os.unlink(temp_file_path)
                except Exception as e:
                    print(
                        f"Warning: Could not delete temporary file {temp_file_path}: {e}"
                    )

            # Calculate summary
            exploitable_count = sum(
                1 for r in results.values() if r.get("exploitable", False)
            )
            total_exploits = sum(r.get("exploit_count", 0) for r in results.values())

            return {
                "success": True,
                "total_cves": len(cve_list),
                "exploitable_cves": exploitable_count,
                "total_exploits": total_exploits,
                "results": results,
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Batch search error: {str(e)}",
                "results": {},
            }

    def _parse_batch_msf_output(self, output: str, cve_list: List[str]) -> Dict:
        """Parse batch Metasploit output by identifying CVE search results"""
        results = {}

        # Initialize results for all CVEs
        for cve in cve_list:
            results[cve] = {
                "success": True,
                "cve_id": cve,
                "exploitable": False,
                "exploit_count": 0,
                "exploits": [],
            }

        print(f"🔍 DEBUG: Parsing batch output for {len(cve_list)} CVEs")
        print(f"🔍 DEBUG: Output length: {len(output)} characters")

        lines = output.split("\n")
        current_cve = None
        current_exploits = []
        in_search_results = False

        for line in lines:
            line = line.strip()

            # Look for CVE search lines
            if "search cve:" in line:
                # If we have a previous CVE with exploits, save them
                if current_cve and current_exploits:
                    results[current_cve]["exploits"] = current_exploits
                    results[current_cve]["exploit_count"] = len(current_exploits)
                    results[current_cve]["exploitable"] = len(current_exploits) > 0

                # Start new CVE
                current_cve = line.split("cve:")[1].strip()
                current_exploits = []
                in_search_results = False

            # Look for the start of search results (usually after "Matching Modules" or similar)
            elif "Matching Modules" in line:
                in_search_results = True

            # Look for exploit lines that contain "exploit/" (they start with a number)
            elif (
                in_search_results and line and line[0].isdigit() and "exploit/" in line
            ):
                # Parse the format: "0   exploit/multi/http/log4shell_header_injection  2021-12-09      excellent  Yes    Log4Shell HTTP Header Injection"
                parts = line.split(None, 5)  # Split on whitespace, max 6 parts
                if len(parts) >= 6:
                    module = parts[1]  # exploit path (index 1 after the number)
                    rank = parts[3]  # exploit rank (index 3)
                    description = parts[5]  # description (index 5)

                    exploit_info = {
                        "module": module,
                        "rank": rank,
                        "description": description,
                    }
                    current_exploits.append(exploit_info)

            # Look for end of search results (empty line or prompt)
            elif in_search_results and (
                line.startswith("Interact with") or line.startswith("After interacting")
            ):
                in_search_results = False

        # Save the last CVE's exploits
        if current_cve and current_exploits:
            results[current_cve]["exploits"] = current_exploits
            results[current_cve]["exploit_count"] = len(current_exploits)
            results[current_cve]["exploitable"] = len(current_exploits) > 0

        return results


# Global instance
metasploit_service = MetasploitService()
