import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../../core/database/prisma.js";

// Optional: If using PDF generation libraries
// import PDFDocument from 'pdfkit';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a JSON report
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Report data and file path
 */
async function generateJsonReport(options) {
  try {
    const {
      assetId,
      vulnerabilityId,
      includeScans = true,
      outputDir,
    } = options;

    // Create reports directory if it doesn't exist
    const reportsDir =
      outputDir || path.join(__dirname, "..", "..", "..", "output", "reports");
    fs.mkdirSync(reportsDir, { recursive: true });

    // Generate timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    let reportData = {};
    let reportType = "";
    let filename = "";

    // Generate report based on asset or vulnerability
    if (assetId) {
      reportType = "asset";
      filename = `asset_report_${assetId.substring(0, 8)}_${timestamp}.json`;

      // Get asset with related data
      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
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

      if (!asset) {
        throw new Error(`Asset with ID ${assetId} not found`);
      }

      // Format vulnerabilities
      const vulnerabilities = asset.vulnerabilities.map((av) => ({
        id: av.vulnerability.id,
        name: av.vulnerability.name,
        type: av.vulnerability.type,
        cvssScore: av.vulnerability.cvssScore,
        severityLevel: av.vulnerability.severityLevel,
        discoveryDate: av.vulnerability.discoveryDate,
        status: av.vulnerability.status,
        description: av.vulnerability.description,
        recommendations: av.vulnerability.recommendations,
        cveReferences: av.vulnerability.cveReferences,
        vector: av.vulnerability.vector,
        exploitAvailable: av.vulnerability.exploitAvailable,
        patchAvailable: av.vulnerability.patchAvailable,
        assignedTo: av.vulnerability.assignedTo,
        lastUpdated: av.vulnerability.lastUpdated,
      }));

      // Build report data
      reportData = {
        timestamp: new Date(),
        reportType: "Asset Vulnerability Report",
        asset: {
          id: asset.id,
          hostname: asset.hostname,
          name: asset.name,
          ipAddress: asset.ipAddress,
          osInfo: {
            name: asset.osName,
            version: asset.osVersion,
            architecture: asset.osArchitecture,
            buildNumber: asset.osBuildNumber,
          },
          healthScore: asset.healthScore,
          lastScan: asset.lastScan,
          services: asset.services,
          applications: asset.applications,
        },
        vulnerabilities: vulnerabilities,
        summary: {
          total: vulnerabilities.length,
          critical: vulnerabilities.filter(
            (v) => v.severityLevel === "Critical"
          ).length,
          high: vulnerabilities.filter((v) => v.severityLevel === "High")
            .length,
          medium: vulnerabilities.filter((v) => v.severityLevel === "Medium")
            .length,
          low: vulnerabilities.filter((v) => v.severityLevel === "Low").length,
          fixed: vulnerabilities.filter((v) => v.status === "Fixed").length,
          inProgress: vulnerabilities.filter((v) => v.status === "In_Progress")
            .length,
          notFixed: vulnerabilities.filter((v) => v.status === "Not_Fixed")
            .length,
        },
      };
    } else if (vulnerabilityId) {
      reportType = "vulnerability";
      filename = `vulnerability_report_${vulnerabilityId.substring(
        0,
        8
      )}_${timestamp}.json`;

      // Get vulnerability with affected assets
      const vulnerability = await prisma.vulnerability.findUnique({
        where: { id: vulnerabilityId },
        include: {
          assets: {
            include: {
              asset: true,
            },
          },
          applications: {
            include: {
              application: true,
            },
          },
        },
      });

      if (!vulnerability) {
        throw new Error(`Vulnerability with ID ${vulnerabilityId} not found`);
      }

      // Format affected assets
      const affectedAssets = vulnerability.assets.map((av) => ({
        id: av.asset.id,
        hostname: av.asset.hostname,
        name: av.asset.name,
        ipAddress: av.asset.ipAddress,
        osName: av.asset.osName,
        osVersion: av.asset.osVersion,
      }));

      // Format affected applications
      const affectedApplications = vulnerability.applications.map((apv) => ({
        id: apv.application.id,
        name: apv.application.name,
        version: apv.application.version,
        publisher: apv.application.publisher,
      }));

      // Build report data
      reportData = {
        timestamp: new Date(),
        reportType: "Vulnerability Report",
        vulnerability: {
          id: vulnerability.id,
          name: vulnerability.name,
          type: vulnerability.type,
          cvssScore: vulnerability.cvssScore,
          severityLevel: vulnerability.severityLevel,
          discoveryDate: vulnerability.discoveryDate,
          status: vulnerability.status,
          description: vulnerability.description,
          recommendations: vulnerability.recommendations,
          cveReferences: vulnerability.cveReferences,
          vector: vulnerability.vector,
          exploitAvailable: vulnerability.exploitAvailable,
          patchAvailable: vulnerability.patchAvailable,
          assignedTo: vulnerability.assignedTo,
          lastUpdated: vulnerability.lastUpdated,
          defectDojoId: vulnerability.defectDojoId,
          defectDojoUrl: vulnerability.defectDojoUrl,
        },
        affectedAssets,
        affectedApplications,
        summary: {
          totalAssets: affectedAssets.length,
          totalApplications: affectedApplications.length,
        },
      };
    } else {
      // Generate summary report of all assets and vulnerabilities
      reportType = "summary";
      filename = `summary_report_${timestamp}.json`;

      // Get all assets with vulnerabilities count
      const assets = await prisma.asset.findMany({
        select: {
          id: true,
          hostname: true,
          name: true,
          ipAddress: true,
          osName: true,
          osVersion: true,
          healthScore: true,
          lastScan: true,
          _count: {
            select: { vulnerabilities: true },
          },
        },
      });

      // Get vulnerability statistics
      const vulnerabilityStats = await prisma.vulnerability.groupBy({
        by: ["severityLevel", "status"],
        _count: {
          id: true,
        },
      });

      // Format vulnerability statistics
      const vulnSummary = {
        total: 0,
        bySeverity: {
          Critical: 0,
          High: 0,
          Medium: 0,
          Low: 0,
        },
        byStatus: {
          Fixed: 0,
          In_Progress: 0,
          Not_Fixed: 0,
        },
      };

      vulnerabilityStats.forEach((stat) => {
        vulnSummary.total += stat._count.id;

        // Add to severity count
        if (stat.severityLevel in vulnSummary.bySeverity) {
          vulnSummary.bySeverity[stat.severityLevel] += stat._count.id;
        }

        // Add to status count
        if (stat.status in vulnSummary.byStatus) {
          vulnSummary.byStatus[stat.status] += stat._count.id;
        }
      });

      // Build report data
      reportData = {
        timestamp: new Date(),
        reportType: "Summary Report",
        assets: assets.map((asset) => ({
          id: asset.id,
          hostname: asset.hostname,
          name: asset.name,
          ipAddress: asset.ipAddress,
          osName: asset.osName,
          osVersion: asset.osVersion,
          healthScore: asset.healthScore,
          lastScan: asset.lastScan,
          vulnerabilitiesCount: asset._count.vulnerabilities,
        })),
        vulnerabilitySummary: vulnSummary,
        assetSummary: {
          total: assets.length,
          withVulnerabilities: assets.filter(
            (a) => a._count.vulnerabilities > 0
          ).length,
        },
      };
    }

    // Include scan data if requested
    if (includeScans && assetId) {
      // Add scan data (placeholder - implement based on where scan data is stored)
      reportData.scans = {
        // This would be populated with actual scan data
        message: "Scan data would be included here",
      };
    }

    // Write to file
    const filePath = path.join(reportsDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));

    return {
      success: true,
      reportType,
      filePath,
      fileName: filename,
      data: reportData,
    };
  } catch (error) {
    console.error("Error generating JSON report:", error);
    throw error;
  }
}

/**
 * Generate a Markdown report
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Report data and file path
 */
async function generateMarkdownReport(options) {
  try {
    // First generate the JSON data
    const jsonReport = await generateJsonReport(options);
    const { assetId, vulnerabilityId, outputDir } = options;

    // Create reports directory if it doesn't exist
    const reportsDir =
      outputDir || path.join(__dirname, "..", "..", "..", "output", "reports");
    fs.mkdirSync(reportsDir, { recursive: true });

    // Generate timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    let markdown = "";
    let filename = "";

    if (jsonReport.reportType === "asset") {
      filename = `asset_report_${assetId.substring(0, 8)}_${timestamp}.md`;

      // Build Markdown for asset report
      const asset = jsonReport.data.asset;
      const vulns = jsonReport.data.vulnerabilities;
      const summary = jsonReport.data.summary;

      markdown = `# Asset Vulnerability Report: ${asset.name}\n\n`;
      markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;

      markdown += `## Asset Information\n\n`;
      markdown += `- **Hostname:** ${asset.hostname}\n`;
      markdown += `- **IP Address:** ${asset.ipAddress}\n`;
      markdown += `- **OS:** ${asset.osInfo.name || "Unknown"} ${
        asset.osInfo.version || ""
      }\n`;
      markdown += `- **Architecture:** ${
        asset.osInfo.architecture || "Unknown"
      }\n`;
      markdown += `- **Health Score:** ${asset.healthScore || "N/A"}\n`;
      markdown += `- **Last Scan:** ${
        asset.lastScan ? new Date(asset.lastScan).toLocaleString() : "Never"
      }\n\n`;

      markdown += `## Vulnerability Summary\n\n`;
      markdown += `- **Total Vulnerabilities:** ${summary.total}\n`;
      markdown += `- **Critical:** ${summary.critical}\n`;
      markdown += `- **High:** ${summary.high}\n`;
      markdown += `- **Medium:** ${summary.medium}\n`;
      markdown += `- **Low:** ${summary.low}\n\n`;
      markdown += `- **Fixed:** ${summary.fixed}\n`;
      markdown += `- **In Progress:** ${summary.inProgress}\n`;
      markdown += `- **Not Fixed:** ${summary.notFixed}\n\n`;

      if (asset.services && asset.services.length > 0) {
        markdown += `## Services (${asset.services.length})\n\n`;
        markdown += `| Name | Port | Protocol | Version |\n`;
        markdown += `|------|------|----------|--------|\n`;

        asset.services.forEach((service) => {
          markdown += `| ${service.name} | ${service.port || "N/A"} | ${
            service.protocol || "N/A"
          } | ${service.version || "N/A"} |\n`;
        });

        markdown += `\n`;
      }

      if (asset.applications && asset.applications.length > 0) {
        markdown += `## Applications (${asset.applications.length})\n\n`;
        markdown += `| Name | Version | Publisher |\n`;
        markdown += `|------|---------|----------|\n`;

        asset.applications.forEach((app) => {
          markdown += `| ${app.name} | ${app.version || "N/A"} | ${
            app.publisher || "N/A"
          } |\n`;
        });

        markdown += `\n`;
      }

      if (vulns && vulns.length > 0) {
        markdown += `## Vulnerabilities (${vulns.length})\n\n`;

        // Group by severity
        const severityOrder = ["Critical", "High", "Medium", "Low"];

        for (const severity of severityOrder) {
          const severityVulns = vulns.filter(
            (v) => v.severityLevel === severity
          );

          if (severityVulns.length > 0) {
            markdown += `### ${severity} Severity (${severityVulns.length})\n\n`;

            severityVulns.forEach((vuln, index) => {
              markdown += `#### ${index + 1}. ${vuln.name}\n\n`;
              markdown += `- **Type:** ${vuln.type}\n`;
              markdown += `- **CVSS Score:** ${vuln.cvssScore}\n`;
              markdown += `- **Status:** ${vuln.status.replace("_", " ")}\n`;
              markdown += `- **Discovery Date:** ${new Date(
                vuln.discoveryDate
              ).toLocaleDateString()}\n`;

              if (vuln.assignedTo) {
                markdown += `- **Assigned To:** ${vuln.assignedTo}\n`;
              }

              markdown += `\n**Description:**\n\n${vuln.description}\n\n`;

              if (vuln.recommendations) {
                markdown += `**Recommendations:**\n\n${vuln.recommendations}\n\n`;
              }

              if (vuln.cveReferences && vuln.cveReferences.length > 0) {
                markdown += `**CVE References:** ${vuln.cveReferences.join(
                  ", "
                )}\n\n`;
              }

              markdown += `---\n\n`;
            });
          }
        }
      }
    } else if (jsonReport.reportType === "vulnerability") {
      filename = `vulnerability_report_${vulnerabilityId.substring(
        0,
        8
      )}_${timestamp}.md`;

      // Build Markdown for vulnerability report
      const vuln = jsonReport.data.vulnerability;
      const assets = jsonReport.data.affectedAssets;
      const apps = jsonReport.data.affectedApplications;

      markdown = `# Vulnerability Report: ${vuln.name}\n\n`;
      markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;

      markdown += `## Vulnerability Information\n\n`;
      markdown += `- **Type:** ${vuln.type}\n`;
      markdown += `- **Severity:** ${vuln.severityLevel}\n`;
      markdown += `- **CVSS Score:** ${vuln.cvssScore}\n`;
      markdown += `- **Status:** ${vuln.status.replace("_", " ")}\n`;
      markdown += `- **Discovery Date:** ${new Date(
        vuln.discoveryDate
      ).toLocaleDateString()}\n`;

      if (vuln.assignedTo) {
        markdown += `- **Assigned To:** ${vuln.assignedTo}\n`;
      }

      if (vuln.defectDojoId) {
        markdown += `- **DefectDojo ID:** ${vuln.defectDojoId}\n`;
        markdown += `- **DefectDojo URL:** ${vuln.defectDojoUrl}\n`;
      }

      markdown += `\n**Description:**\n\n${vuln.description}\n\n`;

      if (vuln.recommendations) {
        markdown += `**Recommendations:**\n\n${vuln.recommendations}\n\n`;
      }

      if (vuln.cveReferences && vuln.cveReferences.length > 0) {
        markdown += `**CVE References:** ${vuln.cveReferences.join(", ")}\n\n`;
      }

      if (assets && assets.length > 0) {
        markdown += `## Affected Assets (${assets.length})\n\n`;
        markdown += `| Hostname | IP Address | OS |\n`;
        markdown += `|----------|------------|----|\n`;

        assets.forEach((asset) => {
          markdown += `| ${asset.hostname} | ${asset.ipAddress} | ${
            asset.osName || "Unknown"
          } ${asset.osVersion || ""} |\n`;
        });

        markdown += `\n`;
      }

      if (apps && apps.length > 0) {
        markdown += `## Affected Applications (${apps.length})\n\n`;
        markdown += `| Name | Version | Publisher |\n`;
        markdown += `|------|---------|----------|\n`;

        apps.forEach((app) => {
          markdown += `| ${app.name} | ${app.version || "N/A"} | ${
            app.publisher || "N/A"
          } |\n`;
        });

        markdown += `\n`;
      }
    } else {
      // Summary report
      filename = `summary_report_${timestamp}.md`;

      const assets = jsonReport.data.assets;
      const vulnSummary = jsonReport.data.vulnerabilitySummary;

      markdown = `# CTEM Summary Report\n\n`;
      markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;

      markdown += `## Vulnerability Summary\n\n`;
      markdown += `- **Total Vulnerabilities:** ${vulnSummary.total}\n\n`;

      markdown += `### By Severity\n\n`;
      markdown += `- Critical: ${vulnSummary.bySeverity.Critical}\n`;
      markdown += `- High: ${vulnSummary.bySeverity.High}\n`;
      markdown += `- Medium: ${vulnSummary.bySeverity.Medium}\n`;
      markdown += `- Low: ${vulnSummary.bySeverity.Low}\n\n`;

      markdown += `### By Status\n\n`;
      markdown += `- Fixed: ${vulnSummary.byStatus.Fixed}\n`;
      markdown += `- In Progress: ${vulnSummary.byStatus.In_Progress}\n`;
      markdown += `- Not Fixed: ${vulnSummary.byStatus.Not_Fixed}\n\n`;

      markdown += `## Assets Summary\n\n`;
      markdown += `- **Total Assets:** ${jsonReport.data.assetSummary.total}\n`;
      markdown += `- **Assets with Vulnerabilities:** ${jsonReport.data.assetSummary.withVulnerabilities}\n\n`;

      if (assets && assets.length > 0) {
        markdown += `## Asset List\n\n`;
        markdown += `| Hostname | IP Address | OS | Health Score | Vulnerabilities |\n`;
        markdown += `|----------|------------|----|--------------|-----------------|\n`;

        assets.forEach((asset) => {
          markdown += `| ${asset.hostname} | ${asset.ipAddress} | ${
            asset.osName || "Unknown"
          } ${asset.osVersion || ""} | ${asset.healthScore || "N/A"} | ${
            asset.vulnerabilitiesCount
          } |\n`;
        });

        markdown += `\n`;
      }
    }

    // Write to file
    const filePath = path.join(reportsDir, filename);
    fs.writeFileSync(filePath, markdown);

    return {
      success: true,
      reportType: jsonReport.reportType,
      filePath,
      fileName: filename,
    };
  } catch (error) {
    console.error("Error generating Markdown report:", error);
    throw error;
  }
}

/**
 * Get list of available reports
 * @param {string} outputDir - Directory containing reports
 * @returns {Promise<Array>} Array of report files
 */
async function listReports(outputDir) {
  try {
    const reportsDir =
      outputDir || path.join(__dirname, "..", "..", "..", "output", "reports");

    // Create directory if it doesn't exist
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
      return [];
    }

    // Get all files in the directory
    const files = fs.readdirSync(reportsDir);

    // Filter for report files and get their details
    const reports = files
      .filter(
        (file) =>
          file.endsWith(".json") ||
          file.endsWith(".md") ||
          file.endsWith(".pdf")
      )
      .map((file) => {
        const filePath = path.join(reportsDir, file);
        const stats = fs.statSync(filePath);

        // Determine report type from filename
        let reportType = "unknown";
        if (file.startsWith("asset_report_")) {
          reportType = "asset";
        } else if (file.startsWith("vulnerability_report_")) {
          reportType = "vulnerability";
        } else if (file.startsWith("summary_report_")) {
          reportType = "summary";
        }

        return {
          fileName: file,
          filePath,
          reportType,
          fileFormat: path.extname(file).substring(1),
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        };
      })
      .sort((a, b) => b.modified - a.modified); // Sort newest first

    return reports;
  } catch (error) {
    console.error("Error listing reports:", error);
    throw error;
  }
}

/**
 * Delete a report file
 * @param {string} fileName - Name of the report file
 * @param {string} outputDir - Directory containing reports
 * @returns {Promise<Object>} Success status
 */
async function deleteReport(fileName, outputDir) {
  try {
    const reportsDir =
      outputDir || path.join(__dirname, "..", "..", "..", "output", "reports");
    const filePath = path.join(reportsDir, fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Report file ${fileName} not found`);
    }

    // Delete the file
    fs.unlinkSync(filePath);

    return {
      success: true,
      message: `Report ${fileName} deleted successfully`,
    };
  } catch (error) {
    console.error(`Error deleting report ${fileName}:`, error);
    throw error;
  }
}

// Placeholder for PDF generation
// PDF generation typically requires additional libraries like PDFKit, pdfmake, etc.
// This is a placeholder function that could be implemented with such libraries
// async function generatePdfReport(options) {
//   // Implementation would depend on the PDF library chosen
// }

export {
  generateJsonReport,
  generateMarkdownReport,
  // generatePdfReport, // Uncomment if implemented
  listReports,
  deleteReport,
};
