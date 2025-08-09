import nmap
import os
from datetime import datetime
from typing import Dict, Optional


class NmapService:
    def __init__(self):
        self.nm = nmap.PortScanner()

    async def scan_network(self, network: str, save_xml: bool = True) -> Dict:
        """
        Scan a network using Nmap and detect OS information
        Args:
            network: Network range (e.g., "192.168.1.0/24")
            save_xml: Whether to save XML results
        Returns:
            Dictionary with scan results
        """
        try:
            print(f"Starting Nmap scan for network: {network}")

            # Generate XML output file path if saving is enabled
            xml_path = ""
            # Remove XML output from arguments - we'll handle it separately
            arguments = "-sV -T4 -O -F --version-light"

            if save_xml:
                # Create scans directory if it doesn't exist
                scan_dir = "output/scans"
                os.makedirs(scan_dir, exist_ok=True)

                # Generate filename
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                network_safe = network.replace("/", "_").replace(".", "_")
                filename = f"nmap_scan_{network_safe}_{timestamp}.xml"
                xml_path = os.path.join(scan_dir, filename)

            # Perform the scan with specified arguments
            # -sV: Version detection
            # -T4: Timing template (aggressive)
            # -O: Enable OS detection
            # -F: Fast scan (top 100 ports)
            # --version-light: Light version detection
            # Note: XML output is handled separately using get_nmap_last_output()
            self.nm.scan(hosts=network, arguments=arguments)

            hosts = []

            for host in self.nm.all_hosts():
                print(f"Processing host: {host}")
                host_info = self._extract_host_info(host)
                if host_info:
                    print(f"Host info extracted: {host_info}")
                    hosts.append(host_info)
                else:
                    print(f"No host info extracted for {host}")

            # Save XML output if requested
            if save_xml and xml_path:
                try:
                    # Get XML output from python-nmap
                    xml_output = self.nm.get_nmap_last_output()
                    # Handle both string and bytes output
                    if isinstance(xml_output, bytes):
                        xml_output = xml_output.decode("utf-8")
                    with open(xml_path, "w", encoding="utf-8") as f:
                        f.write(xml_output)
                    print(f"XML output saved to: {xml_path}")
                except Exception as xml_error:
                    print(f"Warning: Could not save XML output: {xml_error}")
                    xml_path = ""  # Clear xml_path if saving failed

            result = {
                "network": network,
                "scan_time": datetime.now().isoformat(),
                "total_hosts": len(hosts),
                "hosts": hosts,
                "raw_xml": self.nm.get_nmap_last_output() if save_xml else None,
            }

            if save_xml and xml_path:
                result["xml_path"] = xml_path

            return result

        except Exception as e:
            print(f"Error during Nmap scan: {str(e)}")
            raise Exception(f"Nmap scan failed: {str(e)}")

    def _extract_host_info(self, host: str) -> Optional[Dict]:
        """Extract host information from Nmap scan result"""
        try:
            host_data = self.nm[host]

            # Check if host is up
            if host_data.state() != "up":
                return None

            # Get OS information
            os_info = self._extract_os_info(host_data)

            # Get MAC address and manufacturer
            mac_address = host_data.get("addresses", {}).get("mac", "")
            manufacturer = ""
            if mac_address:
                manufacturer = host_data.get("vendor", {}).get(mac_address, "")

            # Extract port information
            ports = self._extract_port_info(host_data)

            # Get hostname if available
            hostname = None
            if "hostnames" in host_data and host_data["hostnames"]:
                hostname = host_data["hostnames"][0].get("name", "")

            return {
                "ip": host,
                "hostname": hostname,
                "os": os_info,
                "mac_address": mac_address,
                "manufacturer": manufacturer,
                "ports": ports,
            }

        except Exception as e:
            print(f"Error extracting host info for {host}: {str(e)}")
            return None

    def _extract_os_info(self, host_data) -> str:
        """Extract OS information from host data"""
        try:
            if "osmatch" in host_data:
                os_matches = host_data["osmatch"]
                if os_matches:
                    best_match = os_matches[0]  # Get the best match
                    name = best_match.get("name", "").lower()

                    # Determine OS type
                    if "windows" in name:
                        return "Windows"
                    elif "linux" in name:
                        return "Linux"
                    elif "macos" in name or "mac os" in name:
                        return "macOS"
                    elif "freebsd" in name:
                        return "FreeBSD"
                    elif "openbsd" in name:
                        return "OpenBSD"
                    elif "netbsd" in name:
                        return "NetBSD"
                    elif "solaris" in name:
                        return "Solaris"
                    elif "unix" in name:
                        return "Unix"
                    else:
                        return best_match.get("name", "Unknown")

        except Exception as e:
            print(f"Error extracting OS info: {str(e)}")

        return "Unknown"

    def _extract_port_info(self, host_data) -> list:
        """Extract port information from host data"""
        ports = []
        try:
            if "tcp" in host_data:
                for port, port_data in host_data["tcp"].items():
                    port_info = {
                        "port": port,
                        "protocol": "tcp",
                        "state": port_data.get("state", "unknown"),
                        "service": port_data.get("name", "unknown"),
                        "version": port_data.get("version", ""),
                        "product": port_data.get("product", ""),
                    }
                    ports.append(port_info)

            if "udp" in host_data:
                for port, port_data in host_data["udp"].items():
                    port_info = {
                        "port": port,
                        "protocol": "udp",
                        "state": port_data.get("state", "unknown"),
                        "service": port_data.get("name", "unknown"),
                        "version": port_data.get("version", ""),
                        "product": port_data.get("product", ""),
                    }
                    ports.append(port_info)

        except Exception as e:
            print(f"Error extracting port info: {str(e)}")

        return ports


# Global instance
nmap_service = NmapService()
