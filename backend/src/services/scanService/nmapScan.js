import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import util from "util";

const execPromise = util.promisify(exec);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Check if nmap is installed
 * @returns {Promise<boolean>} True if nmap is installed
 */
async function checkNmapInstalled() {
  try {
    const nmapCommand =
      process.platform === "win32" ? "where nmap" : "which nmap";
    const { stdout } = await execPromise(nmapCommand);
    return Boolean(stdout.trim());
  } catch (error) {
    console.log("Nmap is not installed");
    return false;
  }
}

/**
 * Run nmap scan with WSL if on Windows and available
 * @param {string} target - The target to scan
 * @returns {Promise<string>} The raw nmap output
 */
async function runNmapWithWSL(target) {
  // Check if WSL is available
  try {
    await execPromise("wsl --status");

    // Check if nmap is installed in WSL
    const { stdout: nmapCheck } = await execPromise(
      'wsl which nmap || echo "not installed"'
    );
    if (nmapCheck.trim() === "not installed") {
      console.log(
        "Nmap not installed in WSL. Falling back to Windows nmap if available."
      );
      throw new Error("Nmap not in WSL");
    }

    // Run nmap in WSL
    console.log("Running nmap in WSL...");
    const { stdout } = await execPromise(
      `wsl sudo nmap -sS -sV -O -T4 ${target}`
    );
    return stdout;
  } catch (error) {
    console.log("Cannot use nmap in WSL:", error.message);
    throw error;
  }
}

/**
 * Function to scan ports with enhanced nmap options
 * @param {string} target - The target to scan (default: 127.0.0.1)
 * @param {string} options - Additional nmap options
 * @returns {Promise<object>} Scan results
 */
async function scanPorts(target = "127.0.0.1", options = "") {
  console.log(`Scanning ports on ${target}`);
  let stdout = "";
  let error = null;

  try {
    // Check if nmap is installed
    const nmapInstalled = await checkNmapInstalled();

    if (!nmapInstalled) {
      if (process.platform === "win32") {
        // Try WSL on Windows
        try {
          stdout = await runNmapWithWSL(target);
        } catch (wslError) {
          throw new Error("Nmap not available in Windows or WSL");
        }
      } else {
        throw new Error(
          "Nmap not installed. Please install nmap for port scanning."
        );
      }
    } else {
      // Run nmap with enhanced options
      // -sS: SYN scan (faster)
      // -sV: Version detection
      // -O: OS detection
      // -T4: Speed template (faster)
      try {
        const nmapOptions = options || "-sS -sV -O -T4";
        const { stdout: nmapOutput } = await execPromise(
          `nmap ${nmapOptions} ${target}`
        );
        stdout = nmapOutput;
      } catch (nmapError) {
        // If advanced options fail, try a basic scan
        console.log("Advanced nmap scan failed, trying basic scan...");
        const { stdout: basicOutput } = await execPromise(`nmap ${target}`);
        stdout = basicOutput;
      }
    }
  } catch (mainError) {
    console.error(`Error scanning ports: ${mainError.message}`);
    error = mainError;
    // Create dummy result with error info
    return {
      target,
      timestamp: new Date(),
      openPorts: [],
      error: mainError.message,
    };
  }

  // Parse the output
  return {
    target,
    timestamp: new Date(),
    openPorts: parseNmapOutput(stdout),
    osInfo: parseOsInfo(stdout),
    raw: stdout,
  };
}

/**
 * Parse nmap output to extract open ports with enhanced details
 * @param {string} output - Nmap output
 * @returns {Array} Array of open ports with details
 */
function parseNmapOutput(output) {
  const openPorts = [];
  const lines = output.split("\n");
  let currentPort = null;

  for (const line of lines) {
    // Look for port lines
    const portMatch = line.match(/^(\d+)\/(\w+)\s+(\w+)\s+(.+)$/);
    if (portMatch) {
      currentPort = {
        port: parseInt(portMatch[1]),
        protocol: portMatch[2],
        state: portMatch[3],
        service: portMatch[4].trim(),
        details: [],
      };
      openPorts.push(currentPort);
    }
    // Additional details for the current port
    else if (currentPort && line.trim().startsWith("|")) {
      const detailMatch = line.match(/\|\s*(.+?)\s*:?\s*(.*)/);
      if (detailMatch) {
        currentPort.details.push({
          key: detailMatch[1].trim(),
          value: detailMatch[2].trim(),
        });
      }
    }
  }

  return openPorts.filter((port) => port.state === "open");
}

/**
 * Parse OS detection information from nmap output
 * @param {string} output - Nmap output
 * @returns {object} OS information
 */
function parseOsInfo(output) {
  const osInfo = {
    detected: false,
    name: null,
    accuracy: null,
    type: null,
    details: [],
  };

  const lines = output.split("\n");
  let capturingOsDetails = false;

  for (const line of lines) {
    // Look for OS detection line
    if (line.includes("OS detection")) {
      capturingOsDetails = true;
    }

    if (capturingOsDetails) {
      // OS details
      const osMatch = line.match(/OS:\s*([^(]+)\s*(?:\((\d+)%\))?/);
      if (osMatch) {
        osInfo.detected = true;
        osInfo.name = osMatch[1].trim();
        osInfo.accuracy = osMatch[2] ? parseInt(osMatch[2]) : null;
      }

      // OS Class
      const osClassMatch = line.match(/OS CPE:\s*(.+)/);
      if (osClassMatch) {
        osInfo.type = osClassMatch[1].trim();
      }

      // Other OS details
      if (line.trim() !== "" && !line.includes("OS detection")) {
        osInfo.details.push(line.trim());
      }

      // End of OS section
      if (line.trim() === "" && osInfo.detected) {
        capturingOsDetails = false;
      }
    }
  }

  return osInfo;
}

export { checkNmapInstalled, scanPorts, runNmapWithWSL };
