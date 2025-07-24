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
 * Check if running on Windows
 * @returns {boolean} True if running on Windows
 */
function isWindows() {
  return process.platform === "win32";
}

/**
 * Run PowerShell scan for Windows systems
 * @returns {Promise<object>} Scan results
 */
async function runPowerShellScan() {
  if (!isWindows()) {
    throw new Error("PowerShell scan is only available on Windows systems");
  }

  console.log("Starting PowerShell scan...");

  // Create an array of PowerShell commands to gather system information
  const psCommands = [
    // OS information
    "$os = Get-CimInstance Win32_OperatingSystem;",

    // Computer system information
    "$cs = Get-CimInstance Win32_ComputerSystem;",

    // Running services
    '$services = Get-Service | Where-Object {$_.Status -eq "Running"} | Select-Object Name, DisplayName;',

    // Installed software
    "$software = Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object DisplayName, DisplayVersion, Publisher, InstallDate | Where-Object {$_.DisplayName};",

    // Network adapters
    "$adapters = Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, MacAddress, LinkSpeed;",

    // IP configuration
    "$ipConfig = Get-NetIPAddress | Select-Object InterfaceAlias, AddressFamily, IPAddress, PrefixLength;",

    // Windows features
    '$features = Get-WindowsOptionalFeature -Online | Where-Object {$_.State -eq "Enabled"} | Select-Object FeatureName;',

    // Security settings
    "$firewall = Get-NetFirewallProfile | Select-Object Name, Enabled;",

    // Windows Update status
    "$updates = Get-HotFix | Select-Object HotFixID, Description, InstalledOn | Sort-Object -Property InstalledOn -Descending | Select-Object -First 10;",

    // Security vulnerabilities
    "try { $vulnAssessment = Get-MpThreatCatalog | Select-Object -First 10 } catch { $vulnAssessment = 'Not available' }",

    // Return as JSON
    "$result = @{",
    "    OSInfo = $os | Select-Object Caption, Version, BuildNumber, OSArchitecture, LastBootUpTime;",
    "    ComputerSystem = $cs | Select-Object Name, Manufacturer, Model, TotalPhysicalMemory, SystemType;",
    "    Services = $services;",
    "    Software = $software | Select-Object -First 50;",
    "    NetworkAdapters = $adapters;",
    "    IPConfiguration = $ipConfig;",
    "    WindowsFeatures = $features | Select-Object -First 50;",
    "    FirewallProfiles = $firewall;",
    "    RecentUpdates = $updates;",
    "    SecurityVulnerabilities = $vulnAssessment;",
    "};",

    // Convert to JSON and return
    "ConvertTo-Json -InputObject $result -Depth 4 -Compress",
  ].join(" ");

  return new Promise((resolve, reject) => {
    // Execute PowerShell command
    const ps = "powershell.exe";

    exec(
      `${ps} -Command "${psCommands}"`,
      { maxBuffer: 1024 * 1024 * 10 },
      (error, stdout, stderr) => {
        if (error) {
          console.error("PowerShell scan error:", error.message);
          reject(error);
          return;
        }

        if (stderr && stderr.trim() !== "") {
          console.warn("PowerShell stderr:", stderr);
        }

        try {
          // Parse JSON output
          const results = JSON.parse(stdout);

          // Add timestamp
          results.timestamp = new Date();

          console.log("PowerShell scan completed successfully");
          resolve(results);
        } catch (parseError) {
          console.error("Error parsing PowerShell output:", parseError.message);
          reject(parseError);
        }
      }
    );
  });
}

/**
 * Extract vulnerability data from Windows scan results
 * @param {Object} scanResults - PowerShell scan results
 * @returns {Array} Array of vulnerability objects
 */
function extractWindowsVulnerabilities(scanResults) {
  const vulnerabilities = [];

  // Check for firewall vulnerabilities
  if (scanResults.FirewallProfiles) {
    scanResults.FirewallProfiles.forEach((profile) => {
      if (!profile.Enabled) {
        vulnerabilities.push({
          name: `Windows Firewall ${profile.Name} profile disabled`,
          type: "configuration",
          severity: "High",
          description: `The ${profile.Name} firewall profile is disabled, which may expose the system to network attacks.`,
          recommendation: `Enable the ${profile.Name} firewall profile using Windows Firewall settings.`,
        });
      }
    });
  }

  // Check for outdated software
  if (scanResults.Software) {
    const knownVulnSoftware = [
      { name: "Adobe Reader", version: "15.0", vulnBelow: "19.0" },
      { name: "Java", version: "", vulnBelow: "8.0.271" },
      { name: "Flash Player", version: "", vulnBelow: "32.0" },
    ];

    scanResults.Software.forEach((sw) => {
      if (!sw.DisplayName) return;

      knownVulnSoftware.forEach((vuln) => {
        if (
          sw.DisplayName.includes(vuln.name) &&
          sw.DisplayVersion &&
          parseFloat(sw.DisplayVersion) < parseFloat(vuln.vulnBelow)
        ) {
          vulnerabilities.push({
            name: `Outdated ${vuln.name}`,
            type: "software",
            severity: "Medium",
            description: `${sw.DisplayName} version ${sw.DisplayVersion} is outdated and may contain security vulnerabilities.`,
            recommendation: `Update ${sw.DisplayName} to the latest version.`,
          });
        }
      });
    });
  }

  // Add any security vulnerabilities from the scan
  if (
    scanResults.SecurityVulnerabilities &&
    Array.isArray(scanResults.SecurityVulnerabilities)
  ) {
    scanResults.SecurityVulnerabilities.forEach((vuln) => {
      vulnerabilities.push({
        name: vuln.ThreatName || "Unknown Threat",
        type: "security",
        severity: "Critical",
        description: vuln.Description || "Windows detected a security threat.",
        recommendation:
          "Run Windows Defender full scan and apply all security updates.",
      });
    });
  }

  return vulnerabilities;
}

export { isWindows, runPowerShellScan, extractWindowsVulnerabilities };
