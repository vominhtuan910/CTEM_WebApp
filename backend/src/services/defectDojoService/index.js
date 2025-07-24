import axios from "axios";
import prisma from "../../core/database/prisma.js";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * Get DefectDojo configuration
 * @returns {Promise<Object>} DefectDojo configuration
 */
async function getDefectDojoConfig() {
  try {
    const config = await prisma.defectDojoIntegration.findFirst({
      where: { isActive: true },
    });

    if (!config) {
      throw new Error("No active DefectDojo configuration found");
    }

    return config;
  } catch (error) {
    console.error("Error retrieving DefectDojo configuration:", error);
    throw error;
  }
}

/**
 * Create DefectDojo configuration
 * @param {Object} configData - DefectDojo configuration data
 * @returns {Promise<Object>} Created DefectDojo configuration
 */
async function createDefectDojoConfig(configData) {
  try {
    const config = await prisma.defectDojoIntegration.create({
      data: {
        ...configData,
        isActive:
          configData.isActive !== undefined ? configData.isActive : true,
        lastSyncDate: configData.lastSyncDate || null,
      },
    });

    return config;
  } catch (error) {
    console.error("Error creating DefectDojo configuration:", error);
    throw error;
  }
}

/**
 * Update DefectDojo configuration
 * @param {string} id - Configuration ID
 * @param {Object} configData - DefectDojo configuration data
 * @returns {Promise<Object>} Updated DefectDojo configuration
 */
async function updateDefectDojoConfig(id, configData) {
  try {
    const config = await prisma.defectDojoIntegration.update({
      where: { id },
      data: configData,
    });

    return config;
  } catch (error) {
    console.error(`Error updating DefectDojo configuration ${id}:`, error);
    throw error;
  }
}

/**
 * Test DefectDojo connection
 * @param {Object} config - DefectDojo configuration
 * @returns {Promise<Object>} Connection test results
 */
async function testDefectDojoConnection(config) {
  try {
    // Use provided config or get from database
    const dojoConfig = config || (await getDefectDojoConfig());

    // Create axios client with authentication
    const client = axios.create({
      baseURL: dojoConfig.url,
      headers: {
        Authorization: `Token ${dojoConfig.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    // Test connection by fetching user info
    const response = await client.get("/api/v2/users/");

    return {
      success: true,
      message: "Successfully connected to DefectDojo API",
      data: {
        url: dojoConfig.url,
        username: dojoConfig.username,
        users: response.data.results.length,
      },
    };
  } catch (error) {
    console.error("Error testing DefectDojo connection:", error);

    return {
      success: false,
      message: `Failed to connect to DefectDojo: ${error.message}`,
      error: error.response ? error.response.data : error.message,
    };
  }
}

/**
 * Get DefectDojo products
 * @returns {Promise<Array>} List of products
 */
async function getDefectDojoProducts() {
  try {
    const dojoConfig = await getDefectDojoConfig();

    // Create axios client with authentication
    const client = axios.create({
      baseURL: dojoConfig.url,
      headers: {
        Authorization: `Token ${dojoConfig.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const response = await client.get("/api/v2/products/");
    return response.data.results;
  } catch (error) {
    console.error("Error fetching DefectDojo products:", error);
    throw error;
  }
}

/**
 * Get DefectDojo engagements
 * @param {number} productId - Product ID
 * @returns {Promise<Array>} List of engagements
 */
async function getDefectDojoEngagements(productId) {
  try {
    const dojoConfig = await getDefectDojoConfig();

    // Create axios client with authentication
    const client = axios.create({
      baseURL: dojoConfig.url,
      headers: {
        Authorization: `Token ${dojoConfig.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const response = await client.get("/api/v2/engagements/", {
      params: {
        product: productId,
      },
    });

    return response.data.results;
  } catch (error) {
    console.error(
      `Error fetching DefectDojo engagements for product ${productId}:`,
      error
    );
    throw error;
  }
}

/**
 * Create a product in DefectDojo
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} Created product
 */
async function createDefectDojoProduct(productData) {
  try {
    const dojoConfig = await getDefectDojoConfig();

    // Create axios client with authentication
    const client = axios.create({
      baseURL: dojoConfig.url,
      headers: {
        Authorization: `Token ${dojoConfig.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    // Create product
    const response = await client.post("/api/v2/products/", {
      name: productData.name,
      description:
        productData.description ||
        `Product created by CTEM WebApp for ${productData.name}`,
      prod_type: productData.productType || 1,
    });

    return response.data;
  } catch (error) {
    console.error("Error creating DefectDojo product:", error);
    throw error;
  }
}

/**
 * Create an engagement in DefectDojo
 * @param {Object} engagementData - Engagement data
 * @returns {Promise<Object>} Created engagement
 */
async function createDefectDojoEngagement(engagementData) {
  try {
    const dojoConfig = await getDefectDojoConfig();

    // Create axios client with authentication
    const client = axios.create({
      baseURL: dojoConfig.url,
      headers: {
        Authorization: `Token ${dojoConfig.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    // Format dates
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // Default 3-month engagement

    // Create engagement
    const response = await client.post("/api/v2/engagements/", {
      name: engagementData.name,
      product: engagementData.productId,
      target_start:
        engagementData.startDate || today.toISOString().split("T")[0],
      target_end: engagementData.endDate || endDate.toISOString().split("T")[0],
      engagement_type: engagementData.type || "Interactive",
      status: engagementData.status || "In Progress",
      description:
        engagementData.description ||
        `Engagement created by CTEM WebApp for ${engagementData.name}`,
    });

    return response.data;
  } catch (error) {
    console.error("Error creating DefectDojo engagement:", error);
    throw error;
  }
}

/**
 * Import scan results to DefectDojo
 * @param {Object} importData - Import data
 * @param {string} importData.assetId - Asset ID
 * @param {string} importData.scanFile - Path to scan file
 * @param {number} importData.engagementId - Engagement ID
 * @param {string} importData.scanType - Scan type
 * @returns {Promise<Object>} Import results
 */
async function importScanToDefectDojo(importData) {
  try {
    const {
      assetId,
      scanFile,
      engagementId,
      scanType = "Generic Findings Import",
    } = importData;

    // Get asset with vulnerabilities
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
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

    const dojoConfig = await getDefectDojoConfig();

    // Create axios client with authentication
    const client = axios.create({
      baseURL: dojoConfig.url,
      headers: {
        Authorization: `Token ${dojoConfig.apiKey}`,
        "Content-Type": "multipart/form-data",
      },
    });

    // Create form data
    const formData = new FormData();
    formData.append("engagement", engagementId);
    formData.append("scan_type", scanType);
    formData.append("scan_date", new Date().toISOString().split("T")[0]);

    // Check if we have a file to upload or need to create one from vulnerabilities
    if (scanFile) {
      formData.append("file", fs.createReadStream(scanFile));
    } else {
      // Create a findings file in Generic DefectDojo format
      const findings = asset.vulnerabilities.map((av) => ({
        title: av.vulnerability.name,
        description: av.vulnerability.description,
        severity: av.vulnerability.severityLevel,
        mitigation: av.vulnerability.recommendations,
        impact: `CVSS Score: ${av.vulnerability.cvssScore}`,
        date: av.vulnerability.discoveryDate,
      }));

      // Convert to CSV or JSON format that DefectDojo accepts
      // This is a simplified example - adjust format as needed
      const findingsJson = JSON.stringify({
        findings: findings,
      });

      // Create a temporary file
      const tempFile = path.join(os.tmpdir(), `findings_${assetId}.json`);
      fs.writeFileSync(tempFile, findingsJson);

      formData.append("file", fs.createReadStream(tempFile));

      // Delete the temporary file after upload
      setTimeout(() => {
        fs.unlinkSync(tempFile);
      }, 5000);
    }

    // Upload to DefectDojo
    const response = await client.post("/api/v2/import-scan/", formData);

    // Update vulnerabilities with DefectDojo IDs
    if (response.data && response.data.test && response.data.findings) {
      // Link vulnerabilities to DefectDojo findings
      for (const finding of response.data.findings) {
        // Find matching vulnerability
        const matchingVulns = asset.vulnerabilities.filter(
          (av) =>
            av.vulnerability.name === finding.title ||
            av.vulnerability.description.includes(finding.description)
        );

        if (matchingVulns.length > 0) {
          // Update the vulnerability with DefectDojo ID
          await prisma.vulnerability.update({
            where: { id: matchingVulns[0].vulnerabilityId },
            data: {
              defectDojoId: finding.id,
              defectDojoUrl: `${dojoConfig.url}/finding/${finding.id}`,
            },
          });
        }
      }
    }

    // Update DefectDojo integration last sync date
    await prisma.defectDojoIntegration.update({
      where: { id: dojoConfig.id },
      data: {
        lastSyncDate: new Date(),
      },
    });

    return {
      success: true,
      message: "Successfully imported scan to DefectDojo",
      data: response.data,
    };
  } catch (error) {
    console.error("Error importing scan to DefectDojo:", error);

    return {
      success: false,
      message: `Failed to import scan to DefectDojo: ${error.message}`,
      error: error.response ? error.response.data : error.message,
    };
  }
}

/**
 * Get findings from DefectDojo for a specific asset
 * @param {string} assetId - Asset ID
 * @returns {Promise<Array>} Array of findings
 */
async function getAssetFindingsFromDefectDojo(assetId) {
  try {
    // Get asset vulnerabilities with DefectDojo IDs
    const assetVulnerabilities = await prisma.assetVulnerability.findMany({
      where: {
        assetId,
        vulnerability: {
          defectDojoId: { not: null },
        },
      },
      include: {
        vulnerability: true,
      },
    });

    if (assetVulnerabilities.length === 0) {
      return [];
    }

    const dojoConfig = await getDefectDojoConfig();

    // Create axios client with authentication
    const client = axios.create({
      baseURL: dojoConfig.url,
      headers: {
        Authorization: `Token ${dojoConfig.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    // Get findings for each vulnerability
    const findings = [];

    for (const av of assetVulnerabilities) {
      if (av.vulnerability.defectDojoId) {
        try {
          const response = await client.get(
            `/api/v2/findings/${av.vulnerability.defectDojoId}/`
          );
          findings.push({
            ...response.data,
            vulnerabilityId: av.vulnerabilityId,
          });
        } catch (findingError) {
          console.error(
            `Error fetching finding ${av.vulnerability.defectDojoId}:`,
            findingError
          );
        }
      }
    }

    return findings;
  } catch (error) {
    console.error(
      `Error fetching DefectDojo findings for asset ${assetId}:`,
      error
    );
    throw error;
  }
}

/**
 * Sync vulnerability statuses from DefectDojo
 * @param {string} assetId - Asset ID
 * @returns {Promise<Object>} Sync results
 */
async function syncVulnerabilitiesFromDefectDojo(assetId) {
  try {
    // Get findings from DefectDojo
    const findings = await getAssetFindingsFromDefectDojo(assetId);

    if (findings.length === 0) {
      return {
        success: true,
        message: "No findings to sync from DefectDojo",
        updated: 0,
      };
    }

    // Map DefectDojo statuses to our statuses
    const statusMap = {
      Active: "Not_Fixed",
      Verified: "Not_Fixed",
      "False Positive": "Not_Fixed",
      Duplicate: "Not_Fixed",
      "Out of Scope": "Not_Fixed",
      "Risk Accepted": "Not_Fixed",
      "Under Review": "In_Progress",
      "Under Investigation": "In_Progress",
      Remediated: "Fixed",
      Mitigated: "Fixed",
      Closed: "Fixed",
    };

    // Update vulnerabilities with statuses from DefectDojo
    let updatedCount = 0;

    for (const finding of findings) {
      const status = statusMap[finding.status] || "Not_Fixed";

      await prisma.vulnerability.update({
        where: { id: finding.vulnerabilityId },
        data: {
          status,
          lastUpdated: new Date(),
          assignedTo: finding.reporter ? finding.reporter.username : null,
        },
      });

      updatedCount++;
    }

    // Update DefectDojo integration last sync date
    const dojoConfig = await getDefectDojoConfig();
    await prisma.defectDojoIntegration.update({
      where: { id: dojoConfig.id },
      data: {
        lastSyncDate: new Date(),
      },
    });

    return {
      success: true,
      message: `Successfully synced ${updatedCount} vulnerabilities from DefectDojo`,
      updated: updatedCount,
    };
  } catch (error) {
    console.error(
      `Error syncing vulnerabilities from DefectDojo for asset ${assetId}:`,
      error
    );

    return {
      success: false,
      message: `Failed to sync vulnerabilities from DefectDojo: ${error.message}`,
      error: error.message,
    };
  }
}

export {
  getDefectDojoConfig,
  createDefectDojoConfig,
  updateDefectDojoConfig,
  testDefectDojoConnection,
  getDefectDojoProducts,
  getDefectDojoEngagements,
  createDefectDojoProduct,
  createDefectDojoEngagement,
  importScanToDefectDojo,
  getAssetFindingsFromDefectDojo,
  syncVulnerabilitiesFromDefectDojo,
};
