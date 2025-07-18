import { exec } from 'child_process';
import { writeFile } from 'fs/promises';

function runNmap() {
  return new Promise((resolve, reject) => {
    exec('nmap -O 127.0.0.1', (error, stdout, stderr) => {
      if (error) return reject(error);
      resolve(stdout);
    });
  });
}

function parseNmapOutput(output) {
  const result = {};

  const lines = output.split('\n');

  // Ví dụ đơn giản - bạn có thể mở rộng theo định dạng thật
  for (const line of lines) {
    if (line.startsWith('Running:')) {
      result.running = line.replace('Running:', '').trim();
    } else if (line.startsWith('OS details:')) {
      result.os_details = line.replace('OS details:', '').trim();
    } else if (line.match(/^\d+\/tcp/)) {
      // Cổng đang mở
      result.ports ??= [];
      const [portInfo, state, service] = line.trim().split(/\s+/);
      result.ports.push({ port: portInfo, state, service });
    }
  }

  return result;
}

async function main() {
  try {
    const output = await runNmap();
    const parsed = parseNmapOutput(output);

    await writeFile('nmap_output.json', JSON.stringify(parsed, null, 2));
    console.log('✅ Đã lưu kết quả vào nmap_output.json');
  } catch (err) {
    console.error('❌ Lỗi:', err);
  }
}

main();
