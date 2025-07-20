import { exec } from "child_process";
import fs from "fs";
const outputFilePath = "backend/output/sockets_output.json";

export function scanSocket() {
  return new Promise((resolve, reject) => {
    exec("ss -tuln", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Error: ${stderr}`);
        reject(new Error(stderr));
        return;
      }

      const lines = stdout.trim().split("\n").slice(1);
      const result = [];

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const [netid, state, localAddr, peerAddr, process] = parts;
          const [localPort] = localAddr.split(":").slice(-1);
          const [peerPort] = peerAddr.split(":").slice(-1);

          result.push({
            protocol: netid,
            state: state,
            local_address: localAddr,
            local_port: localPort || "N/A",
            peer_address: peerAddr,
            peer_port: peerPort || "N/A",
            process: process || "N/A",
          });
        }
      }

      fs.writeFile(outputFilePath, JSON.stringify(result, null, 2), (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          timestamp: new Date(),
          sockets: result,
        });
      });
    });
  });
}

// Export but don't auto-run when imported
export default scanSocket;
