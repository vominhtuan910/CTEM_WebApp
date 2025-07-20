import { exec } from 'child_process';
import fs from 'fs';
const outputFilePath = 'backend/output/sockets_output.json';

export function scanSocket(){
  exec('ss -tuln', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }

    const lines = stdout.trim().split('\n').slice(1); 
    const result = [];

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const [netid, state, localAddr, peerAddr, process] = parts;
        const [localPort] = localAddr.split(':').slice(-1);
        const [peerPort] = peerAddr.split(':').slice(-1);

        result.push({
          protocol: netid,
          state: state,
          local_address: localAddr,
          local_port: localPort || 'N/A',
          peer_address: peerAddr,
          peer_port: peerPort || 'N/A',
          process: process || 'N/A'
        });
      }
    }

    
    fs.writeFile(outputFilePath, JSON.stringify(result, null, 2), (err) => {
      if (err) throw err;
    });
  });
}

import { scanPorts } from './scanPorts.js';
scanPorts()
scanSocket()
