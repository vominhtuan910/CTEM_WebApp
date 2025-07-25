import fs from "fs";
import path from "path";
import prisma from "../../core/database/prisma.js";
import { PrismaClient } from "@prisma/client";
import { getSeverityLevel } from "../scanService/lynisScan.js";

/**
 * Parse scan results and extract vulnerability data
 * @param {Object} scanResults - Results from the scan service
 * @returns {Promise<Object>} Parsed results with vulnerabilities
 */
// This function parses scan results from various tools into a unified format
export async function parseScanResults(scanResults) {
  try {
    // Extract asset information (focused on OS info)
    const assetInfo = extractAssetInfo(scanResults);

    // Extract services information (from Nmap)
    const services = extractServices(scanResults);

    // Extract applications information
    const applications = extractApplications(scanResults);

    // Extract vulnerabilities
    const vulnerabilities = await extractVulnerabilities(scanResults);

    // Calculate health score
    const healthScore = calculateHealthScore(scanResults);

    return {
      assetInfo,
      services,
      applications,
      vulnerabilities,
      healthScore,
      scanData: scanResults, // Store original scan data for reference
    };
  } catch (error) {
    console.error("Error parsing scan results:", error.message);
    throw new Error(`Failed to parse scan results: ${error.message}`);
  }
}

// Extract basic asset information from scan results, focusing on OS info
function extractAssetInfo(scanResults) {
  try {
    // Initialize with default values, focusing only on basic and OS info
    const assetInfo = {
      hostname: "unknown",
      ipAddress: "127.0.0.1",
      status: "active",
      osName: "Unknown",
      osVersion: "",
      osArchitecture: "",
      osPlatform: "",
      osKernelVersion: "",
      osBuildNumber: "",
      lastBootTime: new Date().toISOString(),
    };

    // If we have direct fields in the unified format, use those
    if (scanResults.hostname) {
      assetInfo.hostname = scanResults.hostname;
    }

    if (scanResults.ipAddress) {
      assetInfo.ipAddress = scanResults.ipAddress;
    }

    if (scanResults.osName) {
      assetInfo.osName = scanResults.osName;
    }

    if (scanResults.osVersion) {
      assetInfo.osVersion = scanResults.osVersion;
    }

    if (scanResults.osArchitecture) {
      assetInfo.osArchitecture = scanResults.osArchitecture;
    }

    // If we have systemInfo, extract from there
    if (scanResults.systemInfo) {
      const systemInfo = scanResults.systemInfo;

      // Hostname
      if (systemInfo.hostname) {
        assetInfo.hostname = systemInfo.hostname;
      } else if (systemInfo.computerName) {
        assetInfo.hostname = systemInfo.computerName;
      }

      // IP Address - find the first non-internal IPv4 address
      if (systemInfo.primaryIp) {
        assetInfo.ipAddress = systemInfo.primaryIp;
      } else if (
        systemInfo.ipAddresses &&
        Array.isArray(systemInfo.ipAddresses)
      ) {
        const mainIp = systemInfo.ipAddresses.find(
          (ip) => ip.family === "IPv4" && !ip.internal
        );
        if (mainIp) {
          assetInfo.ipAddress = mainIp.address;
        }
      } else if (
        systemInfo.network &&
        systemInfo.network.interfaces &&
        Array.isArray(systemInfo.network.interfaces)
      ) {
        // Try to get from network.interfaces
        const mainIp = systemInfo.network.interfaces.find(
          (ip) => ip.family === "IPv4" && !ip.internal
        );
        if (mainIp) {
          assetInfo.ipAddress = mainIp.address;
        }
      }

      // OS Information
      if (systemInfo.osInfo) {
        // Handle nested osInfo object
        if (systemInfo.osInfo.name) {
          assetInfo.osName = systemInfo.osInfo.name;
        } else if (systemInfo.osInfo.fullName) {
          assetInfo.osName = systemInfo.osInfo.fullName;
        } else if (systemInfo.osInfo.Caption) {
          assetInfo.osName = systemInfo.osInfo.Caption;
        }

        if (systemInfo.osInfo.version) {
          assetInfo.osVersion = systemInfo.osInfo.version;
        } else if (systemInfo.osInfo.versionInfo) {
          assetInfo.osVersion = systemInfo.osInfo.versionInfo;
        } else if (systemInfo.osInfo.Version) {
          assetInfo.osVersion = systemInfo.osInfo.Version;
        }

        if (systemInfo.osInfo.arch) {
          assetInfo.osArchitecture = systemInfo.osInfo.arch;
        } else if (systemInfo.osInfo.osArchitecture) {
          assetInfo.osArchitecture = systemInfo.osInfo.osArchitecture;
        } else if (systemInfo.osInfo.OSArchitecture) {
          assetInfo.osArchitecture = systemInfo.osInfo.OSArchitecture;
        }

        // Additional OS information
        if (systemInfo.osInfo.platform) {
          assetInfo.osPlatform = systemInfo.osInfo.platform;
        }

        if (systemInfo.osInfo.kernelVersion) {
          assetInfo.osKernelVersion = systemInfo.osInfo.kernelVersion;
        }

        if (systemInfo.osInfo.buildNumber) {
          assetInfo.osBuildNumber = systemInfo.osInfo.buildNumber;
        }
      } else {
        // Fallback to direct properties
        if (systemInfo.osFullName) {
          assetInfo.osName = systemInfo.osFullName;
        } else if (systemInfo.platform) {
          assetInfo.osName =
            systemInfo.platform.charAt(0).toUpperCase() +
            systemInfo.platform.slice(1);
          // Also store platform as is
          assetInfo.osPlatform = systemInfo.platform;
        } else if (systemInfo.osName) {
          assetInfo.osName = systemInfo.osName;
        }

        if (systemInfo.osVersionFull) {
          assetInfo.osVersion = systemInfo.osVersionFull;
        } else if (systemInfo.release) {
          assetInfo.osVersion = systemInfo.release;
          // Also store as kernelVersion for Linux systems
          assetInfo.osKernelVersion = systemInfo.release;
        } else if (systemInfo.osVersion) {
          assetInfo.osVersion = systemInfo.osVersion;
        }

        if (systemInfo.buildNumber) {
          assetInfo.osBuildNumber = systemInfo.buildNumber;
        }

        if (systemInfo.arch) {
          assetInfo.osArchitecture = systemInfo.arch;
        } else if (systemInfo.osArchitecture) {
          assetInfo.osArchitecture = systemInfo.osArchitecture;
        }
      }

      // Last boot time
      if (systemInfo.uptime) {
        const bootTime = new Date();
        bootTime.setSeconds(bootTime.getSeconds() - systemInfo.uptime);
        assetInfo.lastBootTime = bootTime.toISOString();
      } else if (systemInfo.osInfo && systemInfo.osInfo.LastBootUpTime) {
        assetInfo.lastBootTime = new Date(
          systemInfo.osInfo.LastBootUpTime
        ).toISOString();
      }

      // Additional system properties from Windows PowerShell scan
      if (systemInfo.manufacturer) {
        assetInfo.manufacturer = systemInfo.manufacturer;
      }

      if (systemInfo.model) {
        assetInfo.model = systemInfo.model;
      }
    }

    return assetInfo;
  } catch (error) {
    console.error("Error extracting asset info:", error);
    return {
      hostname: "unknown",
      ipAddress: "127.0.0.1",
      status: "active",
      osName: "Unknown",
      osVersion: "",
      osArchitecture: "",
      lastBootTime: new Date().toISOString(),
    };
  }
}

/**
 * Extract service information from scan results
 * @param {Object} scanResults - Results from the scan service
 * @returns {Array} Array of services
 */
function extractServices(scanResults) {
  try {
    // If we already have services in the unified format, use those
    if (scanResults.services && Array.isArray(scanResults.services)) {
      return scanResults.services;
    }

    // If we have network.runningServices in the scan results
    if (
      scanResults.network &&
      scanResults.network.runningServices &&
      Array.isArray(scanResults.network.runningServices)
    ) {
      // Map to standard service format if necessary
      return scanResults.network.runningServices.map((service) => ({
        name: service.name,
        displayName: service.displayName || service.name,
        status: service.status || "running",
        startType: service.startType || "auto",
        pid: service.pid || null,
        port: service.port || null,
        protocol: service.protocol || null,
      }));
    }

    // If we have port scan data
    if (scanResults.portScan && scanResults.portScan.openPorts) {
      return scanResults.portScan.openPorts.map((port) => ({
        name: port.service || `port-${port.port}`,
        displayName: port.service
          ? `${port.service.charAt(0).toUpperCase()}${port.service.slice(1)}`
          : `Port ${port.port}`,
        status: port.state || "unknown",
        startType: "auto",
        port: port.port,
        protocol: port.protocol || "tcp",
      }));
    }

    // If we have systemInfo with running services
    if (scanResults.systemInfo && scanResults.systemInfo.services) {
      return scanResults.systemInfo.services;
    }

    // Default empty array
    return [];
  } catch (error) {
    console.error("Error extracting services:", error.message);
    return [];
  }
}

/**
 * Extract application information from scan results
 * @param {Object} scanResults - Results from the scan service
 * @returns {Array} Array of applications
 */
function extractApplications(scanResults) {
  try {
    // If we already have applications in the unified format, use those
    if (scanResults.applications && Array.isArray(scanResults.applications)) {
      return scanResults.applications;
    }

    // If we have systemInfo with applications
    if (scanResults.systemInfo && scanResults.systemInfo.applications) {
      return scanResults.systemInfo.applications;
    }

    // Default empty array
    return [];
  } catch (error) {
    console.error("Error extracting applications:", error.message);
    return [];
  }
}

/**
 * Extract vulnerabilities from scan results
 * @param {Object} scanResults - Results from the scan service
 * @returns {Promise<Array>} Array of vulnerabilities
 */
async function extractVulnerabilities(scanResults) {
  try {
    // If we already have vulnerabilities in the unified format, use those
    if (
      scanResults.vulnerabilities &&
      Array.isArray(scanResults.vulnerabilities)
    ) {
      return scanResults.vulnerabilities;
    }

    // If we have securityIssues
    if (
      scanResults.securityIssues &&
      Array.isArray(scanResults.securityIssues)
    ) {
      return scanResults.securityIssues.map((issue, index) => ({
        id: issue.id || `vuln-${index}`,
        name: issue.name || `Vulnerability ${index + 1}`,
        type: issue.type || "security",
        cvssScore: issue.cvssScore || calculateCvssFromSeverity(issue.severity),
        severityLevel: issue.severity || "Medium",
        discoveryDate: new Date().toISOString(),
        status: "Not_Fixed",
        description: issue.description || "No description provided",
        recommendations: issue.recommendation || "No recommendations provided",
        cveReferences: issue.cveId ? [issue.cveId] : [],
        affectedComponent: issue.affectedComponent || "",
      }));
    }

    // Default empty array
    return [];
  } catch (error) {
    console.error("Error extracting vulnerabilities:", error.message);
    return [];
  }
}

// Helper function to calculate CVSS from severity
function calculateCvssFromSeverity(severity) {
  switch (severity?.toLowerCase()) {
    case "critical":
      return 9.5;
    case "high":
      return 7.5;
    case "medium":
      return 5.0;
    case "low":
      return 3.0;
    default:
      return 5.0;
  }
}

// Calculate health score from scan results
function calculateHealthScore(scanResults) {
  try {
    // If we already have a health score in the unified format, use it
    if (scanResults.healthScore) {
      return scanResults.healthScore;
    }

    // Start with a perfect score
    let score = 100;

    // Deduct points for vulnerabilities
    if (
      scanResults.vulnerabilities &&
      Array.isArray(scanResults.vulnerabilities)
    ) {
      const criticalCount = scanResults.vulnerabilities.filter(
        (v) => v.severityLevel === "Critical"
      ).length;
      const highCount = scanResults.vulnerabilities.filter(
        (v) => v.severityLevel === "High"
      ).length;
      const mediumCount = scanResults.vulnerabilities.filter(
        (v) => v.severityLevel === "Medium"
      ).length;
      const lowCount = scanResults.vulnerabilities.filter(
        (v) => v.severityLevel === "Low"
      ).length;

      // Deduct points based on severity
      score -= criticalCount * 10;
      score -= highCount * 5;
      score -= mediumCount * 2;
      score -= lowCount * 0.5;
    }

    // Deduct points for security issues
    if (
      scanResults.securityIssues &&
      Array.isArray(scanResults.securityIssues)
    ) {
      const criticalCount = scanResults.securityIssues.filter(
        (v) => v.severity === "Critical"
      ).length;
      const highCount = scanResults.securityIssues.filter(
        (v) => v.severity === "High"
      ).length;
      const mediumCount = scanResults.securityIssues.filter(
        (v) => v.severity === "Medium"
      ).length;
      const lowCount = scanResults.securityIssues.filter(
        (v) => v.severity === "Low"
      ).length;

      // Deduct points based on severity
      score -= criticalCount * 10;
      score -= highCount * 5;
      score -= mediumCount * 2;
      score -= lowCount * 0.5;
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  } catch (error) {
    console.error("Error calculating health score:", error);
    return 75; // Default health score
  }
}

/**
 * Save parsed scan results to database
 * @param {Object} parsedResults - Parsed scan results
 * @param {string} assetId - Asset ID (optional, if updating an existing asset)
 * @returns {Promise<Object>} Saved asset with vulnerabilities
 */
export async function saveScanResults(parsedResults, assetId = null) {
  try {
    const prisma = getPrismaClient();

    // Extract asset information
    const assetInfo = parsedResults.assetInfo;
    const services = parsedResults.services || [];
    const applications = parsedResults.applications || [];
    const vulnerabilities = parsedResults.vulnerabilities || [];
    const healthScore = parsedResults.healthScore || 100;

    // Prepare asset data (focusing on OS information)
    const assetData = {
      hostname: assetInfo.hostname,
      ipAddress: assetInfo.ipAddress,
      ipAddresses: assetInfo.ipAddresses || [assetInfo.ipAddress],
      status: "active",
      lastScan: new Date(),
      healthScore,
      // OS details
      osName: assetInfo.osName,
      osVersion: assetInfo.osVersion,
      osArchitecture: assetInfo.osArchitecture,
      osBuildNumber: assetInfo.osBuildNumber,
      osPlatform: assetInfo.osPlatform,
      osKernelVersion: assetInfo.osKernelVersion,
      osLastBootTime: assetInfo.lastBootTime
        ? new Date(assetInfo.lastBootTime)
        : null,
    };

    let asset;

    // If assetId is provided, update existing asset
    if (assetId) {
      // Check if asset exists
      const existingAsset = await prisma.asset.findUnique({
        where: { id: assetId },
      });

      if (!existingAsset) {
        throw new Error(`Asset with ID ${assetId} not found`);
      }

      // Update the asset
      asset = await prisma.asset.update({
        where: { id: assetId },
        data: assetData,
      });

      // Delete existing services and applications
      await prisma.service.deleteMany({
        where: { assetId },
      });

      await prisma.application.deleteMany({
        where: { assetId },
      });
    } else {
      // Create new asset
      asset = await prisma.asset.create({
        data: assetData,
      });
    }

    // Add services
    if (services.length > 0) {
      await Promise.all(
        services.map((service) =>
          prisma.service.create({
            data: {
              name: service.name,
              displayName: service.displayName || service.name,
              status: service.status || "unknown",
              port: service.port ? parseInt(service.port) : null,
              protocol: service.protocol || null,
              version: service.version || null,
              description: service.description || null,
              asset: { connect: { id: asset.id } },
            },
          })
        )
      );
    }

    // Add applications
    if (applications.length > 0) {
      await Promise.all(
        applications.map((app) =>
          prisma.application.create({
            data: {
              name: app.name,
              version: app.version || null,
              publisher: app.publisher || null,
              installDate: app.installDate ? new Date(app.installDate) : null,
              type: app.type || null,
              description: app.description || null,
              path: app.path || null,
              asset: { connect: { id: asset.id } },
            },
          })
        )
      );
    }

    // Add vulnerabilities
    if (vulnerabilities.length > 0) {
      for (const vuln of vulnerabilities) {
        // Check if vulnerability already exists
        const existingVuln = await prisma.vulnerability.findFirst({
          where: {
            name: vuln.name,
            type: vuln.type || "unknown",
          },
        });

        let vulnerability;

        if (existingVuln) {
          vulnerability = existingVuln;
        } else {
          // Create new vulnerability
          vulnerability = await prisma.vulnerability.create({
            data: {
              name: vuln.name,
              type: vuln.type || "unknown",
              cvssScore: vuln.cvssScore || 5.0,
              severityLevel: vuln.severityLevel || "Medium",
              discoveryDate: vuln.discoveryDate
                ? new Date(vuln.discoveryDate)
                : new Date(),
              status: vuln.status || "Not_Fixed",
              description: vuln.description || "",
              recommendations: vuln.recommendations || "",
              cveReferences: vuln.cveReferences || [],
              vector: vuln.vector || null,
              exploitAvailable: vuln.exploitAvailable || false,
              patchAvailable: vuln.patchAvailable || false,
            },
          });
        }

        // Link vulnerability to asset
        await prisma.assetVulnerability.create({
          data: {
            assetId: asset.id,
            vulnerabilityId: vulnerability.id,
          },
        });
      }
    }

    // Return the asset with services and applications
    return await prisma.asset.findUnique({
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
  } catch (error) {
    console.error("Error saving scan results to database:", error.message);
    throw error;
  }
}

// Helper function to get Prisma client
function getPrismaClient() {
  try {
    return new PrismaClient();
  } catch (error) {
    console.error("Error creating Prisma client:", error.message);
    throw error;
  }
}

export {
  extractAssetInfo,
  extractServices,
  extractApplications,
  extractVulnerabilities,
  calculateHealthScore,
};
