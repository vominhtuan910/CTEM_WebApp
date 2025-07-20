import { useState, useEffect } from "react";
import { Asset, AssetFilter, Service } from "../../types/asset.types";
import { mockAssets } from "../../data/mockAssets";
import toast from "react-hot-toast";
import { api } from "../../services/api";

interface AddressType {
  $: {
    addr: string;
    addrtype: string;
  };
}

interface PortType {
  $: {
    portid: string;
    protocol: string;
  };
  state: {
    $: {
      state: string;
    };
  };
  service: {
    $: {
      name: string;
      product?: string;
    };
  };
}

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch assets when the component mounts
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      // First try to get real data from the backend
      try {
        // Get port scan data
        const portData = await api.scan.getPorts();

        if (portData && portData.nmaprun && portData.nmaprun.host) {
          // Convert port scan data to Asset format
          const scanAssets = await convertPortDataToAssets(portData);

          if (scanAssets.length > 0) {
            setAssets(scanAssets);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.warn(
          "Could not fetch real asset data, falling back to mock data:",
          error
        );
      }

      // Fallback to mock data if API fails
      setAssets(mockAssets);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Failed to load assets");
      setLoading(false);
    }
  };

  // Helper function to convert port scan data to Asset format
  const convertPortDataToAssets = async (portData: any): Promise<Asset[]> => {
    try {
      // Try to get system info for more details
      let systemInfo = null;
      try {
        systemInfo = await api.scan.getSystemInfo();
      } catch (error) {
        console.warn("Could not fetch system info:", error);
      }

      const host = portData.nmaprun.host;
      if (!host) return [];

      // Get host details
      const hostAddress = Array.isArray(host.address)
        ? host.address.find((addr: AddressType) => addr.$.addrtype === "ipv4")
            ?.$.addr
        : host.address?.$.addr;

      if (!hostAddress) return [];

      // Get hostname
      const hostname =
        host.hostnames?.hostname?.$.name ||
        systemInfo?.hostname ||
        `host-${hostAddress.replace(/\./g, "-")}`;

      // Get OS details
      const osInfo = host.os?.osmatch?.[0] || {};
      const osName = osInfo.$.name || "Unknown";
      const osAccuracy = osInfo.$.accuracy || "Unknown";

      // Get ports
      const ports = Array.isArray(host.ports?.port)
        ? host.ports.port
        : host.ports?.port
        ? [host.ports.port]
        : [];

      // Convert to services
      const services: Service[] = ports.map((port: PortType) => ({
        name: port.service?.$.name || "unknown",
        displayName:
          port.service?.$.product || port.service?.$.name || "Unknown Service",
        status: port.state?.$.state === "open" ? "running" : "stopped",
        startType: "automatic",
        pid: undefined,
        port: parseInt(port.$.portid, 10),
      }));

      // Create asset object
      const asset: Asset = {
        id: `scan-${Date.now()}`,
        hostname,
        ipAddress: hostAddress,
        status: "active",
        lastScan: new Date().toISOString(),
        os: {
          name: osName,
          version: osInfo.$.osclass?.[0]?.$.osfamily || "Unknown",
          architecture: osInfo.$.osclass?.[0]?.$.osgen || "x64",
          buildNumber: osAccuracy,
          lastBootTime: new Date().toISOString(),
        },
        services,
        applications: [],
        healthScore: 85,
        issuesCount: services.length > 3 ? 2 : 0,
      };

      return [asset];
    } catch (error) {
      console.error("Error converting port data to assets:", error);
      return [];
    }
  };

  const addAsset = async (assetData: Partial<Asset>): Promise<boolean> => {
    try {
      setSubmitting(true);
      // Simulate API call
      const newAsset: Asset = {
        ...(assetData as Asset),
        id: (assets.length + 1).toString(),
        lastScan: new Date().toISOString(),
      };

      setAssets((prevAssets) => [...prevAssets, newAsset]);
      toast.success("Asset added successfully");
      return true;
    } catch (error) {
      toast.error("Failed to add asset");
      console.error("Error adding asset:", error);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateAsset = async (
    id: string,
    assetData: Partial<Asset>
  ): Promise<boolean> => {
    try {
      setSubmitting(true);
      // Simulate API call
      const existingAsset = assets.find((asset) => asset.id === id);

      if (!existingAsset) {
        throw new Error("Asset not found");
      }

      const updatedAsset: Asset = {
        ...existingAsset,
        ...assetData,
        lastScan: new Date().toISOString(),
      };

      setAssets((prevAssets) =>
        prevAssets.map((asset) => (asset.id === id ? updatedAsset : asset))
      );

      toast.success("Asset updated successfully");
      return true;
    } catch (error) {
      toast.error("Failed to update asset");
      console.error("Error updating asset:", error);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAsset = async (id: string): Promise<boolean> => {
    try {
      // Simulate API call
      setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== id));
      toast.success("Asset deleted successfully");
      return true;
    } catch (error) {
      toast.error("Failed to delete asset");
      console.error("Error deleting asset:", error);
      return false;
    }
  };

  const filterAssets = (assets: Asset[], filters: AssetFilter): Asset[] => {
    return assets.filter((asset) => {
      const matchesSearch =
        !filters.search ||
        asset.hostname.toLowerCase().includes(filters.search.toLowerCase()) ||
        asset.ipAddress.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus =
        filters.status.length === 0 || filters.status.includes(asset.status);

      const matchesOsType =
        filters.osType.length === 0 || filters.osType.includes(asset.os.name);

      return matchesSearch && matchesStatus && matchesOsType;
    });
  };

  return {
    assets,
    loading,
    submitting,
    fetchAssets,
    addAsset,
    updateAsset,
    deleteAsset,
    filterAssets,
  };
};
