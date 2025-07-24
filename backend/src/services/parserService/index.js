import fs from "fs";
import path from "path";
import prisma from "../../core/database/prisma.js";

import { extractWindowsVulnerabilities } from "../scanService/windowsScan.js";
import { getSeverityLevel } from "../scanService/lynisScan.js";

/**
 * Parse scan results and extract vulnerability data
 * @param {Object} scanResults - Results from the scan service
 * @returns {Promise<Object>} Parsed results with vulnerabilities
 */
async function parseScanResults(scanResults) {
  try {
    const parsedResults = {
      timestamp: scanResults.timestamp || new Date(),
      assetInfo: extractAssetInfo(scanResults),
      services: extractServices(scanResults),
      applications: extractApplications(scanResults),
      vulnerabilities: await extractVulnerabilities(scanResults),
      healthScore: calculateHealthScore(scanResults),
    };

    return parsedResults;
  } catch (error) {
    console.error("Error parsing scan results:", error);
    throw error;
  }
}

/**
 * Extract asset information from scan results
 * @param {Object} scanResults - Results from the scan service
 * @returns {Object} Asset information
 */
function extractAssetInfo(scanResults) {
  const systemInfo = scanResults.systemInfo || {};
  const osInfo = (scanResults.nmapScan && scanResults.nmapScan.osInfo) || {};
  const powerShellInfo =
    (scanResults.powerShellScan && scanResults.powerShellScan.OSInfo) || {};

  // Find the primary IP address (non-loopback)
  let primaryIp = "127.0.0.1";
  const ipAddresses = [];

  if (systemInfo.ipAddresses && Array.isArray(systemInfo.ipAddresses)) {
    // Extract all IP addresses
    systemInfo.ipAddresses.forEach((ip) => {
      if (typeof ip === "object" && ip.address) {
        ipAddresses.push(ip.address);

        // Find a suitable primary IP (non-loopback, IPv4)
        if (
          ip.address !== "127.0.0.1" &&
          !ip.address.startsWith("169.254.") &&
          !ip.address.startsWith("::1") &&
          !ip.internal &&
          ip.family === "IPv4"
        ) {
          primaryIp = ip.address;
        }
      }
    });
  }

  // Determine OS information from available sources
  let osName, osVersion, osArch;

  // Try Windows PowerShell data first (most detailed)
  if (powerShellInfo.Caption) {
    osName = powerShellInfo.Caption;
    osVersion = powerShellInfo.Version;
    osArch = powerShellInfo.OSArchitecture;
  }
  // Try nmap OS detection
  else if (osInfo.name) {
    osName = osInfo.name;
    // Try to extract version from OS name
    const versionMatch = osName.match(/(\d+\.\d+)/);
    if (versionMatch) {
      osVersion = versionMatch[0];
    }
  }
  // Fall back to Node.js os info
  else {
    osName = systemInfo.type || systemInfo.platform;
    osVersion = systemInfo.release;
    osArch = systemInfo.arch;
  }

  return {
    hostname: systemInfo.hostname || "unknown-host",
    name: systemInfo.hostname || "Unknown Host",
    ipAddress: primaryIp,
    ipAddresses,
    osName,
    osVersion,
    osArchitecture: osArch,
    osBuildNumber: powerShellInfo.BuildNumber || null,
    osLastBootTime: powerShellInfo.LastBootUpTime
      ? new Date(powerShellInfo.LastBootUpTime)
      : null,
    systemModel: systemInfo.systemModel || null,
    systemManufacturer: systemInfo.systemManufacturer || null,
  };
}

/**
 * Extract service information from scan results
 * @param {Object} scanResults - Results from the scan service
 * @returns {Array} Array of services
 */
function extractServices(scanResults) {
  const services = [];

  // Extract services from nmap scan
  if (scanResults.nmapScan && scanResults.nmapScan.openPorts) {
    scanResults.nmapScan.openPorts.forEach((port) => {
      if (port && port.port) {
        services.push({
          name: port.service || `port-${port.port}`,
          displayName: `${port.service || "Unknown"} (${port.port}/${
            port.protocol || "tcp"
          })`,
          status: "running",
          port: parseInt(port.port),
          protocol: port.protocol || "tcp",
          version: port.version || null,
          description: null,
        });
      }
    });
  }

  // Add Windows services from PowerShell scan
  if (scanResults.powerShellScan && scanResults.powerShellScan.Services) {
    scanResults.powerShellScan.Services.forEach((svc) => {
      if (svc && svc.Name) {
        // Check if service already added from nmap
        const existingService = services.find((s) => s.name === svc.Name);
        if (!existingService) {
          services.push({
            name: svc.Name,
            displayName: svc.DisplayName || svc.Name,
            status: "running",
            port: null,
            protocol: null,
            version: null,
            description: null,
          });
        }
      }
    });
  }

  return services;
}

/**
 * Extract application information from scan results
 * @param {Object} scanResults - Results from the scan service
 * @returns {Array} Array of applications
 */
function extractApplications(scanResults) {
  const applications = [];

  // Extract Windows applications from PowerShell scan
  if (scanResults.powerShellScan && scanResults.powerShellScan.Software) {
    scanResults.powerShellScan.Software.forEach((sw) => {
      if (sw && sw.DisplayName) {
        applications.push({
          name: sw.DisplayName,
          version: sw.DisplayVersion || null,
          publisher: sw.Publisher || null,
          installDate: sw.InstallDate ? new Date(sw.InstallDate) : null,
          type: null,
          description: null,
          path: null,
        });
      }
    });
  }

  return applications;
}

/**
 * Extract vulnerabilities from scan results
 * @param {Object} scanResults - Results from the scan service
 * @returns {Promise<Array>} Array of vulnerabilities
 */
async function extractVulnerabilities(scanResults) {
  const vulnerabilities = [];
  const now = new Date();

  // Process Lynis security warnings
  if (scanResults.lynisScan && scanResults.lynisScan.securityWarnings) {
    scanResults.lynisScan.securityWarnings.forEach((warning) => {
      vulnerabilities.push({
        name: warning.substring(0, 100),
        type: "configuration",
        cvssScore: 5.0, // Medium severity by default
        severityLevel: getSeverityLevel(warning),
        discoveryDate: now,
        status: "Not_Fixed",
        description: warning,
        recommendations: "Follow system hardening best practices",
        cveReferences: [],
        vector: null,
        exploitAvailable: false,
        patchAvailable: true,
      });
    });
  }

  // Process Lynis suggestions
  if (scanResults.lynisScan && scanResults.lynisScan.suggestions) {
    scanResults.lynisScan.suggestions.forEach((suggestion) => {
      // Only add if it seems security-related
      if (
        suggestion.toLowerCase().includes("security") ||
        suggestion.toLowerCase().includes("vulnerab") ||
        suggestion.toLowerCase().includes("protect") ||
        suggestion.toLowerCase().includes("risk") ||
        suggestion.toLowerCase().includes("attack")
      ) {
        vulnerabilities.push({
          name: suggestion.substring(0, 100),
          type: "configuration",
          cvssScore: 3.0, // Low severity by default
          severityLevel: "Low",
          discoveryDate: now,
          status: "Not_Fixed",
          description: suggestion,
          recommendations: suggestion,
          cveReferences: [],
          vector: null,
          exploitAvailable: false,
          patchAvailable: true,
        });
      }
    });
  }

  // Process Windows-specific vulnerabilities
  if (scanResults.powerShellScan) {
    const windowsVulns = extractWindowsVulnerabilities(
      scanResults.powerShellScan
    );

    windowsVulns.forEach((vuln) => {
      let cvssScore = 3.0;

      switch (vuln.severity) {
        case "Critical":
          cvssScore = 9.0;
          break;
        case "High":
          cvssScore = 7.0;
          break;
        case "Medium":
          cvssScore = 5.0;
          break;
        case "Low":
          cvssScore = 3.0;
          break;
      }

      vulnerabilities.push({
        name: vuln.name,
        type: vuln.type,
        cvssScore,
        severityLevel: vuln.severity,
        discoveryDate: now,
        status: "Not_Fixed",
        description: vuln.description,
        recommendations: vuln.recommendation,
        cveReferences: [],
        vector: null,
        exploitAvailable: false,
        patchAvailable: true,
      });
    });
  }

  // Add any network-based vulnerabilities
  if (scanResults.nmapScan && scanResults.nmapScan.openPorts) {
    // Check for commonly vulnerable services
    const vulnerableServices = {
      telnet: {
        score: 7.5,
        severity: "High",
        desc: "Telnet uses unencrypted communications",
      },
      ftp: {
        score: 5.0,
        severity: "Medium",
        desc: "FTP may allow anonymous access or uses unencrypted communications",
      },
      rsh: {
        score: 8.0,
        severity: "High",
        desc: "Remote shell protocol has weak authentication",
      },
      rlogin: {
        score: 8.0,
        severity: "High",
        desc: "Remote login protocol has weak authentication",
      },
      rexec: {
        score: 8.0,
        severity: "High",
        desc: "Remote execution protocol has weak authentication",
      },
      tftp: {
        score: 5.0,
        severity: "Medium",
        desc: "Trivial FTP has no authentication",
      },
      finger: {
        score: 5.0,
        severity: "Medium",
        desc: "Finger protocol can leak user information",
      },
      http: {
        score: 4.0,
        severity: "Medium",
        desc: "HTTP service without TLS encryption",
      },
      postgresql: {
        score: 4.0,
        severity: "Medium",
        desc: "PostgreSQL database potentially exposed to network",
      },
      mysql: {
        score: 4.0,
        severity: "Medium",
        desc: "MySQL database potentially exposed to network",
      },
      "microsoft-ds": {
        score: 5.0,
        severity: "Medium",
        desc: "SMB file sharing service potentially exposed",
      },
    };

    scanResults.nmapScan.openPorts.forEach((port) => {
      if (port.service && vulnerableServices[port.service]) {
        const vulnInfo = vulnerableServices[port.service];

        vulnerabilities.push({
          name: `Exposed ${port.service} service on port ${port.port}`,
          type: "network",
          cvssScore: vulnInfo.score,
          severityLevel: vulnInfo.severity,
          discoveryDate: now,
          status: "Not_Fixed",
          description: `${vulnInfo.desc} on port ${port.port}/${
            port.protocol || "tcp"
          }`,
          recommendations: `Consider disabling or restricting access to the ${port.service} service`,
          cveReferences: [],
          vector: `NETWORK:${port.port}/${port.protocol || "tcp"}`,
          exploitAvailable: false,
          patchAvailable: true,
        });
      }
    });
  }

  // Deduplicate vulnerabilities
  const uniqueVulns = [];
  const seenVulns = new Set();

  vulnerabilities.forEach((vuln) => {
    const vulnKey = `${vuln.name}-${vuln.type}-${vuln.description.substring(
      0,
      50
    )}`;
    if (!seenVulns.has(vulnKey)) {
      seenVulns.add(vulnKey);
      uniqueVulns.push(vuln);
    }
  });

  return uniqueVulns;
}

/**
 * Calculate health score based on scan results
 * @param {Object} scanResults - Results from the scan service
 * @returns {number} Health score (0-100)
 */
function calculateHealthScore(scanResults) {
  // Start with a base score
  let score = 75;

  // Adjust based on Lynis hardening index if available
  if (
    scanResults.lynisScan &&
    scanResults.lynisScan.hardening &&
    scanResults.lynisScan.hardening.index !== undefined
  ) {
    // Blend our score with Lynis hardening index
    score = (score + scanResults.lynisScan.hardening.index) / 2;
  }

  // Penalize for open ports
  if (scanResults.nmapScan && scanResults.nmapScan.openPorts) {
    const openPorts = scanResults.nmapScan.openPorts.length;
    if (openPorts > 10) score -= 5;
    if (openPorts > 20) score -= 5;

    // Check for high-risk ports
    const highRiskPorts = [21, 23, 25, 445, 1433, 3306, 3389, 5432];
    const openPortNumbers = scanResults.nmapScan.openPorts.map((p) => p.port);
    const openHighRiskPorts = highRiskPorts.filter((port) =>
      openPortNumbers.includes(port)
    );
    score -= openHighRiskPorts.length * 3;
  }

  // Penalize for Windows firewall issues
  if (
    scanResults.powerShellScan &&
    scanResults.powerShellScan.FirewallProfiles
  ) {
    const disabledFirewalls =
      scanResults.powerShellScan.FirewallProfiles.filter(
        (p) => !p.Enabled
      ).length;
    score -= disabledFirewalls * 10;
  }

  // Penalize for Lynis warnings
  if (scanResults.lynisScan && scanResults.lynisScan.securityWarnings) {
    score -= Math.min(scanResults.lynisScan.securityWarnings.length * 2, 20);
  }

  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Save parsed scan results to the database
 * @param {Object} parsedResults - Parsed scan results
 * @param {string} assetId - Asset ID (optional, if updating an existing asset)
 * @returns {Promise<Object>} Saved asset with vulnerabilities
 */
async function saveScanResults(parsedResults, assetId = null) {
  try {
    const assetInfo = parsedResults.assetInfo;
    const services = parsedResults.services;
    const applications = parsedResults.applications;
    const vulnerabilities = parsedResults.vulnerabilities;
    const healthScore = parsedResults.healthScore;

    // Generate labels based on OS and services
    const labels = [];

    // OS-based labels
    if (assetInfo.osName) {
      const osNameLower = assetInfo.osName.toLowerCase();
      if (osNameLower.includes("windows")) labels.push("windows");
      if (osNameLower.includes("linux")) labels.push("linux");
      if (osNameLower.includes("ubuntu")) labels.push("ubuntu");
      if (osNameLower.includes("centos")) labels.push("centos");
      if (osNameLower.includes("debian")) labels.push("debian");
      if (osNameLower.includes("mac") || osNameLower.includes("darwin"))
        labels.push("macos");
    }

    // Service-based labels
    const serviceTypes = services.map((s) => s.name.toLowerCase());
    if (serviceTypes.some((s) => s.includes("http") || s.includes("web")))
      labels.push("web-server");
    if (serviceTypes.includes("ssh")) labels.push("ssh");
    if (serviceTypes.includes("ftp")) labels.push("ftp");
    if (serviceTypes.some((s) => s.includes("smtp") || s.includes("mail")))
      labels.push("mail-server");
    if (serviceTypes.includes("mysql")) labels.push("mysql");
    if (serviceTypes.includes("postgresql")) labels.push("postgresql");
    if (serviceTypes.includes("rdp") || serviceTypes.includes("ms-wbt-server"))
      labels.push("rdp");

    let asset;

    // Check if we're updating an existing asset or creating a new one
    if (assetId) {
      // Update existing asset
      asset = await prisma.asset.update({
        where: { id: assetId },
        data: {
          hostname: assetInfo.hostname,
          name: assetInfo.name,
          ipAddress: assetInfo.ipAddress,
          ipAddresses: assetInfo.ipAddresses,
          lastScan: new Date(),
          healthScore: healthScore,
          issuesCount: vulnerabilities.length,
          labels: [...new Set([...labels])],
          osName: assetInfo.osName,
          osVersion: assetInfo.osVersion,
          osArchitecture: assetInfo.osArchitecture,
          osBuildNumber: assetInfo.osBuildNumber,
          osLastBootTime: assetInfo.osLastBootTime,
        },
      });

      // Delete existing services and applications
      await prisma.service.deleteMany({ where: { assetId } });
      await prisma.application.deleteMany({ where: { assetId } });
    } else {
      // Create new asset
      asset = await prisma.asset.create({
        data: {
          hostname: assetInfo.hostname,
          name: assetInfo.name,
          ipAddress: assetInfo.ipAddress,
          ipAddresses: assetInfo.ipAddresses,
          status: "active",
          lastScan: new Date(),
          healthScore: healthScore,
          issuesCount: vulnerabilities.length,
          labels,
          agentStatus: "not_installed",
          osName: assetInfo.osName,
          osVersion: assetInfo.osVersion,
          osArchitecture: assetInfo.osArchitecture,
          osBuildNumber: assetInfo.osBuildNumber,
          osLastBootTime: assetInfo.osLastBootTime,
          confidentiality: 1,
          integrity: 1,
          availability: 1,
        },
      });
    }

    // Create services
    if (services.length > 0) {
      await Promise.all(
        services.map((service) =>
          prisma.service.create({
            data: {
              ...service,
              assetId: asset.id,
            },
          })
        )
      );
    }

    // Create applications
    if (applications.length > 0) {
      await Promise.all(
        applications.map((app) =>
          prisma.application.create({
            data: {
              ...app,
              assetId: asset.id,
            },
          })
        )
      );
    }

    // Create vulnerabilities and link them to the asset
    if (vulnerabilities.length > 0) {
      for (const vuln of vulnerabilities) {
        // Create the vulnerability
        const createdVuln = await prisma.vulnerability.create({
          data: {
            name: vuln.name,
            type: vuln.type,
            cvssScore: vuln.cvssScore,
            severityLevel: vuln.severityLevel,
            discoveryDate: vuln.discoveryDate,
            status: vuln.status,
            description: vuln.description,
            recommendations: vuln.recommendations,
            cveReferences: vuln.cveReferences,
            vector: vuln.vector,
            exploitAvailable: vuln.exploitAvailable,
            patchAvailable: vuln.patchAvailable,
          },
        });

        // Link vulnerability to asset
        await prisma.assetVulnerability.create({
          data: {
            assetId: asset.id,
            vulnerabilityId: createdVuln.id,
          },
        });
      }
    }

    // Return the complete asset with all relations
    const completeAsset = await prisma.asset.findUnique({
      where: { id: asset.id },
      include: {
        services: true,
        applications: true,
        vulnerabilities: {
          include: {
            vulnerability: true,
          },
        },
      },
    });

    return completeAsset;
  } catch (error) {
    console.error("Error saving scan results to database:", error);
    throw error;
  }
}

export {
  parseScanResults,
  extractAssetInfo,
  extractServices,
  extractApplications,
  extractVulnerabilities,
  calculateHealthScore,
  saveScanResults,
};
