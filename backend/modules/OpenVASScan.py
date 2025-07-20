from gvm.connections import UnixSocketConnection
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform
import time
import json
import sys
from lxml import etree

#Thông tin cấu hình
USERNAME = "admin"
PASSWORD = "123456"  # thay bằng password admin của bạn
SOCKET_PATH = '/run/gvmd/gvmd.sock'
TARGET_HOST = "127.0.0.1"
target_port = "8080"
scan_name = "DVWA Scan"
# ID của cấu hình scan "Full and fast"
FULL_AND_FAST = "daba56c8-73ec-11df-a475-002264764cea"
#Danh sách cổng mặc định (nếu muốn tùy biến, có thể tạo riêng)
DEFAULT_PORT_LIST = "33d0cd82-57c6-11e1-8ed1-406186ea4fc5"  # All IANA TCP


    
def get_task_ids(gmp):
    #Lấy danh sách task 
    try:
        tasks = gmp.get_tasks()
        task_list = []
        for task in tasks.xpath('task'):
            name = task.find('name').text
            task_id = task.get('id')
            print(f"Task Name: {name}")
            print(f"ID: {task_id}")
            task_list.append((name, task_id))
        print("Get task IDs successfully!")
        return task_list
    except Exception as e:
        print(f"Can't get task IDs: {e}")


def create_port_list(gmp, input_port_range):
    #Tạo danh sách port 8080
    try:
        port_list = gmp.create_port_list(
            name="Scan " + input_port_range,
            comment="Scan port " + input_port_range,
            port_range= input_port_range
        )
        port_list_id = port_list.get("id")
        print(f"Create a new port list successfully: {port_list_id}")
        return port_list_id    
    except Exception as e:
        print(f"Can't create a new port list: {e}")

    
def create_target(gmp, input_name, target_ip, port_list_id):
    #Tạo target mới
    try:
        target = gmp.create_target(
            name=input_name,
            hosts=[target_ip],
            port_list_id=port_list_id
            )
        target_id = target.get("id")
        print(f"Create a new target successfully!: {target_id}")
        return target_id
    except Exception as e:
        print(f"Can't create a new target: {e}")
        
def create_task(gmp, name, config_id, target_id):
    #Tạo task quét
    try:
    #Lấy scanner ID của OpenVAS
        scanner_id = ""
        try:
            scanners = gmp.get_scanners()
            for scanner in scanners.xpath("scanner"):
                name = scanner.findtext("name")
                if "OpenVAS" in name:
                    scanner_id = scanner.get("id")
                    print(f"Scanner ID: {scanner_id}")
                    return scanner_id
            raise Exception("Can't find scanner OpenVAS")
        except Exception as e:
            print(f"Can't find scanner OpenVAS: {e}")
    
        task = gmp.create_task(
            name=name,
            config_id=config_id,
            target_id=target_id,
            scanner_id=scanner_id
        )
        task_id = task.get("id")
        print(f"Run task {task_id} successfully!")
        return task_id
    except Exception as e:
        print(f"Can't run task: {e}")


def get_report_and_summary(gmp, task_id, output_file):
    #Lấy report mới nhất của một task và in ra tóm tắt số lượng lỗ hổng theo mức độ.
    try:
        task = gmp.get_task(task_id=task_id)
        report_id = task.find('.//report').get('id')    
        # Lấy report chi tiết ở định dạng mặc định XML
        report_xml = gmp.get_report(report_id=report_id, details=True)
        results = []
        for result in report_xml.xpath('.//result'):
            name = result.findtext('name') or ""
            host = result.findtext('host') or ""
            port = result.findtext('port') or ""
            severity = result.findtext('severity') or ""
            threat = result.findtext('threat') or ""
            nvt = result.find('nvt')
            cve = nvt.findtext('cve') if nvt is not None else None
            summary = nvt.findtext('summary') if nvt is not None else None
            oid = nvt.get('oid') if nvt is not None else None


            results.append({
                'name': name,
                'host': host,
                'port': port,
                'severity': severity,
                'threat': threat,
                'cve': cve,
                'summary': summary,
                'oid': oid
            })

        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=4, ensure_ascii=False)

        print(f"Report saved at: {output_file}")
        # Phân tích phần summary
        report_element = report_xml.find('.//report')
        if report_element is None:
            print("Can't find report.")
            return
        
        results = report_element.find('results')
        if results is not None:
            print(f"Vulnerability count: {len(results)}")
        else:
            print("No scan results were recorded..")

        # Phân tích phần severity (nếu có)
        print("\nSummary:")
        severities = {'High': 0, 'Medium': 0, 'Low': 0, 'Log': 0, 'None': 0}

        for result in report_element.findall('.//result'):
            severity = result.findtext('threat')
            if severity in severities:
                severities[severity] += 1
            else:
                severities['None'] += 1

        for level, count in severities.items():
            print(f"  - {level}: {count}")

        return report_element 
    except Exception as e:
        print(f"Can't run task: {e}")


if __name__ == "__main__":
    
    print(sys.argv[1])
    try:
        connection = UnixSocketConnection(path='/run/gvmd/gvmd.sock')
        transform = EtreeCheckCommandTransform()
        with Gmp(connection=connection, transform=transform) as gmp:
            gmp.authenticate(USERNAME, PASSWORD)
            print("Connect to GVM successfully!")
            print(sys.argv[1])
            if sys.argv[1] == 'create_task':
                task_name = sys.argv[2]
                input_port_range = sys.argv[3]
                print(f'Name: {task_name}\nPort range: {input_port_range}')
                port_list_id = create_port_list(gmp, input_port_range)
                target_id = create_target(gmp, task_name, TARGET_HOST, port_list_id)
                create_task(gmp, task_name,FULL_AND_FAST, target_id )
            elif sys.argv[1] == 'get_task_IDs':
                print(sys.argv[1])
                get_task_ids(gmp) 
            elif sys.argv[1] == 'get_report':
                id = sys.argv[2]
                get_report_and_summary(gmp, id, "out.json")
    except Exception as e:
        print(f"Can't connect to GVM: {e}")

