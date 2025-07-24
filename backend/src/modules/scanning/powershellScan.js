import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output file path
const outputPath = path.join(
  __dirname,
  "..",
  "output",
  "powershell_scan_results.json"
);

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
    "};",

    // Convert to JSON and return
    "ConvertTo-Json -InputObject $result -Depth 4 -Compress",
  ].join(" ");

  return new Promise((resolve, reject) => {
    // Execute PowerShell command
    const ps = isWindows() ? "powershell.exe" : "pwsh";

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

          // Save to file
          fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

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
 * Get the latest PowerShell scan results
 * @returns {Promise<object|null>} Latest scan results or null if not available
 */
async function getPowerShellResults() {
  try {
    if (fs.existsSync(outputPath)) {
      const data = fs.readFileSync(outputPath, "utf8");
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error("Error reading PowerShell scan results:", error.message);
    return null;
  }
}

export { isWindows, runPowerShellScan, getPowerShellResults };
