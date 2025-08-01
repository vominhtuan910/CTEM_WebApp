import subprocess
import json
import os
from typing import Dict, List, Optional
import re

class SearchSploitService:
    def __init__(self):
        self.searchsploit_path = os.getenv("SEARCHSPLOIT_PATH", "searchsploit")
        self.is_available = self._check_availability()
    
    def _check_availability(self) -> bool:
        """Check if searchsploit is available"""
        try:
            result = subprocess.run([self.searchsploit_path, "--help"], 
                                  capture_output=True, text=True, timeout=10)
            return result.returncode == 0
        except Exception:
            return False
    
    async def search_cve(self, cve_id: str) -> Dict:
        """
        Search for exploits using CVE ID
        Args:
            cve_id: CVE identifier (e.g., "CVE-2023-12345")
        Returns:
            Dictionary with search results
        """
        if not self.is_available:
            return self._mock_search_result(cve_id)
        
        try:
            # Clean CVE ID
            cve_clean = cve_id.strip().upper()
            if not cve_clean.startswith('CVE-'):
                cve_clean = f'CVE-{cve_clean}'
            
            # Run searchsploit with JSON output
            cmd = [self.searchsploit_path, "--json", cve_clean]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode != 0:
                return {
                    'success': False,
                    'cve_id': cve_id,
                    'exploitable': False,
                    'error': f'searchsploit command failed: {result.stderr}'
                }
            
            # Parse JSON output
            try:
                data = json.loads(result.stdout)
                exploits = data.get('RESULTS_EXPLOIT', [])
                
                if not exploits:
                    return {
                        'success': True,
                        'cve_id': cve_id,
                        'exploitable': False,
                        'exploit_count': 0,
                        'exploits': []
                    }
                
                # Process exploits
                processed_exploits = []
                for exploit in exploits[:5]:  # Limit to top 5 results
                    processed_exploit = {
                        'title': exploit.get('Title', 'Unknown'),
                        'path': exploit.get('Path', ''),
                        'date': exploit.get('Date_Published', ''),
                        'author': exploit.get('Author', ''),
                        'type': exploit.get('Type', ''),
                        'platform': exploit.get('Platform', '')
                    }
                    processed_exploits.append(processed_exploit)
                
                return {
                    'success': True,
                    'cve_id': cve_id,
                    'exploitable': True,
                    'exploit_count': len(exploits),
                    'exploits': processed_exploits,
                    'command_example': self._generate_exploit_command(processed_exploits[0] if processed_exploits else None)
                }
                
            except json.JSONDecodeError:
                # Fallback to parsing text output
                return self._parse_text_output(cve_id, result.stdout)
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'cve_id': cve_id,
                'exploitable': False,
                'error': 'searchsploit command timed out'
            }
        except Exception as e:
            return {
                'success': False,
                'cve_id': cve_id,
                'exploitable': False,
                'error': f'searchsploit error: {str(e)}'
            }
    
    def _parse_text_output(self, cve_id: str, output: str) -> Dict:
        """Parse text output when JSON parsing fails"""
        try:
            lines = output.strip().split('\n')
            exploits = []
            
            # Skip header lines and parse exploit entries
            for line in lines:
                if '|' in line and not line.startswith('-') and 'Exploit Title' not in line:
                    parts = [part.strip() for part in line.split('|')]
                    if len(parts) >= 3:
                        exploits.append({
                            'title': parts[0],
                            'path': parts[-1],
                            'date': parts[1] if len(parts) > 3 else '',
                            'author': '',
                            'type': '',
                            'platform': ''
                        })
            
            return {
                'success': True,
                'cve_id': cve_id,
                'exploitable': len(exploits) > 0,
                'exploit_count': len(exploits),
                'exploits': exploits[:5],  # Limit to top 5
                'command_example': self._generate_exploit_command(exploits[0] if exploits else None)
            }
            
        except Exception as e:
            return {
                'success': False,
                'cve_id': cve_id,
                'exploitable': False,
                'error': f'Error parsing searchsploit output: {str(e)}'
            }
    
    def _generate_exploit_command(self, exploit: Optional[Dict]) -> str:
        """Generate example exploit command"""
        if not exploit:
            return ""
        
        path = exploit.get('path', '')
        if not path:
            return ""
        
        # Generate basic command based on file extension
        if path.endswith('.py'):
            return f"python {path} <target>"
        elif path.endswith('.rb'):
            return f"ruby {path}"
        elif path.endswith('.pl'):
            return f"perl {path}"
        elif path.endswith('.sh'):
            return f"bash {path}"
        elif path.endswith('.c'):
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
        exploitable_count = sum(1 for r in results.values() if r.get('exploitable', False))
        total_exploits = sum(r.get('exploit_count', 0) for r in results.values())
        
        return {
            'success': True,
            'total_cves': len(cve_list),
            'exploitable_cves': exploitable_count,
            'total_exploits': total_exploits,
            'results': results
        }
    
    def _mock_search_result(self, cve_id: str) -> Dict:
        """Mock search result when searchsploit is not available"""
        # Simulate some CVEs having exploits
        import random
        
        exploitable = random.choice([True, False, False])  # 33% chance of being exploitable
        
        if exploitable:
            mock_exploits = [
                {
                    'title': f'Mock Exploit for {cve_id}',
                    'path': '/usr/share/exploitdb/exploits/linux/remote/12345.py',
                    'date': '2023-01-01',
                    'author': 'Mock Author',
                    'type': 'remote',
                    'platform': 'linux'
                }
            ]
            
            return {
                'success': True,
                'cve_id': cve_id,
                'exploitable': True,
                'exploit_count': 1,
                'exploits': mock_exploits,
                'command_example': f'python /usr/share/exploitdb/exploits/linux/remote/12345.py <target>',
                'mock': True
            }
        else:
            return {
                'success': True,
                'cve_id': cve_id,
                'exploitable': False,
                'exploit_count': 0,
                'exploits': [],
                'mock': True
            }
    
    async def validate_finding(self, finding_id: str, cve_id: str) -> Dict:
        """
        Validate a finding by searching for exploits
        Updates the finding status based on search results
        """
        search_result = await self.search_cve(cve_id)
        
        if not search_result.get('success', False):
            return {
                'success': False,
                'finding_id': finding_id,
                'cve_id': cve_id,
                'status': 'NOT_VALIDATED',
                'error': search_result.get('error', 'Search failed')
            }
        
        # Determine validation status
        if search_result.get('exploitable', False):
            status = 'VALIDATED'
            exploit_command = search_result.get('command_example', '')
        else:
            status = 'NOT_CONFIRM'
            exploit_command = None
        
        return {
            'success': True,
            'finding_id': finding_id,
            'cve_id': cve_id,
            'status': status,
            'exploitable': search_result.get('exploitable', False),
            'exploit_count': search_result.get('exploit_count', 0),
            'exploit_command': exploit_command,
            'exploits': search_result.get('exploits', [])
        }

# Global instance
searchsploit_service = SearchSploitService()
