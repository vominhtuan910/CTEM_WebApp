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
 * Extract open ports and running services from Nmap scan
 * @param {Object} nmapResult - Nmap scan results
 * @returns {Object} Extracted ports and services
 */
function extractPortsAndServices(nmapResult) {
  if (!nmapResult || !nmapResult.ports) {
    return { openPorts: [], runningServices: [] };
  }

  const openPorts = [];
  const runningServices = [];

  nmapResult.ports.forEach((port) => {
    if (port.state === "open") {
      openPorts.push({
        port: port.port,
        protocol: port.protocol,
      });

      if (port.service) {
        runningServices.push({
          name: port.service.name,
          product: port.service.product || null,
          version: port.service.version || null,
          port: port.port,
          protocol: port.protocol,
        });
      }
    }
  });

  return { openPorts, runningServices };
}

/**
 * Extract package information from Lynis scan
 * @param {Object} lynisResult - Lynis scan results
 * @returns {Object} Package information
 */
function extractPackageInfo(lynisResult) {
  if (!lynisResult || !lynisResult.details) {
    return {
      packageCount: 0,
      outdatedPackages: [],
      securityUpdates: [],
    };
  }

  const packageCount =
    lynisResult.details.packageManager?.installedPackages || 0;
  const outdatedPackages = lynisResult.warnings.filter(
    (warning) =>
      warning.toLowerCase().includes("outdated") ||
      warning.toLowerCase().includes("upgrade")
  );

  const securityUpdates = lynisResult.suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes("security update") ||
      suggestion.toLowerCase().includes("patch")
  );

  return {
    packageCount,
    outdatedPackages,
    securityUpdates,
  };
}

/**
 * Extract Lynis security findings
 * @param {Object} lynisResult - Lynis scan results
 * @returns {Object} Security findings
 */
function extractLynisSecurity(lynisResult) {
  if (!lynisResult) {
    return {
      hardeningIndex: 0,
      warningCount: 0,
      suggestionsCount: 0,
      criticalFindings: [],
      topSuggestions: [],
    };
  }

  return {
    hardeningIndex: lynisResult.hardeningIndex || 0,
    warningCount: lynisResult.warnings?.length || 0,
    suggestionsCount: lynisResult.suggestions?.length || 0,
    criticalFindings: lynisResult.warnings?.slice(0, 5) || [],
    topSuggestions: lynisResult.suggestions?.slice(0, 5) || [],
  };
}

/**
 * Run a comprehensive scan on the specified target
 * @param {Object} options - Scan options
 * @param {string} options.target - Target to scan (default: 'localhost')
 * @param {boolean} options.runNmap - Whether to run Nmap scan
 * @param {boolean} options.runLynis - Whether to run Lynis scan
 * @param {boolean} options.runPowerShell - Whether to run PowerShell scan
 * @param {string} options.outputDir - Directory to save scan outputs
 * @param {boolean} options.scanPackages - Whether to scan installed packages
 * @param {boolean} options.scanServices - Whether to scan running services
 * @param {boolean} options.scanVulnerabilities - Whether to scan vulnerabilities
 * @param {boolean} options.scanNetworkConfig - Whether to scan network config
 * @param {boolean} options.quickScan - Whether to run a quick scan (less depth)
 * @returns {Promise<Object>} Scan results with file path
 */
async function runScan(options) {
  const {
    target = "localhost",
    runNmap = true,
    runLynis = true,
    runPowerShell = isWindows(),
    outputDir,
    scanPackages = false, // Changed from true to false
    scanServices = true,
    scanVulnerabilities = true,
    scanNetworkConfig = true,
    quickScan = false,
  } = options;

  // Add a log message about packages
  console.log(`Running scan with options:`, {
    target,
    runNmap,
    runLynis,
    runPowerShell,
    scanPackages, // Now false by default
    scanServices,
    scanVulnerabilities,
    scanNetworkConfig,
    quickScan,
  });

  // Make sure output directory exists
  if (outputDir) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate timestamp for this scan
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  // Create a unified scan results object
  const unifiedResults = {
    scanId: timestamp,
    timestamp: new Date(),
    target,
    scanStatus: {
      overall: "in_progress",
    },
    systemInfo: null,
    network: {
      openPorts: [],
      runningServices: [],
    },
    packages: {
      count: 0,
      outdated: [],
      scanDisabled: true, // Add this flag to indicate packages scanning is disabled
    },
    security: {
      findings: [],
      hardeningIndex: 0,
    },
  };

  // Unified report file path
  const unifiedReportPath = outputDir
    ? path.join(outputDir, `scan_report_${timestamp}.json`)
    : null;

  // Write initial report
  if (unifiedReportPath) {
    fs.writeFileSync(
      unifiedReportPath,
      JSON.stringify(unifiedResults, null, 2)
    );
  }

  try {
    // Get system information (always runs)
    console.log(`Gathering system information for ${target}`);
    const systemInfoResult = await scanHostname_IPs(target);

    // Update unified results with system info
    unifiedResults.systemInfo = systemInfoResult;
    unifiedResults.scanStatus.systemInfo = "completed";

    // Update report file
    if (unifiedReportPath) {
      fs.writeFileSync(
        unifiedReportPath,
        JSON.stringify(unifiedResults, null, 2)
      );
    }

    // Run Nmap scan for network info
    if (runNmap) {
      console.log(`Running Nmap scan on ${target}`);
      try {
        const nmapResult = await scanPorts(target);
        const { openPorts, runningServices } =
          extractPortsAndServices(nmapResult);

        // Update unified results with network info
        unifiedResults.network.openPorts = openPorts;
        unifiedResults.network.runningServices = runningServices;
        unifiedResults.scanStatus.nmap = "completed";

        // Update report file
        if (unifiedReportPath) {
          fs.writeFileSync(
            unifiedReportPath,
            JSON.stringify(unifiedResults, null, 2)
          );
        }
      } catch (error) {
        console.error("Nmap scan error:", error.message);
        unifiedResults.scanStatus.nmap = "failed";
        unifiedResults.errors = unifiedResults.errors || {};
        unifiedResults.errors.nmap = error.message;
      }
    } else {
      unifiedResults.scanStatus.nmap = "skipped";
    }

    // Run Lynis scan for security info (Linux/macOS)
    if (runLynis && (process.platform !== "win32" || (await checkWSL()))) {
      console.log(`Running Lynis security scan`);
      try {
        const lynisResult = await runLynisScan({
          scanPackages,
        });

        // Extract security findings
        const securityInfo = extractLynisSecurity(lynisResult);

        // Update unified results with security info
        unifiedResults.security = {
          hardeningIndex: securityInfo.hardeningIndex,
          findings: securityInfo.criticalFindings,
          warnings: securityInfo.warningCount,
          suggestions: securityInfo.suggestionsCount,
        };

        // Extract package info if available and if package scanning is enabled
        if (scanPackages) {
          const packageInfo = extractPackageInfo(lynisResult);
          unifiedResults.packages = {
            count: packageInfo.packageCount,
            outdated: packageInfo.outdatedPackages,
            securityUpdates: packageInfo.securityUpdates,
            scanDisabled: false,
          };
        } else {
          // Ensure we indicate packages scanning is disabled
          unifiedResults.packages.scanDisabled = true;
        }

        unifiedResults.scanStatus.lynis = "completed";

        // Update report file
        if (unifiedReportPath) {
          fs.writeFileSync(
            unifiedReportPath,
            JSON.stringify(unifiedResults, null, 2)
          );
        }
      } catch (error) {
        console.error("Lynis scan error:", error.message);
        unifiedResults.scanStatus.lynis = "failed";
        unifiedResults.errors = unifiedResults.errors || {};
        unifiedResults.errors.lynis = error.message;
      }
    } else {
      unifiedResults.scanStatus.lynis = "skipped";
    }

    // Run PowerShell scan (Windows only)
    if (runPowerShell && isWindows()) {
      console.log(`Running PowerShell scan`);
      try {
        const powerShellResult = await runPowerShellScan({
          scanPackages,
        });

        // Extract Windows-specific info
        if (scanServices && powerShellResult.Services) {
          const winServices = powerShellResult.Services.map((service) => ({
            name: service.DisplayName || service.Name,
            status: "running",
          }));

          // Merge with existing services
          unifiedResults.network.runningServices = [
            ...unifiedResults.network.runningServices,
            ...winServices,
          ];
        }

        // Only extract software info if scanning packages is enabled (which is now false by default)
        if (
          scanPackages &&
          powerShellResult.Software &&
          powerShellResult.Software.length > 0
        ) {
          unifiedResults.packages.count = powerShellResult.Software.length || 0;
          unifiedResults.packages.scanDisabled = false;

          // Extract potentially outdated software
          const outdatedSoftware = powerShellResult.Software.filter((sw) => {
            if (!sw || !sw.DisplayName) return false;

            const installDate = sw.InstallDate;
            if (!installDate) return false;

            // Check if software is older than 2 years
            try {
              const twoYearsAgo = new Date();
              twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

              const swDate = new Date(installDate);
              return swDate < twoYearsAgo;
            } catch (e) {
              return false;
            }
          }).map(
            (sw) =>
              `${sw.DisplayName} (${sw.DisplayVersion || "unknown version"})`
          );

          unifiedResults.packages.outdated = outdatedSoftware.slice(0, 10);
        } else {
          // Ensure we indicate packages scanning is disabled
          unifiedResults.packages.scanDisabled = true;
        }

        // Add OS version from PowerShell scan if available
        if (powerShellResult.OSInfo) {
          unifiedResults.systemInfo = unifiedResults.systemInfo || {};
          unifiedResults.systemInfo.osInfo =
            unifiedResults.systemInfo.osInfo || {};
          unifiedResults.systemInfo.osInfo.name =
            powerShellResult.OSInfo.Caption ||
            unifiedResults.systemInfo.osInfo.name;
          unifiedResults.systemInfo.osInfo.version =
            powerShellResult.OSInfo.Version ||
            unifiedResults.systemInfo.osInfo.version;
          unifiedResults.systemInfo.osInfo.buildNumber =
            powerShellResult.OSInfo.BuildNumber || null;
        }

        // Add computer system info if available
        if (powerShellResult.ComputerSystem) {
          unifiedResults.systemInfo = unifiedResults.systemInfo || {};
          unifiedResults.systemInfo.computerName =
            powerShellResult.ComputerSystem.Name || null;
          unifiedResults.systemInfo.manufacturer =
            powerShellResult.ComputerSystem.Manufacturer || null;
          unifiedResults.systemInfo.model =
            powerShellResult.ComputerSystem.Model || null;
        }

        // Add network adapters if available and network scan is enabled
        if (scanNetworkConfig && powerShellResult.NetworkAdapters) {
          unifiedResults.network = unifiedResults.network || {};
          unifiedResults.network.adapters = powerShellResult.NetworkAdapters;
        }

        unifiedResults.scanStatus.powerShell = "completed";

        // Update report file
        if (unifiedReportPath) {
          fs.writeFileSync(
            unifiedReportPath,
            JSON.stringify(unifiedResults, null, 2)
          );
        }
      } catch (error) {
        console.error("PowerShell scan error:", error.message);

        // Add elevation error detection
        let errorMessage = error.message;
        if (
          error.message.includes("elevation") ||
          error.message.includes("administrator") ||
          error.message.includes("requires elevation")
        ) {
          errorMessage =
            "PowerShell scan requires administrator privileges. Please run the application as administrator.";
        }

        unifiedResults.scanStatus.powerShell = "failed";
        unifiedResults.errors = unifiedResults.errors || {};
        unifiedResults.errors.powerShell = errorMessage;

        // Still include basic system info that doesn't require admin rights
        unifiedResults.systemInfo = unifiedResults.systemInfo || {};

        // We'll still set this as partially complete if we have system info
        if (unifiedResults.systemInfo.hostname) {
          unifiedResults.scanStatus.powerShell = "partial";
        }

        // Update report file with the error
        if (unifiedReportPath) {
          fs.writeFileSync(
            unifiedReportPath,
            JSON.stringify(unifiedResults, null, 2)
          );
        }
      }
    } else {
      unifiedResults.scanStatus.powerShell = "skipped";
    }

    // Set overall scan status to completed
    unifiedResults.scanStatus.overall = "completed";

    // Write the final unified report
    if (unifiedReportPath) {
      fs.writeFileSync(
        unifiedReportPath,
        JSON.stringify(unifiedResults, null, 2)
      );
      unifiedResults.reportFile = unifiedReportPath;
    }

    console.log("Scan completed successfully");
    return unifiedResults;
  } catch (error) {
    console.error("Error during scan:", error);

    // Update report with error
    unifiedResults.scanStatus.overall = "failed";
    unifiedResults.error = error.message;

    if (unifiedReportPath) {
      fs.writeFileSync(
        unifiedReportPath,
        JSON.stringify(unifiedResults, null, 2)
      );
    }

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
        (file) => file.startsWith("scan_report_") && file.endsWith(".json")
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
          scanId: scanData.scanId,
          timestamp: scanData.timestamp,
          target: scanData.target,
          scanStatus: scanData.scanStatus,
          reportFile: filePath,
        };
      } catch (error) {
        console.error(`Error reading scan file ${filePath}:`, error);
        return {
          scanId: file.replace("scan_report_", "").replace(".json", ""),
          timestamp: new Date(
            file.replace("scan_report_", "").replace(".json", "")
          ),
          error: "Could not read scan file",
          reportFile: filePath,
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
    const filePath = path.join(outputDir, `scan_report_${scanId}.json`);

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
