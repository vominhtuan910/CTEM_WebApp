import { scanPorts } from "./scanPorts.js";
import { scanHostname_IPs } from "./hostnameAndIP.js";
import { scanSocket } from "./scanSocket.js";
import {
  isWindows,
  runPowerShellScan,
  getPowerShellResults,
} from "./powershellScan.js";
import {
  checkLynisInstalled,
  runLynisScan,
  getLynisResults,
} from "./lynisScan.js";
import { scanResultsToAsset } from "./utils/formatters.js";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, "../output");

// Ensure output directory exists
fs.ensureDirSync(OUTPUT_DIR);

/**
 * Get the operating system type
 * @returns {string} OS type ('windows', 'linux', 'macos', or 'unknown')
 */
export function getOsType() {
  const platform = process.platform;

  if (platform === "win32") {
    return "windows";
  } else if (platform === "linux") {
    return "linux";
  } else if (platform === "darwin") {
    return "macos";
  } else {
    return "unknown";
  }
}

/**
 * Run a unified scan that works on both Windows and Linux/macOS
 * @param {string} targetIP - IP address to scan
 * @returns {Promise<object>} Scan results
 */
export async function runUnifiedScan(targetIP = "127.0.0.1") {
  try {
    console.log(`Starting unified scan for ${targetIP}...`);

    // Step 1: Run basic scans (works on all platforms)
    console.log("Running basic scans...");
    const [portData, socketData, systemInfo] = await Promise.all([
      scanPorts(targetIP),
      scanSocket(),
      scanHostname_IPs(),
    ]);

    // Step 2: Run platform-specific detailed scan
    console.log("Running platform-specific scan...");
    let detailedScan = null;
    const osType = getOsType();

    if (osType === "windows") {
      console.log("Detected Windows OS, running PowerShell scan...");
      try {
        detailedScan = await runPowerShellScan();
      } catch (error) {
        console.error("PowerShell scan failed:", error.message);
        // Try to get the latest PowerShell scan results
        detailedScan = await getPowerShellResults();
      }
    } else if (osType === "linux" || osType === "macos") {
      console.log(
        `Detected ${
          osType === "linux" ? "Linux" : "macOS"
        }, checking for Lynis...`
      );
      const lynisInstalled = await checkLynisInstalled();

      if (lynisInstalled) {
        try {
          console.log("Running Lynis scan...");
          detailedScan = await runLynisScan();
        } catch (error) {
          console.error("Lynis scan failed:", error.message);
          // Try to get the latest Lynis scan results
          detailedScan = await getLynisResults();
        }
      } else {
        console.log("Lynis not installed, skipping detailed scan");
      }
    } else {
      console.log(`Unsupported OS type: ${osType}, skipping detailed scan`);
    }

    // Step 3: Combine all scan results into an Asset object
    console.log("Formatting scan results...");
    const assetData = scanResultsToAsset(systemInfo, portData, detailedScan);

    // Save the combined scan results
    const scanResultsPath = path.join(OUTPUT_DIR, "unified_scan_results.json");
    await fs.writeJson(
      scanResultsPath,
      {
        timestamp: new Date().toISOString(),
        target: targetIP,
        asset: assetData,
        raw: {
          portData,
          systemInfo,
          detailedScan,
        },
      },
      { spaces: 2 }
    );

    console.log("Unified scan completed successfully");
    return assetData;
  } catch (error) {
    console.error("Unified scan failed:", error);
    throw error;
  }
}

/**
 * Get the latest unified scan results
 * @returns {Promise<object>} Latest scan results
 */
export async function getLatestScanResults() {
  try {
    const scanResultsPath = path.join(OUTPUT_DIR, "unified_scan_results.json");

    if (await fs.pathExists(scanResultsPath)) {
      return await fs.readJson(scanResultsPath);
    }

    return null;
  } catch (error) {
    console.error("Error reading latest scan results:", error);
    return null;
  }
}

export default {
  getOsType,
  runUnifiedScan,
  getLatestScanResults,
};
