import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output file path
const outputPath = path.join(__dirname, "..", "output", "sockets_output.json");

/**
 * Function to scan sockets
 * @param {string} target - Target IP to scan (default: 127.0.0.1)
 * @returns {Promise<object>} Socket scan results
 */
async function scanSocket(target = "127.0.0.1") {
  return new Promise((resolve, reject) => {
    console.log(`Scanning sockets on ${target}`);

    // Use ss command to list socket connections
    // In Windows, we can use netstat instead
    const command = process.platform === "win32" ? "netstat -ano" : "ss -tuln";

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error scanning sockets: ${error.message}`);
        reject(error);
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }

      // Parse the output based on the platform
      const socketConnections =
        process.platform === "win32"
          ? parseWindowsNetstat(stdout)
          : parseLinuxSS(stdout);

      // Save the results
      const results = {
        target,
        timestamp: new Date(),
        connections: socketConnections,
        raw: stdout,
      };

      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

      resolve(results);
    });
  });
}

/**
 * Parse netstat output on Windows
 * @param {string} output - Netstat command output
 * @returns {Array} Parsed connections
 */
function parseWindowsNetstat(output) {
  const connections = [];
  const lines = output.split("\n");

  // Skip header lines (first 4 lines typically)
  for (let i = 4; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(/\s+/);
    if (parts.length >= 5) {
      connections.push({
        protocol: parts[0],
        localAddress: parts[1],
        foreignAddress: parts[2],
        state: parts[3],
        pid: parts[4],
      });
    }
  }

  return connections;
}

/**
 * Parse ss output on Linux
 * @param {string} output - SS command output
 * @returns {Array} Parsed connections
 */
function parseLinuxSS(output) {
  const connections = [];
  const lines = output.split("\n");

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(/\s+/);
    if (parts.length >= 5) {
      connections.push({
        state: parts[0],
        recv: parts[1],
        send: parts[2],
        localAddress: parts[3],
        peerAddress: parts[4],
      });
    }
  }

  return connections;
}

export { scanSocket };
