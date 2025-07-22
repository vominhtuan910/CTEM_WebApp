import { useState, useEffect } from "react";
import { Asset, AssetFilter } from "../../types/asset.types";
import toast from "react-hot-toast";
import { api } from "../../services/api";

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableOsTypes, setAvailableOsTypes] = useState<string[]>([]);

  useEffect(() => {
    // Fetch assets when the component mounts
    fetchAssets();
    fetchOsTypes();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const data = await api.assets.getAll();
      setAssets(data);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  const fetchOsTypes = async () => {
    try {
      const osTypes = await api.assets.getOsTypes();
      setAvailableOsTypes(osTypes);
    } catch (error) {
      console.error("Error fetching OS types:", error);
      // Fallback to default OS types
      setAvailableOsTypes(["Windows", "Linux", "macOS"]);
    }
  };

  const addAsset = async (assetData: Partial<Asset>): Promise<boolean> => {
    try {
      setSubmitting(true);
      const newAsset = await api.assets.create(assetData);
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
      const updatedAsset = await api.assets.update(id, assetData);

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
      setSubmitting(true);
      await api.assets.delete(id);
      setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== id));
      toast.success("Asset deleted successfully");
      return true;
    } catch (error) {
      toast.error("Failed to delete asset");
      console.error("Error deleting asset:", error);
      return false;
    } finally {
      setSubmitting(false);
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
        filters.osType.length === 0 ||
        (asset.os && filters.osType.includes(asset.os.name));

      return matchesSearch && matchesStatus && matchesOsType;
    });
  };

  return {
    assets,
    loading,
    submitting,
    availableOsTypes,
    fetchAssets,
    addAsset,
    updateAsset,
    deleteAsset,
    filterAssets,
  };
};
