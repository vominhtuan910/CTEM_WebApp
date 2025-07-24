/**
 * Format database assets to match the frontend expectations
 * This ensures that the frontend receives data in the format it expects
 */

/**
 * Format a database asset to match frontend expectations
 * @param {Object} dbAsset - Asset from database
 * @param {Array} services - Services for the asset
 * @param {Array} applications - Applications for the asset
 * @returns {Object} Formatted asset for frontend
 */
export function formatAssetForFrontend(
  dbAsset,
  services = [],
  applications = []
) {
  if (!dbAsset) {
    return null;
  }

  // No need to call toJSON with Prisma - it already returns plain objects
  const asset = dbAsset;

  // Format OS information
  const os = {
    name: asset.osName || "Unknown",
    version: asset.osVersion || "",
    architecture: asset.osArchitecture || "",
    buildNumber: asset.osBuildNumber || "",
    lastBootTime: asset.osLastBootTime || null,
  };

  // Ensure services is an array
  const formattedServices =
    services.length > 0 ? services : asset.services || [];

  // Ensure applications is an array
  const formattedApplications =
    applications.length > 0 ? applications : asset.applications || [];

  // Format the asset
  const formattedAsset = {
    id: asset.id,
    hostname: asset.hostname,
    name: asset.name || asset.hostname,
    ipAddress: asset.ipAddress,
    ipAddresses: asset.ipAddresses || [],
    status: asset.status || "active",
    lastScan: asset.lastScan,
    lastUpdated: asset.updatedAt,
    createdAt: asset.createdAt,
    os,
    services: formattedServices,
    applications: formattedApplications,
    healthScore: asset.healthScore || 0,
    issuesCount: asset.issuesCount || 0,
    labels: asset.labels || [],
    agentStatus: asset.agentStatus || "not_installed",
    priority: {
      confidentiality: asset.confidentiality || 1,
      integrity: asset.integrity || 1,
      availability: asset.availability || 1,
    },
    department: asset.department || "",
    location: asset.location || "",
    owner: asset.owner || "",
  };

  return formattedAsset;
}

/**
 * Format an array of database assets for the frontend
 * @param {Array} dbAssets - Assets from database
 * @returns {Array} Formatted assets for frontend
 */
export function formatAssetsForFrontend(dbAssets) {
  if (!Array.isArray(dbAssets)) {
    return [];
  }

  return dbAssets.map((asset) => formatAssetForFrontend(asset));
}
