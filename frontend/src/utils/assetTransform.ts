import { Asset } from "../types/asset.types";

// Backend asset response structure
interface BackendAsset {
  id: string;
  hostname: string;
  name?: string;
  ip_address: string;
  ip_addresses: string[];
  status: string;
  health_score?: number;
  issues_count: number;
  labels: string[];
  agent_status: string;
  os_name?: string;
  os_version?: string;
  os_architecture?: string;
  os_build_number?: string;
  os_last_boot_time?: string;
  os_platform?: string;
  os_kernel_version?: string;
  confidentiality: number;
  integrity: number;
  availability: number;
  department?: string;
  location?: string;
  owner?: string;
  last_scan?: string;
  created_at: string;
  updated_at: string;
  services: any[];
  applications: any[];
}

// Transform backend asset data to frontend format
export const transformBackendAsset = (backendAsset: BackendAsset): Asset => {
  return {
    id: backendAsset.id,
    hostname: backendAsset.hostname,
    name: backendAsset.name,
    ipAddress: backendAsset.ip_address,
    ipAddresses: backendAsset.ip_addresses,
    status: backendAsset.status as "active" | "inactive",
    lastScan: backendAsset.last_scan || "",
    lastUpdated: backendAsset.updated_at,
    createdAt: backendAsset.created_at,
    os: {
      name: backendAsset.os_name || "Unknown",
      version: backendAsset.os_version || "",
      architecture: backendAsset.os_architecture || "",
      buildNumber: backendAsset.os_build_number || "",
      lastBootTime: backendAsset.os_last_boot_time || "",
    },
    operatingSystem: backendAsset.os_name,
    services: backendAsset.services.map((service) => ({
      name: service.name,
      displayName: service.display_name || service.name,
      status: service.status || "unknown",
      startType: service.service_type || "unknown",
      pid: undefined,
      port: service.port,
    })),
    applications: backendAsset.applications.map((app) => ({
      name: app.name,
      version: app.version || "",
      publisher: app.publisher || "",
      installDate: app.install_date || "",
      size: undefined,
    })),
    healthScore: backendAsset.health_score,
    issuesCount: backendAsset.issues_count,
    labels: backendAsset.labels,
    agentStatus: backendAsset.agent_status as
      | "installed"
      | "not_installed"
      | "error",
    priority: {
      confidentiality: backendAsset.confidentiality,
      integrity: backendAsset.integrity,
      availability: backendAsset.availability,
    },
  };
};

// Transform backend assets response to frontend format
export const transformBackendAssetsResponse = (response: any): Asset[] => {
  // Handle the response structure: { success: boolean, data: BackendAsset[], total: number }
  const assetsData = response.data || response;

  if (!Array.isArray(assetsData)) {
    console.error(
      "Expected assets data to be an array, got:",
      typeof assetsData
    );
    return [];
  }

  return assetsData.map(transformBackendAsset);
};
