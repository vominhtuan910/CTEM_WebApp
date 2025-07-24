import { exec } from "child_process";
import * as fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import util from "util";

const execPromise = util.promisify(exec);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output path
const outputPath = path.join(__dirname, "..", "output", "nmap_output.json");

/**
 * Run nmap scan on target with specified options
 * @param {string} target - Target IP or hostname
 * @param {string} options - Additional nmap options
 * @returns {Promise<string>} Raw nmap output
 */
async function runNmap(target = "127.0.0.1", options = "-sV -O") {
  try {
    console.log(`Running nmap scan on ${target} with options: ${options}`);
    const { stdout, stderr } = await execPromise(`nmap ${options} ${target}`);

    if (stderr) {
      console.warn("Nmap warnings:", stderr);
    }

    return stdout;
  } catch (error) {
    console.error("Error running nmap:", error.message);
    throw error;
  }
}

/**
 * Parse nmap output into structured format
 * @param {string} output - Raw nmap output
 * @returns {object} Parsed nmap results
 */
function parseNmapOutput(output) {
  const result = {
    target: null,
    scanTime: null,
    hostStatus: null,
    ports: [],
    osInfo: {
      detected: false,
      name: null,
      accuracy: null,
    },
  };

  const lines = output.split("\n");
  let currentSection = null;

  // Extract target from scan report
  const scanReportMatch = output.match(
    /Nmap scan report for (.+?)(?:\s+\((.+?)\))?$/m
  );
  if (scanReportMatch) {
    result.target = scanReportMatch[2] || scanReportMatch[1];
  }

  // Extract scan time
  const timeMatch = output.match(/Nmap done at (.+)/);
  if (timeMatch) {
    result.scanTime = timeMatch[1];
  }

  // Extract host status
  const hostMatch = output.match(/Host is (.+)/);
  if (hostMatch) {
    result.hostStatus = hostMatch[1];
  }

  // Process line by line
  for (const line of lines) {
    // Port information
    const portMatch = line.match(/^(\d+)\/(\w+)\s+(\w+)\s+(.+)$/);
    if (portMatch) {
      result.ports.push({
        port: parseInt(portMatch[1]),
        protocol: portMatch[2],
        state: portMatch[3],
        service: portMatch[4].trim(),
      });
    }

    // OS detection section
    if (line.includes("OS detection")) {
      currentSection = "os";
    }

    // OS details
    if (currentSection === "os" && line.match(/OS:\s*(.*)/)) {
      const osMatch = line.match(/OS:\s*([^(]+)(?:\s+\((\d+)%\))?/);
      if (osMatch) {
        result.osInfo.detected = true;
        result.osInfo.name = osMatch[1].trim();
        result.osInfo.accuracy = osMatch[2] ? parseInt(osMatch[2]) : null;
      }
    }
  }

  return result;
}

/**
 * Run nmap scan and save results
 * @param {string} target - Target IP or hostname
 * @param {string} options - Additional nmap options
 * @returns {Promise<object>} Parsed nmap results
 */
async function scanWithNmap(target = "127.0.0.1", options = "-sV -O") {
  try {
    const output = await runNmap(target, options);
    const parsed = parseNmapOutput(output);

    // Add timestamp and raw output
    parsed.timestamp = new Date().toISOString();
    parsed.raw = output;

    // Save results
    await fs.writeFile(outputPath, JSON.stringify(parsed, null, 2));
    console.log(`✅ Nmap scan results saved to ${outputPath}`);

    return parsed;
  } catch (err) {
    console.error("❌ Error running nmap scan:", err);
    throw err;
  }
}

/**
 * Get the latest nmap scan results
 * @returns {Promise<object|null>} Latest scan results or null if not available
 */
async function getLatestNmapResults() {
  try {
    const data = await fs.readFile(outputPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading nmap results:", error.message);
    return null;
  }
}

export { runNmap, parseNmapOutput, scanWithNmap, getLatestNmapResults };
