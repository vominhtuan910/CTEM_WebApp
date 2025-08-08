import axios from "axios";
import { Asset } from "../types/asset.types";

// Create an axios instance with default config
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "/api" : "http://localhost:3001/api"),
  headers: {
    "Content-Type": "application/json",
  },
});

// Update the ScanOptions interface to reflect that package scanning is disabled by default
interface ScanOptions {
  systemScan?: boolean;
  networkScan?: boolean;
  servicesScan?: boolean;
  // Note that packages scanning is now disabled by default
}

// Asset API endpoints
export const assetApi = {
  getAll: async () => {
    const response = await api.get("/assets");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  create: async (asset: Partial<Asset>) => {
    const response = await api.post("/assets", asset);
    return response.data;
  },

  update: async (id: string, asset: Partial<Asset>) => {
    const response = await api.put(`/assets/${id}`, asset);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },

  clearAll: async () => {
    const response = await api.delete("/assets/clear-all");
    return response.data;
  },
};

// Vulnerability API endpoints
export const vulnerabilityApi = {
  getAll: async () => {
    const response = await api.get("/vulnerabilities");
    return response.data;
  },

  // New method to get OpenVAS threats from parsed XML reports
  getOpenVASThreats: async (params?: {
    sort_by?: string;
    sort_order?: string;
    severity_filter?: string;
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.severity_filter)
      queryParams.append("severity_filter", params.severity_filter);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await api.get(
      `/vulnerabilities/openvas-threats?${queryParams.toString()}`
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/vulnerabilities/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/vulnerabilities/${id}/status`, {
      status,
    });
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get("/vulnerabilities/summary");
    return response.data;
  },

  getTrends: async (days: number = 7) => {
    const response = await api.get(`/vulnerabilities/trends?days=${days}`);
    return response.data;
  },
};

// Dashboard API endpoints
export const dashboardApi = {
  getData: async () => {
    const response = await api.get("/dashboard");
    return response.data.data; // Extract data from success wrapper
  },

  getMetrics: async () => {
    const response = await api.get("/dashboard/metrics");
    return response.data.data; // Extract data from success wrapper
  },

  getAlerts: async () => {
    const response = await api.get("/dashboard/alerts");
    return response.data.data; // Extract data from success wrapper
  },

  // Legacy endpoints for backward compatibility
  getHealthScore: async () => {
    const response = await api.get("/dashboard");
    return response.data.data.health_score;
  },

  getThreatsSummary: async () => {
    const response = await api.get("/dashboard");
    return {
      top_cves: response.data.data.top_cves,
      vulnerable_assets: response.data.data.vulnerable_assets,
    };
  },
};

// Scan API endpoints
export const scanApi = {
  getScanToolsStatus: async () => {
    const response = await api.get("/scan/tools");
    return response.data;
  },

  // Updated to use the Nmap network scan endpoint
  scanNetwork: async (network: string) => {
    try {
      const response = await api.post(
        `/scan/network?network=${encodeURIComponent(network)}`
      );
      return response.data;
    } catch (error) {
      console.error("Nmap scan API error:", error);
      throw error;
    }
  },

  // Legacy method for backward compatibility - now uses network scan
  startScan: async (options: {
    target: string;
    runNmap?: boolean;
    runLynis?: boolean;
    runPowerShell?: boolean;
    autoDetectOS?: boolean;
    scanOptions?: ScanOptions;
  }) => {
    try {
      // Convert target to network format if it's a single IP
      let network = options.target;
      if (network === "localhost") {
        network = "127.0.0.1/32";
      } else if (!network.includes("/")) {
        // If it's a single IP without CIDR, add /32
        network = `${network}/32`;
      }

      const response = await api.post(
        `/scan/network?network=${encodeURIComponent(network)}`
      );

      // Transform response to match expected format
      const result = response.data;
      return {
        success: result.success,
        scanId: `nmap_${Date.now()}`, // Generate a scan ID for compatibility
        network: result.network,
        scanTime: result.scan_time,
        totalHosts: result.total_hosts,
        hosts: result.hosts,
        xmlPath: result.xml_path,
        scanStatus: {
          overall: result.success ? "completed" : "failed",
        },
        errors: result.success ? null : { overall: result.error },
      };
    } catch (error) {
      console.error("Scan API error:", error);
      throw error;
    }
  },

  getScanHistory: async (limit = 10) => {
    const response = await api.get(`/scan/history?limit=${limit}`);
    return response.data;
  },

  getScanById: async (scanId: string) => {
    const response = await api.get(`/scan/${scanId}`);
    return response.data;
  },

  scanAsset: async (assetId: string) => {
    const response = await api.post(`/scan/assets/${assetId}`);
    return response.data;
  },

  // OpenVAS vulnerability scan for a single asset
  scanVulnerabilities: async (assetId: string) => {
    const response = await api.post("/assets/vulnerability-scan", [
      parseInt(assetId),
    ]);
    return response.data;
  },
};

// Parser API endpoints
export const parserApi = {
  // For Nmap scans, parsing is done automatically by the scan service
  // This method now transforms the scan results to the expected format
  parseScan: async (scanId: string, scanResults?: any) => {
    try {
      if (!scanId) {
        throw new Error("No scan ID provided to parseScan");
      }

      // If we have scan results from the Nmap scan, transform them
      if (scanResults && scanResults.hosts && scanResults.hosts.length > 0) {
        const firstHost = scanResults.hosts[0];

        return {
          success: true,
          parsedResults: {
            assetInfo: {
              hostname:
                firstHost.hostname ||
                scanResults.network?.split("/")[0] ||
                "localhost",
              ipAddress:
                firstHost.ip ||
                scanResults.network?.split("/")[0] ||
                "127.0.0.1",
              status: "active",
              osName: firstHost.os || "Unknown",
              osVersion: "",
              osBuildNumber: "",
              osPlatform: firstHost.os || "Unknown",
              osKernelVersion: "",
              macAddress: firstHost.mac_address || "",
              manufacturer: firstHost.manufacturer || "",
            },
            services: [], // Nmap service detection would populate this
            applications: [], // Application detection would populate this
          },
        };
      }

      // Fallback to original parser API if no scan results provided
      const response = await api.post("/parser/parse", { scanId });
      return response.data;
    } catch (error) {
      console.error("Parse scan error:", error);
      throw error;
    }
  },

  // For Nmap scans, assets are automatically saved by the scan service
  // This method is kept for compatibility
  saveScanResults: async (scanId: string, assetId?: string) => {
    try {
      if (!scanId) {
        throw new Error("No scan ID provided to saveScanResults");
      }

      // For Nmap scans, the assets are already saved during the scan
      // Return a success response
      return {
        success: true,
        message: "Assets were automatically saved during the scan",
        asset: {
          id: assetId || scanId,
          saved: true,
        },
      };
    } catch (error) {
      console.error("Save scan results error:", error);
      throw error;
    }
  },
};

// Report API endpoints
export const reportApi = {
  generateReport: async (options: {
    format: "json" | "markdown" | "pdf";
    assetId?: string;
    vulnerabilityId?: string;
    includeScans?: boolean;
  }) => {
    const response = await api.post("/reports/generate", options);
    return response.data;
  },

  getReports: async () => {
    const response = await api.get("/reports");
    return response.data;
  },

  downloadReport: async (fileName: string) => {
    // This needs to be handled differently since it returns a file
    window.open(
      `${api.defaults.baseURL}/reports/download/${fileName}`,
      "_blank"
    );
  },
};

export default api;
