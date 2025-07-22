import { v4 as uuidv4 } from "uuid";

/**
 * Converts network interfaces to services
 * @param {Object} interfaces - Network interfaces from hostnameAndIP.js
 * @returns {Array} List of services
 */
export function interfacesToServices(interfaces) {
  if (!interfaces) return [];

  const services = [];

  Object.entries(interfaces).forEach(([name, details]) => {
    if (details.state === "UP") {
      services.push({
        name: name,
        displayName: `Network Interface ${name}`,
        status: "running",
        startType: "automatic",
        pid: undefined,
        port: undefined,
      });
    }
  });

  return services;
}

/**
 * Converts Nmap port data to services
 * @param {Object} portData - Port data from scanPorts.js
 * @returns {Array} List of services
 */
export function portsToServices(portData) {
  if (!portData || !portData.openPorts) return [];

  return portData.openPorts.map((port) => ({
    name: port.service || `port-${port.port}`,
    displayName: port.product
      ? `${port.service} (${port.product})`
      : port.service,
    status: "running",
    startType: "automatic",
    pid: undefined,
    port: parseInt(port.port, 10),
  }));
}

/**
 * Formats Lynis or PowerShell scan results into applications
 * @param {Object} scanData - Scan data from lynisScan.js or powershellScan.js
 * @returns {Array} List of applications
 */
export function scanToApplications(scanData) {
  if (!scanData) return [];

  // Handle Lynis scan results
  if (scanData.installed_packages) {
    return scanData.installed_packages.map((pkg) => ({
      name: pkg.name,
      version: pkg.version || "Unknown",
      publisher: "Unknown",
      installDate: new Date().toISOString().split("T")[0], // Just use today's date as a fallback
      size: "Unknown",
    }));
  }

  // Handle PowerShell scan results
  if (scanData.installed_software) {
    return scanData.installed_software.map((software) => ({
      name: software.name,
      version: software.version || "Unknown",
      publisher: software.publisher || "Unknown",
      installDate:
        software.installDate || new Date().toISOString().split("T")[0],
      size: "Unknown",
    }));
  }

  return [];
}

/**
 * Combines scan results to create an Asset object
 * @param {Object} systemInfo - System info from hostnameAndIP.js
 * @param {Object} portData - Port data from scanPorts.js
 * @param {Object} detailedScan - Lynis or PowerShell scan results
 * @returns {Object} Asset object
 */
export function scanResultsToAsset(systemInfo, portData, detailedScan = null) {
  if (!systemInfo) {
    throw new Error("System information is required");
  }

  // Extract hostname
  const hostname = systemInfo.hostname || "unknown-host";

  // Extract IP address
  const ipAddress = systemInfo.ip_addresses_short?.split(" ")[0] || "127.0.0.1";
  const ipAddresses = systemInfo.ip_addresses_short?.split(" ") || [ipAddress];

  // Determine OS information
  let osInfo = {
    name: "Unknown",
    version: "Unknown",
    architecture: "Unknown",
    buildNumber: "Unknown",
    lastBootTime: new Date().toISOString(),
  };

  // Extract OS info from detailed scan if available
  if (detailedScan) {
    if (detailedScan.system_info) {
      // PowerShell scan
      if (detailedScan.system_info.os_name) {
        osInfo = {
          name: detailedScan.system_info.os_name.replace("Microsoft ", ""),
          version: detailedScan.system_info.os_version || "Unknown",
          architecture: detailedScan.system_info.os_architecture || "Unknown",
          buildNumber: detailedScan.system_info.os_build || "Unknown",
          lastBootTime:
            detailedScan.system_info.last_boot_time || new Date().toISOString(),
        };
      }
    } else if (detailedScan.system_info?.os_name) {
      // Lynis scan
      osInfo = {
        name: detailedScan.system_info.os_name,
        version: detailedScan.system_info.os_version || "Unknown",
        architecture: "Unknown", // Lynis doesn't provide architecture directly
        buildNumber: detailedScan.system_info.kernel_version || "Unknown",
        lastBootTime: new Date().toISOString(),
      };
    }
  } else {
    // Try to determine OS from network interfaces (Linux-specific)
    if (systemInfo.network_interfaces) {
      osInfo.name = "Linux";
    }
  }

  // Combine services from ports and network interfaces
  const portServices = portsToServices(portData);
  const networkServices = interfacesToServices(systemInfo.network_interfaces);

  // Add services from detailed scan if available
  let detailedServices = [];
  if (detailedScan) {
    if (detailedScan.services) {
      detailedServices = detailedScan.services.map((service) => ({
        name: service.name,
        displayName: service.displayName || service.name,
        status: service.status || "unknown",
        startType: "unknown",
        pid: undefined,
        port: undefined,
      }));
    }
  }

  // Combine all services, removing duplicates by name
  const allServices = [...portServices];

  // Add network services that don't overlap with port services
  networkServices.forEach((netService) => {
    if (!allServices.some((s) => s.name === netService.name)) {
      allServices.push(netService);
    }
  });

  // Add detailed services that don't overlap with existing services
  detailedServices.forEach((detService) => {
    if (!allServices.some((s) => s.name === detService.name)) {
      allServices.push(detService);
    }
  });

  // Get applications from detailed scan
  const applications = detailedScan ? scanToApplications(detailedScan) : [];

  // Calculate a simple health score based on services and warnings
  let healthScore = 100;
  let issuesCount = 0;

  // Reduce health score for each warning in Lynis scan
  if (detailedScan && detailedScan.warnings) {
    issuesCount = detailedScan.warnings.length;
    healthScore -= Math.min(50, issuesCount * 5); // Max 50 points reduction for warnings
  }

  // If we have a hardening index from Lynis, use that as part of the health score
  if (detailedScan && detailedScan.hardening_index) {
    healthScore = Math.round((healthScore + detailedScan.hardening_index) / 2);
  }

  // Ensure health score is between 0 and 100
  healthScore = Math.max(0, Math.min(100, healthScore));

  // Create the asset object
  return {
    id: uuidv4(),
    hostname,
    ipAddress,
    ipAddresses,
    status: "active",
    lastScan: new Date().toISOString(),
    os: osInfo,
    services: allServices,
    applications,
    healthScore,
    issuesCount,
    labels: [],
    agentStatus: "installed",
  };
}

export default {
  interfacesToServices,
  portsToServices,
  scanToApplications,
  scanResultsToAsset,
};
