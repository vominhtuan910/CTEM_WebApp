import prisma from "../../core/database/prisma.js";
import {
  formatAssetForFrontend,
  formatAssetsForFrontend,
} from "../../utils/formatters/assetFormatter.js";

/**
 * Get all assets with optional filtering
 * @param {object} options - Filter options
 * @returns {Promise<Array>} Array of assets
 */
async function getAllAssets(options = {}) {
  const { search, status, labels } = options;

  // Build where clause based on query parameters
  const whereClause = {};

  if (status) {
    whereClause.status = status;
  }

  if (search) {
    whereClause.OR = [
      { hostname: { contains: search, mode: "insensitive" } },
      { ipAddress: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  if (labels && labels.length > 0) {
    whereClause.labels = {
      hasSome: Array.isArray(labels) ? labels : [labels],
    };
  }

  try {
    const assets = await prisma.asset.findMany({
      where: whereClause,
      include: {
        services: true,
        applications: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return formatAssetsForFrontend(assets);
  } catch (error) {
    console.error("Error retrieving assets:", error);
    throw error;
  }
}

/**
 * Get an asset by ID
 * @param {string} id - Asset ID
 * @returns {Promise<object>} Asset object
 */
async function getAssetById(id) {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        services: true,
        applications: true,
      },
    });

    if (!asset) {
      throw new Error(`Asset with ID ${id} not found`);
    }

    return formatAssetForFrontend(asset);
  } catch (error) {
    console.error(`Error retrieving asset ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new asset
 * @param {object} assetData - Asset data
 * @returns {Promise<object>} Created asset
 */
async function createAsset(assetData) {
  try {
    // Prepare dates
    if (assetData.lastScan) {
      assetData.lastScan = new Date(assetData.lastScan);
    }

    if (assetData.osLastBootTime) {
      assetData.osLastBootTime = new Date(assetData.osLastBootTime);
    }

    // Process nested services and applications
    const { services = [], applications = [], ...assetFields } = assetData;

    // Create asset with nested relations
    const asset = await prisma.asset.create({
      data: {
        ...assetFields,
        ipAddresses: assetFields.ipAddresses || [],
        status: assetFields.status || "active",
        issuesCount: assetFields.issuesCount || 0,
        labels: assetFields.labels || [],
        agentStatus: assetFields.agentStatus || "not_installed",
        confidentiality: assetFields.confidentiality || 1,
        integrity: assetFields.integrity || 1,
        availability: assetFields.availability || 1,
        department: assetFields.department || "",
        location: assetFields.location || "",
        owner: assetFields.owner || "",
        services: {
          create: services.map((service) => ({
            name: service.name,
            displayName: service.displayName,
            status: service.status,
            port: service.port,
            protocol: service.protocol,
            version: service.version,
            description: service.description,
          })),
        },
        applications: {
          create: applications.map((app) => ({
            name: app.name,
            version: app.version,
            publisher: app.publisher,
            installDate: app.installDate ? new Date(app.installDate) : null,
            type: app.type,
            description: app.description,
            path: app.path,
          })),
        },
      },
      include: {
        services: true,
        applications: true,
      },
    });

    return formatAssetForFrontend(asset);
  } catch (error) {
    console.error("Error creating asset:", error);
    throw error;
  }
}

/**
 * Update an asset
 * @param {string} id - Asset ID
 * @param {object} assetData - Updated asset data
 * @returns {Promise<object>} Updated asset
 */
async function updateAsset(id, assetData) {
  try {
    // Prepare dates
    if (assetData.lastScan) {
      assetData.lastScan = new Date(assetData.lastScan);
    }

    if (assetData.osLastBootTime) {
      assetData.osLastBootTime = new Date(assetData.osLastBootTime);
    }

    // Process nested services and applications
    const { services, applications, ...assetFields } = assetData;

    // Update the asset (without nested relations first)
    await prisma.asset.update({
      where: { id },
      data: assetFields,
    });

    // Handle services updates if provided
    if (services) {
      // Delete existing services
      await prisma.service.deleteMany({
        where: { assetId: id },
      });

      // Create new services
      if (services.length > 0) {
        await Promise.all(
          services.map((service) =>
            prisma.service.create({
              data: {
                name: service.name,
                displayName: service.displayName,
                status: service.status,
                port: service.port,
                protocol: service.protocol,
                version: service.version,
                description: service.description,
                assetId: id,
              },
            })
          )
        );
      }
    }

    // Handle applications updates if provided
    if (applications) {
      // Delete existing applications
      await prisma.application.deleteMany({
        where: { assetId: id },
      });

      // Create new applications
      if (applications.length > 0) {
        await Promise.all(
          applications.map((app) =>
            prisma.application.create({
              data: {
                name: app.name,
                version: app.version,
                publisher: app.publisher,
                installDate: app.installDate ? new Date(app.installDate) : null,
                type: app.type,
                description: app.description,
                path: app.path,
                assetId: id,
              },
            })
          )
        );
      }
    }

    // Get updated asset with relations
    const updatedAsset = await prisma.asset.findUnique({
      where: { id },
      include: {
        services: true,
        applications: true,
      },
    });

    return formatAssetForFrontend(updatedAsset);
  } catch (error) {
    console.error(`Error updating asset ${id}:`, error);
    throw error;
  }
}

/**
 * Delete an asset
 * @param {string} id - Asset ID
 * @returns {Promise<boolean>} Success indicator
 */
async function deleteAsset(id) {
  try {
    await prisma.asset.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error(`Error deleting asset ${id}:`, error);
    throw error;
  }
}

/**
 * Update asset from scan results
 * @param {string} assetId - Asset ID
 * @param {object} scanData - Scan results
 * @returns {Promise<object>} Updated asset
 */
async function updateAssetFromScan(assetId, scanData) {
  try {
    // Get existing asset
    const existingAsset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!existingAsset) {
      throw new Error(`Asset with ID ${assetId} not found`);
    }

    // Update the asset with scan data
    return await updateAsset(assetId, {
      lastScan: new Date(),
      healthScore: scanData.healthScore || existingAsset.healthScore,
      issuesCount: scanData.issuesCount || existingAsset.issuesCount,
      osName: scanData.osName || existingAsset.osName,
      osVersion: scanData.osVersion || existingAsset.osVersion,
      osArchitecture: scanData.osArchitecture || existingAsset.osArchitecture,
      osLastBootTime: scanData.osLastBootTime || existingAsset.osLastBootTime,
      labels: [
        ...new Set([...existingAsset.labels, ...(scanData.labels || [])]),
      ],
      services: scanData.services,
      applications: scanData.applications,
    });
  } catch (error) {
    console.error(`Error updating asset ${assetId} from scan:`, error);
    throw error;
  }
}

export {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  updateAssetFromScan,
};
