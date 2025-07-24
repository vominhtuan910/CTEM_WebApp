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
 * @param {Object} options - Scan options
 * @param {boolean} options.scanPackages - Whether to scan installed packages
 * @returns {Promise<object>} Scan results
 */
async function runPowerShellScan(options = {}) {
  if (!isWindows()) {
    throw new Error("PowerShell scan is only available on Windows systems");
  }

  const { scanPackages = false } = options;
  console.log("Starting PowerShell scan...", { scanPackages });

  // PowerShell command that outputs clean JSON directly
  const psCommand = `
    # Force output to be UTF8 to avoid encoding issues
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8

    # OS information
    $os = Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber, OSArchitecture, @{Name='LastBootUpTime';Expression={$_.LastBootUpTime.ToString('o')}}

    # Computer system information
    $cs = Get-CimInstance Win32_ComputerSystem | Select-Object Name, Manufacturer, Model, TotalPhysicalMemory, SystemType

    # Running services - use single quotes to avoid parsing issues
    $services = Get-Service | Where-Object {$_.Status -eq 'Running'} | Select-Object Name, DisplayName

    ${
      scanPackages
        ? `
    # Installed software
    $software = Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Where-Object {$_.DisplayName} | Select-Object DisplayName, DisplayVersion, Publisher, InstallDate
    `
        : `
    # Software scanning disabled
    $software = @()
    `
    }

    # Network adapters
    $adapters = Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, MacAddress, LinkSpeed

    # IP configuration
    $ipConfig = Get-NetIPAddress | Select-Object InterfaceAlias, AddressFamily, IPAddress, PrefixLength

    # Windows features - with error handling for elevation requirement
    try {
        $features = Get-WindowsOptionalFeature -Online | Where-Object {$_.State -eq 'Enabled'} | Select-Object FeatureName
    } catch {
        $features = @()
        Write-Warning "Could not get Windows features. Administrator privileges required."
    }

    # Security settings
    $firewall = Get-NetFirewallProfile | Select-Object Name, Enabled

    # Windows Update status
    $updates = Get-HotFix | Select-Object HotFixID, Description, InstalledOn | Sort-Object -Property InstalledOn -Descending | Select-Object -First 10

    # Security vulnerabilities
    try { 
        $vulnAssessment = Get-MpThreatCatalog | Select-Object -First 10 
    } catch { 
        $vulnAssessment = @{Status = 'Not available'; Reason = $_.Exception.Message}
    }

    # Create result object
    $result = @{
        OSInfo = $os
        ComputerSystem = $cs
        Services = $services | Select-Object -First 50
        Software = $software ${scanPackages ? "| Select-Object -First 50" : ""}
        NetworkAdapters = $adapters
        IPConfiguration = $ipConfig
        WindowsFeatures = $features | Select-Object -First 50
        FirewallProfiles = $firewall
        RecentUpdates = $updates
        SecurityVulnerabilities = $vulnAssessment
        PackagesScanDisabled = ${!scanPackages ? "$true" : "$false"}
    }

    # Convert to clean JSON without BOM or XML artifacts
    $jsonResult = ConvertTo-Json -InputObject $result -Depth 4 -Compress
    
    # Output just the JSON
    Write-Output $jsonResult
  `;

  // Write the script to a temp file to avoid command line escaping issues
  const tempScriptPath = path.join(__dirname, "temp_ps_scan.ps1");
  fs.writeFileSync(tempScriptPath, psCommand);

  return new Promise((resolve, reject) => {
    // Execute PowerShell script from file with UTF8 encoding
    const ps = "powershell.exe";
    const command = `${ps} -ExecutionPolicy Bypass -File "${tempScriptPath}" -OutputFormat Text`;

    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempScriptPath);
      } catch (e) {
        console.warn("Could not delete temp script:", e.message);
      }

      if (error) {
        console.error("PowerShell scan error:", error.message);
        reject(error);
        return;
      }

      if (stderr && stderr.trim() !== "") {
        console.warn("PowerShell stderr:", stderr);
      }

      try {
        // Ensure we're getting clean JSON by trimming any extra output
        const jsonStart = stdout.indexOf("{");
        const jsonEnd = stdout.lastIndexOf("}") + 1;

        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error("Could not find valid JSON in PowerShell output");
        }

        const jsonString = stdout.substring(jsonStart, jsonEnd);
        const results = JSON.parse(jsonString);

        // Add timestamp
        results.timestamp = new Date();

        console.log("PowerShell scan completed successfully");
        resolve(results);
      } catch (parseError) {
        console.error("Error parsing PowerShell output:", parseError.message);
        reject(parseError);
      }
    });
  });
}

export { isWindows, runPowerShellScan };
