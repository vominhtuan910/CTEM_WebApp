from gvm.connections import UnixSocketConnection
from gvm.protocols.gmp import Gmp
 
target_ip = "192.168.1.100"
 
with UnixSocketConnection(path="/var/run/gvmd.sock") as connection:
    with Gmp(connection) as gmp:
        gmp.authenticate('admin', 'your-password')
 
        # Create target
        target_response = gmp.create_target(
            name='Single IP Target',
            hosts=[target_ip]
        )
        target_id = target_response.get('id')
 
        # Create task
        config_id = 'daba56c8-73ec-11df-a475-002264764cea'  # Full and fast
        task_response = gmp.create_task(
            name='Single IP Scan',
            config_id=config_id,
            target_id=target_id
        )
        task_id = task_response.get('id')
 
        # Start the scan
        gmp.start_task(task_id)
        print(f"[+] Started scan on {target_ip} (task ID: {task_id})")