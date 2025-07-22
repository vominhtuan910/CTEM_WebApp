import { exec } from "child_process";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, "../output");
const POWERSHELL_OUTPUT_FILE = path.join(OUTPUT_DIR, "powershell_output.json");

// Ensure output directory exists
fs.ensureDirSync(OUTPUT_DIR);

/**
 * Check if running on Windows
 * @returns {boolean} True if running on Windows
 */
export function isWindows() {
  return process.platform === "win32";
}

/**
 * Run a PowerShell command
 * @param {string} command - PowerShell command to run
 * @returns {Promise<string>} Command output
 */
export function runPowerShellCommand(command) {
  return new Promise((resolve, reject) => {
    if (!isWindows()) {
      return reject(
        new Error("PowerShell commands can only be run on Windows")
      );
    }

    // Escape single quotes in the command
    const escapedCommand = command.replace(/'/g, "''");

    // Execute PowerShell with the command
    exec(
      `powershell -Command "${escapedCommand}"`,
      { maxBuffer: 1024 * 1024 * 10 },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`PowerShell command error: ${error.message}`);
          return reject(error);
        }
        if (stderr) {
          console.warn(`PowerShell stderr: ${stderr}`);
        }
        resolve(stdout.trim());
      }
    );
  });
}

/**
 * Run a PowerShell scan to collect system information
 * @returns {Promise<object>} System information
 */
export async function runPowerShellScan() {
  if (!isWindows()) {
    throw new Error("PowerShell scan can only be run on Windows");
  }

  try {
    console.log("Starting PowerShell scan...");

    // Collect system information in parallel
    const [systemInfo, services, installedSoftware, networkInfo, securityInfo] =
      await Promise.all([
        getSystemInfo(),
        getServices(),
        getInstalledSoftware(),
        getNetworkInfo(),
        getSecurityInfo(),
      ]);

    // Combine all information
    const results = {
      system_info: systemInfo,
      services,
      installed_software: installedSoftware,
      network_info: networkInfo,
      security_info: securityInfo,
      scan_date: new Date().toISOString(),
    };

    // Save results to file
    await fs.writeJson(POWERSHELL_OUTPUT_FILE, results, { spaces: 2 });
    console.log("PowerShell scan completed and results saved");

    return results;
  } catch (error) {
    console.error(`Error running PowerShell scan: ${error.message}`);
    throw error;
  }
}

/**
 * Get basic system information
 * @returns {Promise<object>} System information
 */
async function getSystemInfo() {
  try {
    // Get computer system information
    const computerSystemJson = await runPowerShellCommand(
      "Get-CimInstance -ClassName Win32_ComputerSystem | ConvertTo-Json"
    );
    const computerSystem = JSON.parse(computerSystemJson);

    // Get operating system information
    const osJson = await runPowerShellCommand(
      "Get-CimInstance -ClassName Win32_OperatingSystem | ConvertTo-Json"
    );
    const os = JSON.parse(osJson);

    // Get BIOS information
    const biosJson = await runPowerShellCommand(
      "Get-CimInstance -ClassName Win32_BIOS | ConvertTo-Json"
    );
    const bios = JSON.parse(biosJson);

    // Get processor information
    const processorJson = await runPowerShellCommand(
      "Get-CimInstance -ClassName Win32_Processor | ConvertTo-Json"
    );
    const processor = Array.isArray(JSON.parse(processorJson))
      ? JSON.parse(processorJson)[0]
      : JSON.parse(processorJson);

    return {
      hostname: computerSystem.Name,
      manufacturer: computerSystem.Manufacturer,
      model: computerSystem.Model,
      os_name: os.Caption,
      os_version: os.Version,
      os_build: os.BuildNumber,
      os_architecture: os.OSArchitecture,
      last_boot_time: os.LastBootUpTime,
      bios_version: bios.SMBIOSBIOSVersion,
      processor_name: processor.Name,
      processor_cores: processor.NumberOfCores,
      total_memory_gb: Math.round(
        computerSystem.TotalPhysicalMemory / (1024 * 1024 * 1024)
      ),
      system_type: computerSystem.SystemType,
    };
  } catch (error) {
    console.error("Error getting system information:", error);
    return {
      hostname: "Unknown",
      os_name: "Windows",
      os_version: "Unknown",
    };
  }
}

/**
 * Get services information
 * @returns {Promise<Array>} Services information
 */
async function getServices() {
  try {
    const servicesJson = await runPowerShellCommand(
      "Get-Service | Select-Object Name, DisplayName, Status | ConvertTo-Json"
    );
    const services = JSON.parse(servicesJson);

    return Array.isArray(services)
      ? services.map((service) => ({
          name: service.Name,
          displayName: service.DisplayName,
          status: service.Status.toLowerCase(),
        }))
      : [];
  } catch (error) {
    console.error("Error getting services:", error);
    return [];
  }
}

/**
 * Get installed software information
 * @returns {Promise<Array>} Installed software information
 */
async function getInstalledSoftware() {
  try {
    // Get installed software from registry (64-bit)
    const softwareJson64 = await runPowerShellCommand(
      "Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | " +
        "Where-Object { $_.DisplayName -ne $null } | " +
        "Select-Object DisplayName, DisplayVersion, Publisher, InstallDate | " +
        "ConvertTo-Json"
    );

    // Get installed software from registry (32-bit on 64-bit system)
    const softwareJson32 = await runPowerShellCommand(
      "Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | " +
        "Where-Object { $_.DisplayName -ne $null } | " +
        "Select-Object DisplayName, DisplayVersion, Publisher, InstallDate | " +
        "ConvertTo-Json"
    );

    // Parse and combine results
    const software64 = JSON.parse(softwareJson64);
    const software32 = JSON.parse(softwareJson32);

    const allSoftware = [
      ...(Array.isArray(software64) ? software64 : [software64]),
      ...(Array.isArray(software32) ? software32 : [software32]),
    ].filter(Boolean);

    // Format the results
    return allSoftware.map((software) => ({
      name: software.DisplayName,
      version: software.DisplayVersion || "Unknown",
      publisher: software.Publisher || "Unknown",
      installDate: software.InstallDate || "Unknown",
    }));
  } catch (error) {
    console.error("Error getting installed software:", error);
    return [];
  }
}

/**
 * Get network information
 * @returns {Promise<object>} Network information
 */
async function getNetworkInfo() {
  try {
    // Get network adapters
    const adaptersJson = await runPowerShellCommand(
      "Get-NetAdapter | " +
        "Select-Object Name, InterfaceDescription, Status, MacAddress, LinkSpeed | " +
        "ConvertTo-Json"
    );

    // Get IP addresses
    const ipConfigJson = await runPowerShellCommand(
      "Get-NetIPAddress | " +
        "Select-Object InterfaceAlias, IPAddress, PrefixLength, AddressFamily | " +
        "ConvertTo-Json"
    );

    // Parse results
    const adapters = JSON.parse(adaptersJson);
    const ipConfig = JSON.parse(ipConfigJson);

    // Format adapters
    const formattedAdapters = Array.isArray(adapters)
      ? adapters.map((adapter) => ({
          name: adapter.Name,
          description: adapter.InterfaceDescription,
          status: adapter.Status.toLowerCase(),
          mac_address: adapter.MacAddress,
          link_speed: adapter.LinkSpeed,
        }))
      : [];

    // Format IP addresses
    const formattedIpAddresses = Array.isArray(ipConfig)
      ? ipConfig.map((ip) => ({
          interface: ip.InterfaceAlias,
          ip_address: ip.IPAddress,
          prefix_length: ip.PrefixLength,
          address_family: ip.AddressFamily === 2 ? "IPv4" : "IPv6",
        }))
      : [];

    return {
      adapters: formattedAdapters,
      ip_addresses: formattedIpAddresses,
    };
  } catch (error) {
    console.error("Error getting network information:", error);
    return {
      adapters: [],
      ip_addresses: [],
    };
  }
}

/**
 * Get security information
 * @returns {Promise<object>} Security information
 */
async function getSecurityInfo() {
  try {
    // Get Windows Defender status
    const defenderStatusJson = await runPowerShellCommand(
      "Get-MpComputerStatus | " +
        "Select-Object AMServiceEnabled, AntispywareEnabled, AntivirusEnabled, BehaviorMonitorEnabled, IoavProtectionEnabled, RealTimeProtectionEnabled | " +
        "ConvertTo-Json"
    );

    // Get firewall status
    const firewallStatusJson = await runPowerShellCommand(
      "Get-NetFirewallProfile | " +
        "Select-Object Name, Enabled | " +
        "ConvertTo-Json"
    );

    // Parse results
    const defenderStatus = JSON.parse(defenderStatusJson);
    const firewallStatus = JSON.parse(firewallStatusJson);

    return {
      windows_defender: {
        service_enabled: defenderStatus.AMServiceEnabled,
        antispyware_enabled: defenderStatus.AntispywareEnabled,
        antivirus_enabled: defenderStatus.AntivirusEnabled,
        behavior_monitor_enabled: defenderStatus.BehaviorMonitorEnabled,
        ioav_protection_enabled: defenderStatus.IoavProtectionEnabled,
        real_time_protection_enabled: defenderStatus.RealTimeProtectionEnabled,
      },
      firewall: Array.isArray(firewallStatus)
        ? firewallStatus.map((profile) => ({
            profile: profile.Name,
            enabled: profile.Enabled,
          }))
        : [],
    };
  } catch (error) {
    console.error("Error getting security information:", error);
    return {
      windows_defender: {
        service_enabled: null,
        antispyware_enabled: null,
        antivirus_enabled: null,
        real_time_protection_enabled: null,
      },
      firewall: [],
    };
  }
}

/**
 * Gets the latest PowerShell scan results from file
 * @returns {Promise<object>} PowerShell scan results
 */
export async function getPowerShellResults() {
  try {
    if (await fs.pathExists(POWERSHELL_OUTPUT_FILE)) {
      return await fs.readJson(POWERSHELL_OUTPUT_FILE);
    }
    return null;
  } catch (error) {
    console.error(`Error reading PowerShell results: ${error.message}`);
    return null;
  }
}

export default {
  isWindows,
  runPowerShellCommand,
  runPowerShellScan,
  getPowerShellResults,
};
