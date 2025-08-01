import nmap
import xml.etree.ElementTree as ET
import os
import json
from datetime import datetime
from typing import List, Dict, Optional
import subprocess
import socket

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
            
            # Perform the scan with OS detection
            # -sn: Ping scan (no port scan)
            # -O: Enable OS detection
            # --osscan-guess: Guess OS more aggressively
            scan_result = self.nm.scan(hosts=network, arguments='-sn -O --osscan-guess')
            
            hosts = []
            
            for host in self.nm.all_hosts():
                host_info = self._extract_host_info(host)
                if host_info:
                    hosts.append(host_info)
            
            result = {
                'network': network,
                'scan_time': datetime.now().isoformat(),
                'total_hosts': len(hosts),
                'hosts': hosts,
                'raw_xml': self.nm._scan_result if save_xml else None
            }
            
            if save_xml:
                xml_path = self._save_xml_result(network, self.nm._scan_result)
                result['xml_path'] = xml_path
            
            return result
            
        except Exception as e:
            print(f"Error during Nmap scan: {str(e)}")
            raise Exception(f"Nmap scan failed: {str(e)}")
    
    def _extract_host_info(self, host: str) -> Optional[Dict]:
        """Extract host information from Nmap scan result"""
        try:
            host_data = self.nm[host]
            
            # Check if host is up
            if host_data.state() != 'up':
                return None
            
            # Get hostname
            hostname = host_data.hostname() if host_data.hostname() else self._resolve_hostname(host)
            
            # Get OS information
            os_info = self._extract_os_info(host_data)
            
            # Get basic port information if available
            ports = []
            if 'tcp' in host_data:
                for port in host_data['tcp'].keys():
                    port_info = host_data['tcp'][port]
                    ports.append({
                        'port': port,
                        'state': port_info['state'],
                        'service': port_info.get('name', 'unknown'),
                        'version': port_info.get('version', '')
                    })
            
            return {
                'ip': host,
                'hostname': hostname,
                'os': os_info,
                'status': 'up',
                'ports': ports[:10],  # Limit to first 10 ports
                'mac_address': host_data.get('addresses', {}).get('mac', ''),
                'vendor': host_data.get('vendor', {}).get(host_data.get('addresses', {}).get('mac', ''), '')
            }
            
        except Exception as e:
            print(f"Error extracting host info for {host}: {str(e)}")
            return None
    
    def _extract_os_info(self, host_data) -> Dict:
        """Extract OS information from host data"""
        os_info = {
            'name': 'Unknown',
            'version': '',
            'architecture': '',
            'accuracy': 0
        }
        
        try:
            if 'osmatch' in host_data:
                os_matches = host_data['osmatch']
                if os_matches:
                    best_match = os_matches[0]  # Get the best match
                    os_info.update({
                        'name': best_match.get('name', 'Unknown'),
                        'accuracy': int(best_match.get('accuracy', 0))
                    })
                    
                    # Try to extract version and architecture from name
                    name = best_match.get('name', '')
                    if 'Windows' in name:
                        os_info['name'] = 'Windows'
                        if 'Server' in name:
                            os_info['version'] = 'Server'
                        elif '10' in name:
                            os_info['version'] = '10'
                        elif '11' in name:
                            os_info['version'] = '11'
                    elif 'Linux' in name:
                        os_info['name'] = 'Linux'
                        if 'Ubuntu' in name:
                            os_info['name'] = 'Ubuntu'
                        elif 'CentOS' in name:
                            os_info['name'] = 'CentOS'
                        elif 'Debian' in name:
                            os_info['name'] = 'Debian'
                    elif 'macOS' in name or 'Mac OS' in name:
                        os_info['name'] = 'macOS'
            
        except Exception as e:
            print(f"Error extracting OS info: {str(e)}")
        
        return os_info
    
    def _resolve_hostname(self, ip: str) -> str:
        """Try to resolve hostname from IP"""
        try:
            hostname = socket.gethostbyaddr(ip)[0]
            return hostname
        except:
            return ip
    
    def _save_xml_result(self, network: str, xml_content: str) -> str:
        """Save XML scan result to file"""
        try:
            # Create scans directory if it doesn't exist
            scan_dir = "output/scans"
            os.makedirs(scan_dir, exist_ok=True)
            
            # Generate filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            network_safe = network.replace("/", "_").replace(".", "_")
            filename = f"nmap_scan_{network_safe}_{timestamp}.xml"
            filepath = os.path.join(scan_dir, filename)
            
            # Save XML content
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(xml_content)
            
            return filepath
            
        except Exception as e:
            print(f"Error saving XML result: {str(e)}")
            return ""
    
    async def scan_single_host(self, host: str, port_scan: bool = True) -> Dict:
        """
        Scan a single host with detailed port information
        Args:
            host: IP address or hostname
            port_scan: Whether to perform port scanning
        """
        try:
            if port_scan:
                # Scan common ports with version detection
                arguments = '-sV -sC --top-ports 1000'
            else:
                # Just ping and OS detection
                arguments = '-sn -O'
            
            scan_result = self.nm.scan(hosts=host, arguments=arguments)
            
            if host in self.nm.all_hosts():
                host_info = self._extract_host_info(host)
                return {
                    'success': True,
                    'host': host_info,
                    'scan_time': datetime.now().isoformat()
                }
            else:
                return {
                    'success': False,
                    'error': f'Host {host} is not reachable or up'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Scan failed: {str(e)}'
            }

# Global instance
nmap_service = NmapService()
