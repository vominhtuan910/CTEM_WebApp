import { useState, useEffect } from "react";
import { Asset, AssetFilter } from "../../types/asset.types";
import { mockAssets } from "../../data/mockAssets";
import toast from "react-hot-toast";

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Simulate API call with mock data
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      setTimeout(() => {
        setAssets(mockAssets);
        setLoading(false);
      }, 1000); // Simulate network delay
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Failed to load assets");
      setLoading(false);
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
