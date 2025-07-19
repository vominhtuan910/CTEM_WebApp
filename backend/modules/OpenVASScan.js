import { spawn } from 'child_process';

const PYTHON_CLI = "backend/modules/OpenVASScan.py";

export function create_task(name, port_list) {
    const python = spawn('python', [PYTHON_CLI , "create_task", name, port_list]);
    
    python.stdout.on('data', (data) => {
        console.log(`Kết quả từ Python: ${data}`);
      });
      
      python.stderr.on('data', (data) => {
        console.error(`Lỗi từ Python: ${data}`);
      });
      
      python.on('close', (code) => {
        console.log(`Python process kết thúc với mã ${code}`);
      });
}

export function get_task_IDs() {
    
    const python = spawn('python', [PYTHON_CLI , "get_task_IDs"]);
    
    python.stdout.on('data', (data) => {
        console.log(`Kết quả từ Python: ${data}`);
      });
      
      python.stderr.on('data', (data) => {
        console.error(`Lỗi từ Python: ${data}`);
      });
      
      python.on('close', (code) => {
        console.log(`Python process kết thúc với mã ${code}`);
      });
}

export function get_report(task_id) {
    const python = spawn('python', [PYTHON_CLI , "get_report", task_id]);
    
    python.stdout.on('data', (data) => {
        console.log(`Kết quả từ Python: ${data}`);
      });
      
      python.stderr.on('data', (data) => {
        console.error(`Lỗi từ Python: ${data}`);
      });
      
      python.on('close', (code) => {
        console.log(`Python process kết thúc với mã ${code}`);
      });
}

create_task("ckk", "80, 330");
