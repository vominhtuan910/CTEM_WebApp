import { Asset } from "../types/asset.types";

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

    getLatestScan: async (): Promise<any> => {
      const response = await fetch(`${API_URL}/scan/latest`);

      if (!response.ok) {
        throw new Error(
          `Failed to get latest scan results: ${response.statusText}`
        );
      }

      return response.json();
    },
  },

  // Asset endpoints
  assets: {
    getAll: async (filters?: {
      search?: string;
      status?: string[];
      osType?: string[];
    }): Promise<Asset[]> => {
      // Build query string from filters
      let queryString = "";
      if (filters) {
        const params = new URLSearchParams();

        if (filters.search) {
          params.append("search", filters.search);
        }

        if (filters.status && filters.status.length > 0) {
          filters.status.forEach((status) => params.append("status", status));
        }

        if (filters.osType && filters.osType.length > 0) {
          filters.osType.forEach((osType) => params.append("osType", osType));
        }

        queryString = params.toString();
      }

      const url = `${API_URL}/assets${queryString ? `?${queryString}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to get assets: ${response.statusText}`);
      }

      return response.json();
    },

    getById: async (id: string): Promise<Asset> => {
      const response = await fetch(`${API_URL}/assets/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to get asset: ${response.statusText}`);
      }

      return response.json();
    },

    create: async (asset: Partial<Asset>): Promise<Asset> => {
      const response = await fetch(`${API_URL}/assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(asset),
      });

      if (!response.ok) {
        throw new Error(`Failed to create asset: ${response.statusText}`);
      }

      return response.json();
    },

    update: async (id: string, asset: Partial<Asset>): Promise<Asset> => {
      const response = await fetch(`${API_URL}/assets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(asset),
      });

      if (!response.ok) {
        throw new Error(`Failed to update asset: ${response.statusText}`);
      }

      return response.json();
    },

    delete: async (id: string): Promise<boolean> => {
      const response = await fetch(`${API_URL}/assets/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete asset: ${response.statusText}`);
      }

      return true;
    },

    getOsTypes: async (): Promise<string[]> => {
      const response = await fetch(`${API_URL}/assets/os-types`);

      if (!response.ok) {
        throw new Error(`Failed to get OS types: ${response.statusText}`);
      }

      return response.json();
    },
  },
};

export default api;
