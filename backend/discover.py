import sys
import os
import platform
import subprocess
import re 
from datetime import datetime
import nmap
import json

def RunCmd(command):
    
    try:
        
        result = subprocess.run(command, capture_output=True, text=True, check=True, shell=True)
        return result.stdout
        
    except subprocess.CalledProcessError as e:
        print(f"Lỗi khi chạy lệnh: {e}")
        print(f"Stderr: {e.stderr}")
        return None
    except FileNotFoundError:
        print(f"Lệnh '{' '.join(command)}' không tìm thấy. Hãy kiểm tra xem lệnh có tồn tại trên hệ thống của bạn không.")
        return None


def ListOfConnectionsForWin():
    
    command = "netstat -an"
    output = RunCmd(command)

    if not output:
        return {"ipv4_ports": [], "ipv6_ports": []}

    lines = output.strip().split('\n')
    
    ipv4_open_ports = []
    ipv6_open_ports = []


    for line in lines:
        line = line.strip()
        if "LISTENING" in line:
            parts = line.split(maxsplit=3)
            
            if len(parts) >= 4:
                proto = parts[0]
                local_address = parts[1]
                foreign_address = parts[2]
                state = parts[3]

                # Kiểm tra xem Local Address có phải là IPv6 hay không
                if local_address.startswith('[') :
                    # Địa chỉ IPv6
                    match = re.match(r'\[(.*)\]:(\d+)', local_address)
                    if match:
                        ipv6_addr = match.group(1)
                        port = match.group(2)
                        ipv6_open_ports.append({
                            "Proto": proto.upper(), # TCP/UDP
                            "Local Address": f"[{ipv6_addr}]:{port}",
                            "State": state
                        })
                else:
                    # Địa chỉ IPv4
                    # Kiểm tra định dạng IPv4: Địa chỉ IP và cổng
                    if ':' in local_address and re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$", local_address.split(':')[0] + ":" + local_address.split(':')[1]):
                        ipv4_open_ports.append({
                            "Proto": proto.upper(), # TCP/UDP
                            "Local Address": local_address,
                            "State": state
                        })

    return {
        "ipv4_ports": ipv4_open_ports,
        "ipv6_ports": ipv6_open_ports
    }


def ListOfInstalledAppsForWin():
    
    command = "winget list"
    output = RunCmd(command)

    if not output:
        return []

    lines = output.strip().split('\n')
    installed_apps = []

    header_line_index = -1
    header_found = False
    for i, line in enumerate(lines):
        if line.startswith('Name') and 'Id' in line and 'Version' in line and 'Source' in line:
            header_line_index = i
            header_found = True
            break
    
    if not header_found:
        print("Không tìm thấy dòng tiêu đề 'Name', 'Id', 'Version', 'Source' trong đầu ra của 'winget list'.")
        print("Định dạng đầu ra có thể đã thay đổi hoặc không có ứng dụng nào được liệt kê.")
        return []

    header_line = lines[header_line_index]
    separator_line = lines[header_line_index + 1]
    col_starts = []
    col_starts.append(0) 

    id_start = header_line.find('Id')
    if id_start != -1:
        col_starts.append(id_start)

    version_start = header_line.find('Version')
    if version_start != -1:
        col_starts.append(version_start)
    
    source_start = header_line.find('Source')
    if source_start != -1:
        col_starts.append(source_start)

    col_starts.sort()

    
    for line_num in range(header_line_index + 2, len(lines)):
        line = lines[line_num].strip()
        if not line: 
            continue
        
        if line.startswith('----') or "No installed packages found" in line:
            continue

        app_info = {}
        try:
            app_info['Name'] = line[col_starts[0]:col_starts[1]].strip()
            
            app_info['Id'] = line[col_starts[1]:col_starts[2]].strip()
            
            app_info['Version'] = line[col_starts[2]:col_starts[3]].strip()
            
            app_info['Source'] = line[col_starts[3]:].strip()
            
            if app_info['Name'] and app_info['Id']:
                installed_apps.append(app_info)
        except IndexError:
            pass
        except Exception as e:
            pass


    return installed_apps


def PrintConnectionForWin():
    
    open_ports_info = ListOfConnectionsForWin()

    print("--- Các cổng đang mở trên IPv4 (LISTENING) ---")
    if open_ports_info["ipv4_ports"]:
        for port in open_ports_info["ipv4_ports"]:
            print(f"Proto: {port['Proto']}, Local Address: {port['Local Address']}, State: {port['State']}")
    else:
        print("Không tìm thấy cổng IPv4 nào đang mở.")

    print("\n--- Các cổng đang mở trên IPv6 (LISTENING) ---")
    if open_ports_info["ipv6_ports"]:
        for port in open_ports_info["ipv6_ports"]:
            print(f"Proto: {port['Proto']}, Local Address: {port['Local Address']}, State: {port['State']}")
    else:
        print("Không tìm thấy cổng IPv6 nào đang mở.")


def PrintInstalledAppsForWin():
    
    apps = ListOfInstalledAppsForWin()

    if apps:
        print("\n--- Danh sách các ứng dụng đã cài đặt ---")
        for i, app in enumerate(apps):
            print(f"{i+1}. Tên: {app.get('Name', 'N/A')}")
            print(f"   ID: {app.get('Id', 'N/A')}")
            print(f"   Phiên bản: {app.get('Version', 'N/A')}")
            print("-" * 30)
        print(f"\nTổng số ứng dụng tìm thấy: {len(apps)}")
    else:
        print("Không tìm thấy ứng dụng nào hoặc không thể thực thi lệnh 'winget list'.")
        print("Hãy đảm bảo bạn đang chạy script trên Windows và 'winget' đã được cài đặt.")


def GetListOfInstalledAppsForWin():
   
    filename = "app"
    now = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    report_dir = 'reports\Apps-Packages'
    os.makedirs(report_dir, exist_ok=True)
    path = os.path.join(report_dir, f'{filename}_{now}.json')
    command = "Get-WinGetPackage | Select-Object Id, Name, Version | ConvertTo-Json | Set-Content " + path
    try:
        subprocess.run(["powershell", "-Command", command], capture_output=True, text=True)
    except subprocess.CalledProcessError as e:
        print(f"Lỗi khi chạy lệnh: {e}")
        print(f"Stderr: {e.stderr}")
                
    except FileNotFoundError:
        print(f"Lệnh không tìm thấy. Hãy kiểm tra xem lệnh có tồn tại trên hệ thống của bạn không.")
                
    
def ListOfConnectionsForLinux():
    
    command = "ss -tuln" 
    output = RunCmd(command, True)

    if not output:
        print("Không thể lấy đầu ra từ 'ss -tuln'. Thử lại với 'netstat -tuln'...")
        command = "netstat -tuln" 
        output = RunCmd(command)
        if not output:
            return {"ipv4_ports": [], "ipv6_ports": []}

    lines = output.strip().split('\n')
    
    ipv4_open_ports = []
    ipv6_open_ports = []

    for line in lines:
        line = line.strip()
        
        if line.startswith("Netid") or line.startswith("Proto") or "LISTEN" not in line.upper():
            continue
        
        parts = line.split()
        
        proto = parts[0] 
        local_address_with_port = ""
        
        if len(parts) >= 4:
            local_address_with_port = parts[3] # ss
            if "netstat" in command: # netstat 
                 if len(parts) >= 4:
                     local_address_with_port = parts[3] 
        else:
            continue 

        state = "LISTENING" # Với ss -tuln, tất cả đều là listening

        # Kiểm tra xem Local Address có phải là IPv6 hay không
        if local_address_with_port.startswith('[') and ']' in local_address_with_port:
            
            match = re.match(r'\[(.*)\]:(\d+)', local_address_with_port)
            if match:
                ipv6_addr = match.group(1)
                port = match.group(2)
                ipv6_open_ports.append({
                    "Proto": proto.upper(),
                    "Local Address": f"[{ipv6_addr}]:{port}",
                    "State": state
                })
        elif ':' in local_address_with_port:
            
            ip_part = local_address_with_port.split(':')[0]
            if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", ip_part) or ip_part == "0.0.0.0":
                ipv4_open_ports.append({
                    "Proto": proto.upper(),
                    "Local Address": local_address_with_port,
                    "State": state
                })

    return {
        "ipv4_ports": ipv4_open_ports,
        "ipv6_ports": ipv6_open_ports
    }


def ListOfInstalledAppsAndPackagesForLinux():
      
    distro = platform.system()
    if distro != "Linux":
        print("Chức năng này chỉ hỗ trợ Linux.")
        return []

    package_manager_info = {}
    try:
        
        with open("/etc/os-release") as f:
            for line in f:
                if "=" in line:
                    key, value = line.strip().split("=", 1)
                    package_manager_info[key] = value.strip('"')
    except FileNotFoundError:
        pass 

    # Dựa vào ID để chọn lệnh
    pm_command = None
    if "ID" in package_manager_info:
        if package_manager_info["ID"] in ["debian", "ubuntu", "linuxmint"]:
            pm_command = "dpkg -l"
        elif package_manager_info["ID"] in ["fedora", "centos", "rhel"]:
            pm_command = "rpm -qa"
        elif package_manager_info["ID"] == "arch":
            pm_command = "pacman -Q"
    
    if not pm_command:
        # Nếu không xác định được, thử các lệnh phổ biến
        # dpkg thường phổ biến nhất
        if RunCmd("which dpkg") is not None:
            pm_command = "dpkg -l"
        elif RunCmd("which rpm") is not None:
            pm_command = "rpm -qa"
        elif RunCmd("which pacman") is not None:
            pm_command = "pacman -Q"
        else:
            print("Không tìm thấy trình quản lý gói được hỗ trợ (dpkg, rpm, pacman).")
            return []

    print(f"Đang sử dụng lệnh '{pm_command}' để liệt kê gói...")
    output = RunCmd(pm_command, True)

    if not output:
        return []

    installed_packages = []
    lines = output.strip().split('\n')

    if "dpkg" in pm_command:
        for line in lines:
            line = line.strip()
            # Ví dụ dòng dpkg -l: ii  package-name  version  architecture  description
            if line.startswith('ii') or line.startswith('rc'): # 'ii' là installed, 'rc' là removed/config files
                parts = line.split()
                if len(parts) >= 3:
                    name = parts[1]
                    version = parts[2]
                    installed_packages.append({'Name': name, 'Version': version})
    elif "rpm" in pm_command:
        for line in lines:
            line = line.strip()
            # Ví dụ dòng rpm -qa: package-name-version-release.architecture
            if '-' in line: # Đảm bảo có ít nhất một dấu gạch ngang
                # Tách tên và phiên bản
                # rhel-lsb-core-5.0-70.el7.x86_64 -> name: rhel-lsb-core, version: 5.0-70.el7.x86_64
                match = re.match(r'^(.*?)-(\d.*)$', line)
                if match:
                    name = match.group(1)
                    version = match.group(2)
                    installed_packages.append({'Name': name, 'Version': version})
                else: # Fallback if regex fails for some names
                     parts = line.rsplit('-', 2) # split from right, max 2 times
                     if len(parts) == 3: # name-version-release.arch
                         name = parts[0]
                         version = f"{parts[1]}-{parts[2]}"
                         installed_packages.append({'Name': name, 'Version': version})
                     elif len(parts) == 2: # name-version
                          name = parts[0]
                          version = parts[1]
                          installed_packages.append({'Name': name, 'Version': version})

    elif "pacman" in pm_command:
        for line in lines:
            line = line.strip()
            # Ví dụ dòng pacman -Q: package-name version
            parts = line.split(maxsplit=1) # Tách tên và phiên bản
            if len(parts) == 2:
                name = parts[0]
                version = parts[1]
                installed_packages.append({'Name': name, 'Version': version})
    
    return installed_packages


def PrintConnectionForLinux():
    
    print("=== Kiểm tra các cổng đang mở ===")
    ports_info = ListOfConnectionsForLinux()

    print("\n--- Các cổng đang mở trên IPv4 (LISTENING) ---")
    if ports_info["ipv4_ports"]:
        for port in ports_info["ipv4_ports"]:
            print(f"  Proto: {port['Proto']}, Local Address: {port['Local Address']}, State: {port['State']}")
    else:
        print("  Không tìm thấy cổng IPv4 nào đang mở.")

    print("\n--- Các cổng đang mở trên IPv6 (LISTENING) ---")
    if ports_info["ipv6_ports"]:
        for port in ports_info["ipv6_ports"]:
            print(f"  Proto: {port['Proto']}, Local Address: {port['Local Address']}, State: {port['State']}")
    else:
        print("  Không tìm thấy cổng IPv6 nào đang mở.")
        

def PrintInstalledAppsAndPackagesForLinux():     
    
    print("=== Liệt kê các gói đã cài đặt ===")
    packages = ListOfInstalledAppsAndPackagesForLinux()

    if packages:
        print("\n--- Danh sách các gói đã cài đặt ---")
        # In một vài gói đầu tiên để tránh in quá nhiều
        for i, pkg in enumerate(packages): # Chỉ in 20 gói đầu tiên
            print(f"  {i+1}. Tên: {pkg.get('Name', 'N/A')}, Phiên bản: {pkg.get('Version', 'N/A')}")
        
        print(f"\nTổng số gói tìm thấy: {len(packages)}")
    else:
        print("  Không tìm thấy gói nào hoặc không thể thực thi lệnh trình quản lý gói.")


def ListOfOpenPort(target='127.0.0.1', ports='1-1000'):
    scanner = nmap.PortScanner()
    scanner.scan(target, ports, arguments='-sS')
    results = []

    for proto in scanner[target].all_protocols():
        lport = scanner[target][proto].keys()
        for port in sorted(lport):
            state = scanner[target][proto][port]['state']
            results.append({"port": port, "state": state, "protocol": proto})

    return results


def ListOfServices(target='127.0.0.1', ports='1-1000'):
    scanner = nmap.PortScanner()
    scanner.scan(target, ports, arguments='-sV')
    services = []

    for proto in scanner[target].all_protocols():
        lport = scanner[target][proto].keys()
        for port in sorted(lport):
            service = scanner[target][proto][port].get('name', 'unknown')
            product = scanner[target][proto][port].get('product', '')
            version = scanner[target][proto][port].get('version', '')
            services.append({
                "port": port,
                "service": service,
                "product": product,
                "version": version,
                "protocol": proto
            })

    return services


def ListOfSSLCertificate(target='127.0.0.1'):
    try:
        cmd = ['nmap', '-p', '443', '--script', 'ssl-cert', target]
        output = subprocess.check_output(cmd, universal_newlines=True)
        print(output)
        return output
    except subprocess.CalledProcessError as e:
        return str(e)


def ScanAndSaveReport():
    target = '127.0.0.1'
    print("\n Đang thực hiện quét PORT...")
    ports = ListOfOpenPort(target)
    
    print("\n Đang thực hiện phát hiện dịch vụ...")
    services = ListOfServices(target)

    print("\n Đang thực hiện SSL Scan (nếu có)...")
    ssl_info = ListOfSSLCertificate(target)

    data = {
        "target": target,
        "port_scan": ports,
        "services": services,
        "ssl_scan": ssl_info
    }

    now = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    report_dir = 'reports/connection'
    os.makedirs(report_dir, exist_ok=True)
    path = os.path.join(report_dir, f'{now}.json')
    with open(path, 'w') as f:
        json.dump(data, f, indent=4)
    print(f"\n Báo cáo đã lưu tại: {path}")
      
if __name__ == "__main__":
    
    operatingSystem = sys.platform
    option = "Enter:\n- 'c' for viewing connections\n" + "- 'a' for viewing installed applications"
    if operatingSystem == "win32":
        print("OS: Windows")
        print(option)
        
        c = input()
        if c == 'c':
            PrintConnectionForWin()
        elif c == 'a':
            PrintInstalledAppsForWin()
        elif c == 'ga':
            GetListOfInstalledAppsForWin()
            
        else:
            print("Không hợp lệ")
    elif operatingSystem == "linux" or operatingSystem == "linux2":
        print("OS: Linux")
        print(option)
        
        c = input()
        if c == 'p':
            PrintConnectionForLinux()
        elif c == 'a':
            PrintInstalledAppsAndPackagesForLinux()
        else:
            print("Không hợp lệ")
    elif operatingSystem == "darwin":
        print("macOS")
 