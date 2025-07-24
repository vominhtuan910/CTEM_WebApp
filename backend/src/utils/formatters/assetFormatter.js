/**
 * Format an asset from the database for the frontend
 * @param {Object} dbAsset - Asset from database
 * @param {Array} services - Services (optional, will use dbAsset.services if not provided)
 * @param {Array} applications - Applications (optional, will use dbAsset.applications if not provided)
 * @returns {Object} Formatted asset
 */
export function formatAssetForFrontend(
  dbAsset,
  services = [],
  applications = []
) {
  if (!dbAsset) return null;

  // Use provided services/applications or ones from the asset
  const assetServices = services.length > 0 ? services : dbAsset.services || [];
  const assetApplications =
    applications.length > 0 ? applications : dbAsset.applications || [];

  // Format vulnerabilities if available
  let vulnerabilities = [];
  if (dbAsset.vulnerabilities) {
    vulnerabilities = dbAsset.vulnerabilities.map((av) => {
      const vuln = av.vulnerability;
      return {
        id: vuln.id,
        name: vuln.name,
        type: vuln.type,
        cvssScore: vuln.cvssScore,
        severityLevel: vuln.severityLevel,
        status: vuln.status,
        description: vuln.description,
        recommendations: vuln.recommendations,
      };
    });
  }

  // Format the asset
  return {
    id: dbAsset.id,
    hostname: dbAsset.hostname,
    name: dbAsset.name || dbAsset.hostname,
    ipAddress: dbAsset.ipAddress,
    ipAddresses: dbAsset.ipAddresses || [],
    status: dbAsset.status,
    healthScore: dbAsset.healthScore,
    issuesCount: dbAsset.issuesCount,
    labels: dbAsset.labels || [],
    agentStatus: dbAsset.agentStatus,
    lastScan: dbAsset.lastScan,

    // OS info
    os: {
      name: dbAsset.osName,
      version: dbAsset.osVersion,
      architecture: dbAsset.osArchitecture,
      buildNumber: dbAsset.osBuildNumber,
      lastBootTime: dbAsset.osLastBootTime,
    },

    // Risk info
    risk: {
      confidentiality: dbAsset.confidentiality,
      integrity: dbAsset.integrity,
      availability: dbAsset.availability,
    },

    // Additional info
    department: dbAsset.department,
    location: dbAsset.location,
    owner: dbAsset.owner,

    // Related data
    services: assetServices,
    applications: assetApplications,
    vulnerabilities: vulnerabilities,

    // Metadata
    createdAt: dbAsset.createdAt,
    updatedAt: dbAsset.updatedAt,
  };
}

/**
 * Format a list of assets from the database for the frontend
 * @param {Array} dbAssets - Assets from database
 * @returns {Array} Formatted assets
 */
export function formatAssetsForFrontend(dbAssets) {
  if (!dbAssets || !Array.isArray(dbAssets)) return [];

  return dbAssets.map((asset) => formatAssetForFrontend(asset));
}
