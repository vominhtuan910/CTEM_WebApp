import { v4 as uuidv4 } from "uuid";

/**
 * Convert scan results to a standardized asset object
 * @param {Object} systemInfo - System information from scanHostname_IPs
 * @param {Object} portData - Port scan data from scanPorts
 * @param {Object} detailedScan - Additional scan data from OS-specific scanners
 * @returns {Object} Standardized asset object
 */
function scanResultsToAsset(systemInfo, portData, detailedScan) {
  // Define IP addresses with proper formatting
  const ipAddresses = [];
  if (systemInfo?.ipAddresses && Array.isArray(systemInfo.ipAddresses)) {
    systemInfo.ipAddresses.forEach((ip) => {
      if (typeof ip === "object" && ip.address) {
        ipAddresses.push(ip.address);
      } else if (typeof ip === "string") {
        ipAddresses.push(ip);
      }
    });
  }

  // Get primary IP address
  const primaryIp = getPrimaryIpAddress(systemInfo, portData);

  // Handle OS info from different sources
  const osInfo = getOsInfo(systemInfo, portData, detailedScan);

  const asset = {
    id: uuidv4(),
    hostname: systemInfo?.hostname || "unknown-host",
    name: systemInfo?.hostname || "Unknown Host",
    ipAddress: primaryIp,
    ipAddresses: ipAddresses,
    status: "active",
    lastScan: new Date().toISOString(),
    healthScore: calculateHealthScore(systemInfo, portData, detailedScan),
    issuesCount: countIssues(detailedScan),
    labels: generateLabels(systemInfo, portData, detailedScan),
    agentStatus: "not_installed",

    // OS Information
    osName: osInfo.name,
    osVersion: osInfo.version,
    osArchitecture: osInfo.architecture,
    osBuildNumber: osInfo.buildNumber,
    osLastBootTime: osInfo.lastBootTime,

    // Risk prioritization scores (default values)
    confidentiality: 1,
    integrity: 1,
    availability: 1,

    // Department, location, owner (empty defaults)
    department: "",
    location: "",
    owner: "",

    // Additional data
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return asset;
}

/**
 * Get primary IP address from scan results
 * @param {Object} systemInfo - System information
 * @param {Object} portData - Port scan data
 * @returns {string} Primary IP address
 */
function getPrimaryIpAddress(systemInfo, portData) {
  // First try the target IP from port scan
  if (
    portData?.target &&
    portData.target !== "127.0.0.1" &&
    portData.target !== "localhost"
  ) {
    return portData.target;
  }

  // Then try system IP addresses
  if (systemInfo?.ipAddresses && Array.isArray(systemInfo.ipAddresses)) {
    // First look for non-loopback IPv4 addresses
    for (const ip of systemInfo.ipAddresses) {
      const address = ip.address || ip;
      if (
        typeof address === "string" &&
        address !== "127.0.0.1" &&
        address !== "::1" &&
        !address.startsWith("169.254.") && // Link-local
        !address.startsWith("fe80:")
      ) {
        // IPv6 link-local
        return address;
      }
    }
  }

  // Fallback to localhost
  return "127.0.0.1";
}

/**
 * Get consolidated OS information from various scan sources
 * @param {Object} systemInfo - System information
 * @param {Object} portData - Port scan data
 * @param {Object} detailedScan - Detailed scan data
 * @returns {Object} Consolidated OS information
 */
function getOsInfo(systemInfo, portData, detailedScan) {
  const osInfo = {
    name: "Unknown",
    version: "",
    architecture: "unknown",
    buildNumber: "",
    lastBootTime: null,
  };

  // Try Windows PowerShell scan first (most detailed for Windows)
  if (detailedScan?.OSInfo) {
    osInfo.name = detailedScan.OSInfo.Caption || osInfo.name;
    osInfo.version = detailedScan.OSInfo.Version || osInfo.version;
    osInfo.architecture =
      detailedScan.OSInfo.OSArchitecture || osInfo.architecture;
    osInfo.buildNumber = detailedScan.OSInfo.BuildNumber || osInfo.buildNumber;

    if (detailedScan.OSInfo.LastBootUpTime) {
      try {
        osInfo.lastBootTime = new Date(
          detailedScan.OSInfo.LastBootUpTime
        ).toISOString();
      } catch (e) {
        console.log("Error parsing LastBootUpTime:", e);
      }
    }

    return osInfo;
  }

  // Try Nmap OS detection
  if (portData?.osInfo?.detected) {
    osInfo.name = portData.osInfo.name || osInfo.name;

    // Try to extract version from OS name
    const versionMatch = osInfo.name.match(
      /(Windows|Linux|Mac OS X|macOS|Ubuntu|Debian|CentOS|RHEL).*?([\d\.]+)/i
    );
    if (versionMatch) {
      osInfo.version = versionMatch[2];
    }

    return osInfo;
  }

  // Try basic system info
  if (systemInfo) {
    if (systemInfo.type) osInfo.name = systemInfo.type;
    if (systemInfo.platform) {
      // Enhance platform names
      const platformMap = {
        win32: "Windows",
        darwin: "macOS",
        linux: "Linux",
      };
      osInfo.name = platformMap[systemInfo.platform] || systemInfo.platform;
    }
    if (systemInfo.release) osInfo.version = systemInfo.release;
    if (systemInfo.arch) osInfo.architecture = systemInfo.arch;
  }

  return osInfo;
}

/**
 * Calculate health score based on scan results
 * @param {Object} systemInfo - System information
 * @param {Object} portData - Port scan data
 * @param {Object} detailedScan - Detailed scan data
 * @returns {number} Health score between 0-100
 */
function calculateHealthScore(systemInfo, portData, detailedScan) {
  // Start with a base score
  let score = 75;

  // Adjust based on open ports (fewer is better)
  const openPorts = portData?.openPorts?.length || 0;
  if (openPorts > 10) score -= 5;
  if (openPorts > 20) score -= 5;
  if (openPorts > 30) score -= 5;

  // Check for high-risk ports
  const highRiskPorts = [21, 23, 25, 445, 1433, 3306, 3389, 5432];
  const openPortNumbers = portData?.openPorts?.map((p) => p.port) || [];
  const openHighRiskPorts = highRiskPorts.filter((port) =>
    openPortNumbers.includes(port)
  );
  score -= openHighRiskPorts.length * 3;

  // Adjust based on warnings/issues from detailed scan
  const issues = countIssues(detailedScan);
  score -= Math.min(issues * 2, 25); // Max reduction of 25 points

  // Windows-specific adjustments
  if (detailedScan?.FirewallProfiles) {
    const disabledFirewalls = detailedScan.FirewallProfiles.filter(
      (p) => !p.Enabled
    ).length;
    score -= disabledFirewalls * 10;
  }

  // Linux-specific adjustments
  if (detailedScan?.hardening?.index) {
    // Blend the Lynis hardening index with our score
    score = Math.round((score + detailedScan.hardening.index) / 2);
  }

  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Count issues from detailed scan
 * @param {Object} detailedScan - Detailed scan data
 * @returns {number} Count of issues
 */
function countIssues(detailedScan) {
  if (!detailedScan) return 0;

  let count = 0;

  // Count warnings from Lynis scan
  if (
    detailedScan.securityWarnings &&
    Array.isArray(detailedScan.securityWarnings)
  ) {
    count += detailedScan.securityWarnings.length;
  }

  // Count disabled security features from Windows scan
  if (
    detailedScan.FirewallProfiles &&
    Array.isArray(detailedScan.FirewallProfiles)
  ) {
    count += detailedScan.FirewallProfiles.filter((p) => !p.Enabled).length;
  }

  return count;
}

/**
 * Generate labels based on scan results
 * @param {Object} systemInfo - System information
 * @param {Object} portData - Port scan data
 * @param {Object} detailedScan - Detailed scan data
 * @returns {string[]} Array of labels
 */
function generateLabels(systemInfo, portData, detailedScan) {
  const labels = [];

  // Add OS type
  const osName = getOsInfo(
    systemInfo,
    portData,
    detailedScan
  ).name.toLowerCase();
  if (osName.includes("windows")) labels.push("windows");
  if (osName.includes("linux")) labels.push("linux");
  if (osName.includes("ubuntu")) labels.push("ubuntu");
  if (osName.includes("centos")) labels.push("centos");
  if (osName.includes("debian")) labels.push("debian");
  if (osName.includes("redhat") || osName.includes("rhel"))
    labels.push("redhat");
  if (osName.includes("mac") || osName.includes("darwin")) labels.push("macos");

  // Add server type labels based on open ports
  const openPorts = portData?.openPorts || [];
  const portNumbers = openPorts.map((p) => parseInt(p.port || "0"));

  if (portNumbers.includes(80) || portNumbers.includes(443)) {
    labels.push("web-server");
  }

  if (portNumbers.includes(22)) {
    labels.push("ssh");
  }

  if (portNumbers.includes(21)) {
    labels.push("ftp");
  }

  if (portNumbers.includes(25) || portNumbers.includes(587)) {
    labels.push("mail-server");
  }

  if (portNumbers.includes(3306)) {
    labels.push("mysql");
  }

  if (portNumbers.includes(5432)) {
    labels.push("postgresql");
  }

  if (portNumbers.includes(3389)) {
    labels.push("rdp");
  }

  if (portNumbers.includes(445) || portNumbers.includes(139)) {
    labels.push("smb");
  }

  return labels;
}

/**
 * Extract services from scan results
 * @param {Object} portData - Port scan data
 * @param {Object} detailedScan - Detailed scan data
 * @returns {Array} Array of service objects
 */
function extractServices(portData, detailedScan) {
  const services = [];

  // Add services from port scan
  if (portData?.openPorts && Array.isArray(portData.openPorts)) {
    portData.openPorts.forEach((port) => {
      if (port && port.port) {
        services.push({
          name: port.service || `port-${port.port}`,
          displayName: `${port.service || "Unknown"} (${port.port}/${
            port.protocol || "tcp"
          })`,
          status: "running",
          port: parseInt(port.port),
        });
      }
    });
  }

  // Add Windows services
  if (detailedScan?.Services && Array.isArray(detailedScan.Services)) {
    detailedScan.Services.forEach((svc) => {
      // Avoid duplicates with port services
      if (svc && svc.Name && !services.some((s) => s.name === svc.Name)) {
        services.push({
          name: svc.Name,
          displayName: svc.DisplayName || svc.Name,
          status: "running",
        });
      }
    });
  }

  return services;
}

/**
 * Extract applications from scan results
 * @param {Object} detailedScan - Detailed scan data
 * @returns {Array} Array of application objects
 */
function extractApplications(detailedScan) {
  const applications = [];

  // Add Windows software
  if (detailedScan?.Software && Array.isArray(detailedScan.Software)) {
    detailedScan.Software.forEach((sw) => {
      if (sw && sw.DisplayName) {
        const installDate = sw.InstallDate
          ? new Date(sw.InstallDate).toISOString()
          : null;

        applications.push({
          name: sw.DisplayName,
          version: sw.DisplayVersion || "",
          publisher: sw.Publisher || "",
          installDate: installDate,
        });
      }
    });
  }

  return applications;
}

export {
  scanResultsToAsset,
  extractServices,
  extractApplications,
  calculateHealthScore,
};
