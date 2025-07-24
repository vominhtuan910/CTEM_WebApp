import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import scan modules
import { checkWSL } from "./wslTools.js";
import { checkNmapInstalled, scanPorts } from "./nmapScan.js";
import { checkLynisInstalled, runLynisScan } from "./lynisScan.js";
import { isWindows, runPowerShellScan } from "./windowsScan.js";
import { scanHostname_IPs } from "./systemInfo.js";

/**
 * Get available scanning tools
 * @returns {Promise<Object>} Status of available tools
 */
async function getScanToolsStatus() {
  try {
    // Check if WSL is available (for Windows systems)
    const wslAvailable = await checkWSL();

    // Get system platform
    const platform = process.platform;

    // Check if necessary scan tools are installed
    const nmapInstalled = await checkNmapInstalled();

    // Check if Lynis is available
    let lynisStatus = "not_applicable";
    if (platform !== "win32" || wslAvailable) {
      const lynisInstalled = await checkLynisInstalled();
      lynisStatus = lynisInstalled ? "installed" : "not_installed";
    }

    // PowerShell is always available on Windows
    const powershellStatus = isWindows() ? "available" : "not_applicable";

    return {
      platform,
      tools: {
        nmap: nmapInstalled ? "installed" : "not_installed",
        lynis: lynisStatus,
        powershell: powershellStatus,
        wsl: wslAvailable ? "available" : "not_available",
      },
    };
  } catch (error) {
    console.error("Error checking scan tools status:", error);
    throw error;
  }
}

/**
 * Run a comprehensive scan on the specified target
 * @param {Object} options - Scan options
 * @param {string} options.target - Target to scan (default: 'localhost')
 * @param {boolean} options.runNmap - Whether to run Nmap scan
 * @param {boolean} options.runLynis - Whether to run Lynis scan
 * @param {boolean} options.runPowerShell - Whether to run PowerShell scan
 * @param {string} options.outputDir - Directory to save scan outputs
 * @returns {Promise<Object>} Scan results with file paths
 */
async function runScan(options) {
  const {
    target = "localhost",
    runNmap = true,
    runLynis = true,
    runPowerShell = isWindows(),
    outputDir,
  } = options;

  // Make sure output directory exists
  if (outputDir) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate timestamp for this scan
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  // Object to store scan results and output paths
  const results = {
    timestamp,
    target,
    outputFiles: {},
    scanStatus: {},
  };

  try {
    // Run system info scan (always runs)
    console.log(`Starting system information scan for ${target}`);
    const systemInfoResult = await scanHostname_IPs(target);

    results.systemInfo = systemInfoResult;
    results.scanStatus.systemInfo = "completed";

    if (outputDir) {
      const systemInfoPath = path.join(
        outputDir,
        `system_info_${timestamp}.json`
      );
      fs.writeFileSync(
        systemInfoPath,
        JSON.stringify(systemInfoResult, null, 2)
      );
      results.outputFiles.systemInfo = systemInfoPath;
    }

    // Run scans in parallel
    const scanPromises = [];

    // Nmap scan
    if (runNmap) {
      const nmapPromise = scanPorts(target)
        .then((nmapResult) => {
          results.nmapScan = nmapResult;
          results.scanStatus.nmap = "completed";

          if (outputDir) {
            const nmapPath = path.join(
              outputDir,
              `nmap_scan_${timestamp}.json`
            );
            fs.writeFileSync(nmapPath, JSON.stringify(nmapResult, null, 2));
            results.outputFiles.nmap = nmapPath;
          }
        })
        .catch((error) => {
          console.error("Nmap scan error:", error);
          results.scanStatus.nmap = "failed";
          results.errors = results.errors || {};
          results.errors.nmap = error.message;
        });

      scanPromises.push(nmapPromise);
    }

    // Lynis scan (Linux/macOS or Windows with WSL)
    if (runLynis && (process.platform !== "win32" || (await checkWSL()))) {
      const lynisPromise = runLynisScan()
        .then((lynisResult) => {
          results.lynisScan = lynisResult;
          results.scanStatus.lynis = "completed";

          if (outputDir) {
            const lynisPath = path.join(
              outputDir,
              `lynis_scan_${timestamp}.json`
            );
            fs.writeFileSync(lynisPath, JSON.stringify(lynisResult, null, 2));
            results.outputFiles.lynis = lynisPath;
          }
        })
        .catch((error) => {
          console.error("Lynis scan error:", error);
          results.scanStatus.lynis = "failed";
          results.errors = results.errors || {};
          results.errors.lynis = error.message;
        });

      scanPromises.push(lynisPromise);
    }

    // PowerShell scan (Windows only)
    if (runPowerShell && isWindows()) {
      const powerShellPromise = runPowerShellScan()
        .then((powerShellResult) => {
          results.powerShellScan = powerShellResult;
          results.scanStatus.powerShell = "completed";

          if (outputDir) {
            const powerShellPath = path.join(
              outputDir,
              `powershell_scan_${timestamp}.json`
            );
            fs.writeFileSync(
              powerShellPath,
              JSON.stringify(powerShellResult, null, 2)
            );
            results.outputFiles.powerShell = powerShellPath;
          }
        })
        .catch((error) => {
          console.error("PowerShell scan error:", error);
          results.scanStatus.powerShell = "failed";
          results.errors = results.errors || {};
          results.errors.powerShell = error.message;
        });

      scanPromises.push(powerShellPromise);
    }

    // Wait for all scans to complete
    await Promise.all(scanPromises);

    // Create a unified results file if output directory is provided
    if (outputDir) {
      const unifiedPath = path.join(
        outputDir,
        `unified_scan_${timestamp}.json`
      );
      fs.writeFileSync(unifiedPath, JSON.stringify(results, null, 2));
      results.outputFiles.unified = unifiedPath;
    }

    return results;
  } catch (error) {
    console.error("Error during scan:", error);
    throw error;
  }
}

/**
 * Get recent scan history
 * @param {string} outputDir - Directory containing scan outputs
 * @param {number} limit - Maximum number of scan results to return
 * @returns {Promise<Array>} Array of scan metadata
 */
async function getScanHistory(outputDir, limit = 10) {
  try {
    const files = fs
      .readdirSync(outputDir)
      .filter(
        (file) => file.startsWith("unified_scan_") && file.endsWith(".json")
      )
      .sort((a, b) => {
        // Sort by creation time, newest first
        return (
          fs.statSync(path.join(outputDir, b)).mtime.getTime() -
          fs.statSync(path.join(outputDir, a)).mtime.getTime()
        );
      })
      .slice(0, limit);

    const scanHistory = files.map((file) => {
      const filePath = path.join(outputDir, file);
      try {
        const scanData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return {
          timestamp: scanData.timestamp,
          target: scanData.target,
          scanStatus: scanData.scanStatus,
          outputFile: filePath,
        };
      } catch (error) {
        console.error(`Error reading scan file ${filePath}:`, error);
        return {
          timestamp: file.replace("unified_scan_", "").replace(".json", ""),
          error: "Could not read scan file",
          outputFile: filePath,
        };
      }
    });

    return scanHistory;
  } catch (error) {
    console.error("Error retrieving scan history:", error);
    throw error;
  }
}

/**
 * Get scan results by ID (timestamp)
 * @param {string} scanId - Scan ID (timestamp)
 * @param {string} outputDir - Directory containing scan outputs
 * @returns {Promise<Object>} Scan results
 */
async function getScanById(scanId, outputDir) {
  try {
    const filePath = path.join(outputDir, `unified_scan_${scanId}.json`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Scan with ID ${scanId} not found`);
    }

    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Error retrieving scan ${scanId}:`, error);
    throw error;
  }
}

export { getScanToolsStatus, runScan, getScanHistory, getScanById };
