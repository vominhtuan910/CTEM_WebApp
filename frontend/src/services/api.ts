import { Asset } from "../types/asset.types";
import { Vulnerability } from "../types/vulnerability.types";
import { mockAssets } from "../data/mockAssets";
import mockVulnerabilities from "../data/mockVulnerabilities";

const API_URL = "http://localhost:3000/api";

export const api = {
  // Scanning endpoints
  scan: {
    startScan: async (target: string): Promise<any> => {
      const response = await fetch(`${API_URL}/scan/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target }),
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }

      return response.json();
    },

    getPorts: async (): Promise<any> => {
      const response = await fetch(`${API_URL}/scan/ports`);

      if (!response.ok) {
        throw new Error(`Failed to get port scan data: ${response.statusText}`);
      }

      return response.json();
    },

    getSockets: async (): Promise<any> => {
      const response = await fetch(`${API_URL}/scan/sockets`);

      if (!response.ok) {
        throw new Error(`Failed to get socket data: ${response.statusText}`);
      }

      return response.json();
    },

    getSystemInfo: async (): Promise<any> => {
      const response = await fetch(`${API_URL}/scan/system`);

      if (!response.ok) {
        throw new Error(
          `Failed to get system information: ${response.statusText}`
        );
      }

      return response.json();
    },
  },

  // Asset endpoints (to be implemented on backend)
  assets: {
    getAll: async (): Promise<Asset[]> => {
      // Currently using mock data, will connect to backend when implemented
      return mockAssets;
    },
  },

  // Vulnerability endpoints (to be implemented on backend)
  vulnerabilities: {
    getAll: async (): Promise<Vulnerability[]> => {
      // Currently using mock data, will connect to backend when implemented
      return mockVulnerabilities;
    },
  },
};

export default api;
