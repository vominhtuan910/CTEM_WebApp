import axios from "axios";
import { Asset } from "../types/asset.types";

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
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
};

// Scan API endpoints
export const scanApi = {
  getScanToolsStatus: async () => {
    const response = await api.get("/scan/tools");
    return response.data;
  },

  startScan: async (options: {
    target: string;
    runNmap?: boolean;
    runLynis?: boolean;
    runPowerShell?: boolean;
    scanOptions?: ScanOptions;
  }) => {
    try {
      // Always use all scan options except packages
      const backendOptions = {
        ...options,
        scanOptions: {
          scanPackages: false, // Disabled by default
          scanServices: true, // Always enabled
          scanVulnerabilities: true, // Always enabled
          scanNetworkConfig: true, // Always enabled
          quickScan: false,
        },
      };

      const response = await api.post("/scan/start", backendOptions);

      // Ensure we have a scanId in the response
      if (!response.data || !response.data.scanId) {
        console.error("No scanId returned from API:", response.data);
        throw new Error("No scanId returned from scan API");
      }

      return response.data;
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
};

// Parser API endpoints
export const parserApi = {
  parseScan: async (scanId: string) => {
    try {
      if (!scanId) {
        throw new Error("No scan ID provided to parseScan");
      }

      const response = await api.post("/parser/parse", { scanId });
      return response.data;
    } catch (error) {
      console.error("Parse scan error:", error);
      throw error;
    }
  },

  saveScanResults: async (scanId: string, assetId?: string) => {
    try {
      if (!scanId) {
        throw new Error("No scan ID provided to saveScanResults");
      }

      const response = await api.post("/parser/save", { scanId, assetId });
      return response.data;
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
