import subprocess
import json
import os
from typing import Dict, List, Optional
import re


class SearchSploitService:
    def __init__(self):
        self.searchsploit_path = os.getenv("SEARCHSPLOIT_PATH", "searchsploit")
        self.use_ssh = os.getenv("SEARCHSPLOIT_USE_SSH", "false").lower() == "true"
        self.ssh_host = os.getenv("SEARCHSPLOIT_SSH_HOST", "192.168.56.10")
        self.ssh_user = os.getenv("SEARCHSPLOIT_SSH_USER", "kali")
        self.ssh_key_path = os.getenv("SEARCHSPLOIT_SSH_KEY", "")
        self.is_available = self._check_availability()

    def _check_availability(self) -> bool:
        """Check if searchsploit is available"""
        try:
            if self.use_ssh:
                # Check SSH connection and searchsploit availability
                ssh_cmd = self._build_ssh_command(["searchsploit", "--help"])
                result = subprocess.run(
                    ssh_cmd, capture_output=True, text=True, timeout=10
                )
                # SearchSploit --help returns exit code 2, but that's normal
                # Check if output contains searchsploit usage info
                return (
                    "searchsploit" in result.stderr.lower()
                    and "usage:" in result.stderr.lower()
                )
            else:
                result = subprocess.run(
                    [self.searchsploit_path, "--help"],
                    capture_output=True,
                    text=True,
                    timeout=10,
                )
                # For local searchsploit, also check stderr for usage info
                return result.returncode == 0 or (
                    "searchsploit" in result.stderr.lower()
                    and "usage:" in result.stderr.lower()
                )
        except Exception:
            return False

    def _build_ssh_command(self, remote_cmd: List[str]) -> List[str]:
        """Build SSH command for remote execution"""
        ssh_cmd = ["ssh"]

        # Add SSH key if specified
        if self.ssh_key_path:
            ssh_cmd.extend(["-i", self.ssh_key_path])

        # Add SSH options for non-interactive use
        ssh_cmd.extend(
            [
                "-o",
                "StrictHostKeyChecking=no",
                "-o",
                "UserKnownHostsFile=/dev/null",
                "-o",
                "LogLevel=ERROR",
            ]
        )

        # Add user@host
        ssh_cmd.append(f"{self.ssh_user}@{self.ssh_host}")

        # Add remote command
        ssh_cmd.append(" ".join(remote_cmd))

        return ssh_cmd

    async def search_cve(self, cve_id: str) -> Dict:
        """
        Search for exploits using CVE ID
        Args:
            cve_id: CVE identifier (e.g., "CVE-2023-12345")
        Returns:
            Dictionary with search results
        """
        if not self.is_available:
            raise Exception(
                "SearchSploit is not available. Please check your configuration and ensure SearchSploit is properly installed and accessible."
            )

        try:
            # Clean CVE ID
            cve_clean = cve_id.strip().upper()
            if not cve_clean.startswith("CVE-"):
                cve_clean = f"CVE-{cve_clean}"

            # Run searchsploit with JSON output
            if self.use_ssh:
                cmd = self._build_ssh_command(["searchsploit", "--json", cve_clean])
            else:
                cmd = [self.searchsploit_path, "--json", cve_clean]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

            if result.returncode != 0:
                return {
                    "success": False,
                    "cve_id": cve_id,
                    "exploitable": False,
                    "error": f"searchsploit command failed: {result.stderr}",
                }

            # Parse JSON output
            try:
                data = json.loads(result.stdout)
                exploits = data.get("RESULTS_EXPLOIT", [])

                if not exploits:
                    return {
                        "success": True,
                        "cve_id": cve_id,
                        "exploitable": False,
                        "exploit_count": 0,
                        "exploits": [],
                    }

                # Process exploits
                processed_exploits = []
                for exploit in exploits[:5]:  # Limit to top 5 results
                    processed_exploit = {
                        "title": exploit.get("Title", "Unknown"),
                        "path": exploit.get("Path", ""),
                        "date": exploit.get("Date_Published", ""),
                        "author": exploit.get("Author", ""),
                        "type": exploit.get("Type", ""),
                        "platform": exploit.get("Platform", ""),
                    }
                    processed_exploits.append(processed_exploit)

                return {
                    "success": True,
                    "cve_id": cve_id,
                    "exploitable": True,
                    "exploit_count": len(exploits),
                    "exploits": processed_exploits,
                    "command_example": self._generate_exploit_command(
                        processed_exploits[0] if processed_exploits else None
                    ),
                }

            except json.JSONDecodeError:
                # Fallback to parsing text output
                return self._parse_text_output(cve_id, result.stdout)

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "cve_id": cve_id,
                "exploitable": False,
                "error": "searchsploit command timed out",
            }
        except Exception as e:
            return {
                "success": False,
                "cve_id": cve_id,
                "exploitable": False,
                "error": f"searchsploit error: {str(e)}",
            }

    def _parse_text_output(self, cve_id: str, output: str) -> Dict:
        """Parse text output when JSON parsing fails"""
        try:
            lines = output.strip().split("\n")
            exploits = []

            # Skip header lines and parse exploit entries
            for line in lines:
                if (
                    "|" in line
                    and not line.startswith("-")
                    and "Exploit Title" not in line
                ):
                    parts = [part.strip() for part in line.split("|")]
                    if len(parts) >= 3:
                        exploits.append(
                            {
                                "title": parts[0],
                                "path": parts[-1],
                                "date": parts[1] if len(parts) > 3 else "",
                                "author": "",
                                "type": "",
                                "platform": "",
                            }
                        )

            return {
                "success": True,
                "cve_id": cve_id,
                "exploitable": len(exploits) > 0,
                "exploit_count": len(exploits),
                "exploits": exploits[:5],  # Limit to top 5
                "command_example": self._generate_exploit_command(
                    exploits[0] if exploits else None
                ),
            }

        except Exception as e:
            return {
                "success": False,
                "cve_id": cve_id,
                "exploitable": False,
                "error": f"Error parsing searchsploit output: {str(e)}",
            }

    def _generate_exploit_command(self, exploit: Optional[Dict]) -> str:
        """Generate example exploit command"""
        if not exploit:
            return ""

        path = exploit.get("path", "")
        if not path:
            return ""

        # Generate basic command based on file extension
        if path.endswith(".py"):
            return f"python {path} <target>"
        elif path.endswith(".rb"):
            return f"ruby {path}"
        elif path.endswith(".pl"):
            return f"perl {path}"
        elif path.endswith(".sh"):
            return f"bash {path}"
        elif path.endswith(".c"):
            return f"gcc {path} -o exploit && ./exploit"
        else:
            return f"# Manual review required: {path}"

    async def search_multiple_cves(self, cve_list: List[str]) -> Dict:
        """
        Search for exploits for multiple CVEs
        Args:
            cve_list: List of CVE identifiers
        Returns:
            Dictionary with results for all CVEs
        """
        results = {}

        for cve_id in cve_list:
            result = await self.search_cve(cve_id)
            results[cve_id] = result

        # Summary
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

    async def validate_finding(self, finding_id: str, cve_ids) -> Dict:
        """
        Validate a finding by searching for exploits across multiple CVEs
        Updates the finding status based on search results
        """
        # Handle both single CVE and array of CVEs
        if isinstance(cve_ids, str):
            cve_list = [cve_ids]
        elif isinstance(cve_ids, list):
            cve_list = cve_ids
        else:
            return {
                "success": False,
                "finding_id": finding_id,
                "cve_ids": cve_ids,
                "status": "NOT_VALIDATED",
                "error": "Invalid CVE ID format",
            }

        if not cve_list:
            return {
                "success": False,
                "finding_id": finding_id,
                "cve_ids": cve_ids,
                "status": "NOT_VALIDATED",
                "error": "No CVE IDs provided",
            }

        # Search for exploits for each CVE
        all_exploits = []
        exploitable_cves = []
        total_exploit_count = 0
        best_exploit_command = None

        for cve_id in cve_list:
            if not cve_id or not cve_id.strip():
                continue
                
            search_result = await self.search_cve(cve_id.strip())
            
            if search_result.get("success", False) and search_result.get("exploitable", False):
                exploitable_cves.append(cve_id)
                all_exploits.extend(search_result.get("exploits", []))
                total_exploit_count += search_result.get("exploit_count", 0)
                
                # Use the first exploit command found
                if not best_exploit_command and search_result.get("command_example"):
                    best_exploit_command = search_result.get("command_example")

        # Determine overall validation status
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
            "exploit_count": total_exploit_count,
            "exploit_command": best_exploit_command,
            "exploits": all_exploits[:10],  # Limit to top 10 exploits
        }


# Global instance
searchsploit_service = SearchSploitService()
