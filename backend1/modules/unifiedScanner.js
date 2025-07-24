import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import util from "util";

const execPromise = util.promisify(exec);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
import { scanPorts } from "./scanPorts.js";
import { scanSocket } from "./scanSocket.js";
import { scanHostname_IPs } from "./hostnameAndIP.js";
import { scanResultsToAsset } from "./utils/formatters.js";

// Output file path
const outputFilePath = path.join(
  __dirname,
  "..",
  "output",
  "unified_scan_results.json"
);

/**
 * Check if WSL is available for use
 * @returns {Promise<boolean>} True if WSL is available
 */
async function checkWSL() {
  if (!isWindows()) {
    return false; // WSL is only relevant on Windows
  }

  try {
    const { stdout } = await execPromise("wsl --status");
    return true;
  } catch (error) {
    console.log("WSL is not available:", error.message);
    return false;
  }
}

/**
 * Run Lynis scan using WSL if on Windows
 * @returns {Promise<object|null>} Scan results or null if unavailable
 */
async function runLynisScanWithWSL() {
  if (isWindows()) {
    const wslAvailable = await checkWSL();
    if (wslAvailable) {
      console.log("Running Lynis scan using WSL...");
      try {
        // Check if Lynis is installed in WSL
        const { stdout: lynisCheck } = await execPromise(
          "wsl which lynis || echo 'not installed'"
        );

        if (lynisCheck.trim() === "not installed") {
          console.log(
            "Lynis not installed in WSL. Please install with: sudo apt-get install lynis"
          );
          return null;
        }

        // Run Lynis in WSL
        const { stdout } = await execPromise(
          "wsl sudo lynis audit system --no-colors"
        );
        const results = {
          timestamp: new Date(),
          securityWarnings: [],
          suggestions: [],
          hardening: { index: 0 },
          systemInfo: {},
        };

        // Parse results
        const lines = stdout.split("\n");
        for (const line of lines) {
          // Security warnings
          if (line.includes("Warning:")) {
            results.securityWarnings.push(
              line.replace(/^\s*\[\s*\!\s*\]\s*Warning:\s*/, "").trim()
            );
          }

          // Suggestions
          if (line.includes("Suggestion:")) {
            results.suggestions.push(
              line.replace(/^\s*\[\s*\-\s*\]\s*Suggestion:\s*/, "").trim()
            );
          }

          // Hardening index
          const hardeningMatch = line.match(/Hardening index\s*:\s*(\d+)/);
          if (hardeningMatch) {
            results.hardening.index = parseInt(hardeningMatch[1], 10);
          }
        }

        // Save results
        const outputPath = path.join(
          __dirname,
          "..",
          "output",
          "lynis_scan_results.json"
        );
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

        return results;
      } catch (error) {
        console.error("Error running Lynis in WSL:", error.message);
        return null;
      }
    } else {
      console.log("WSL not available for Lynis scan on Windows");
      return null;
    }
  } else {
    // On Linux/macOS, run Lynis directly
    const lynisInstalled = await checkLynisInstalled();
    if (lynisInstalled) {
      return runLynisScan();
    } else {
      console.log(
        "Lynis is not installed. Please install Lynis for better scan results."
      );
      return null;
    }
  }
}

/**
 * Run OS-specific detailed scan (PowerShell on Windows, Lynis on Linux/Mac)
 * @returns {Promise<object|null>} OS-specific scan results
 */
async function runDetailedScan() {
  if (isWindows()) {
    try {
      // Run PowerShell scan
      return await runPowerShellScan();
    } catch (error) {
      console.error("Error running PowerShell scan:", error.message);
      return null;
    }
  } else {
    // Try to run Lynis scan
    return await runLynisScanWithWSL();
  }
}

/**
 * Run a unified scan of the local system
 * @returns {Promise<object>} Unified scan results and formatted asset
 */
async function runUnifiedScan() {
  console.log(`Starting unified scan of local system`);

  try {
    // Run basic scans in parallel (always available on any platform)
    const [portsResult, socketsResult, systemInfoResult] = await Promise.all([
      scanPorts("127.0.0.1"),
      scanSocket("127.0.0.1"),
      scanHostname_IPs(),
    ]);

    // Run OS-specific detailed scan
    const detailedScan = await runDetailedScan();

    // Combine the results
    const unifiedResults = {
      timestamp: new Date(),
      ports: portsResult.openPorts || [],
      sockets: socketsResult.connections || [],
      systemInfo: systemInfoResult || {},
      detailedScan: detailedScan || {},
    };

    // Save the results to file
    fs.writeFileSync(outputFilePath, JSON.stringify(unifiedResults, null, 2));
    console.log(`Unified scan completed`);

    // Convert scan results to asset format
    const assetData = scanResultsToAsset(
      unifiedResults.systemInfo,
      portsResult,
      unifiedResults.detailedScan
    );

    return {
      scanResults: unifiedResults,
      asset: assetData,
    };
  } catch (error) {
    console.error(`Error during unified scan: ${error.message}`);
    throw error;
  }
}

/**
 * Get the latest scan results
 * @returns {Promise<object|null>} Latest scan results or null if not available
 */
async function getLatestScanResults() {
  try {
    if (fs.existsSync(outputFilePath)) {
      const rawData = fs.readFileSync(outputFilePath, "utf8");
      const scanResults = JSON.parse(rawData);

      // Get OS-specific detailed scan results if available
      let detailedScan = null;
      if (isWindows()) {
        detailedScan = await getPowerShellResults();
      } else {
        detailedScan = await getLynisResults();
      }

      if (detailedScan) {
        scanResults.detailedScan = detailedScan;
      }

      // Convert to asset format
      const portsResult = {
        target: "127.0.0.1",
        openPorts: scanResults.ports || [],
      };

      const assetData = scanResultsToAsset(
        scanResults.systemInfo,
        portsResult,
        scanResults.detailedScan
      );

      return {
        scanResults,
        asset: assetData,
      };
    } else {
      console.log(`No scan results found at ${outputFilePath}`);
      return null;
    }
  } catch (error) {
    console.error(`Error reading scan results: ${error.message}`);
    return null;
  }
}

export { runUnifiedScan, getLatestScanResults, runLynisScanWithWSL, checkWSL };
