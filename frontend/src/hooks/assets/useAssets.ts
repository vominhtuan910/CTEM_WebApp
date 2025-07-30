import { useState, useEffect, useCallback } from "react";
import { Asset, AssetFilter } from "../../types/asset.types";
import { assetApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { transformBackendAssetsResponse } from "../../utils/assetTransform";

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<AssetFilter>({
    search: "",
    status: ["active", "inactive"],
    osType: [],
  });
  const [availableOsTypes, setAvailableOsTypes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch assets from the API
  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await assetApi.getAll();
      // Transform backend response to frontend format
      const assetsData = transformBackendAssetsResponse(response);
      setAssets(assetsData);

      // Extract unique OS types for filtering
      const osTypes = [
        ...new Set(assetsData.map((asset: Asset) => asset.os.name)),
      ].filter(Boolean) as string[];
      setAvailableOsTypes(osTypes);

      // Apply any existing filters
      const filtered = filterAssets(assetsData, filters);
      setFilteredAssets(filtered);
    } catch (err) {
      console.error("Error fetching assets:", err);
      setError(err as Error);
      toast.error("Failed to load assets");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Add a new asset
  const addAsset = async (assetData: Partial<Asset>): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await assetApi.create(assetData);
      toast.success("Asset created successfully");
      fetchAssets(); // Refresh the asset list
      return true;
    } catch (err) {
      console.error("Error adding asset:", err);
      toast.error("Failed to create asset");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update an existing asset
  const updateAsset = async (
    id: string,
    assetData: Partial<Asset>
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await assetApi.update(id, assetData);
      toast.success("Asset updated successfully");
      fetchAssets(); // Refresh the asset list
      return true;
    } catch (err) {
      console.error("Error updating asset:", err);
      toast.error("Failed to update asset");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete an asset
  const deleteAsset = async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await assetApi.delete(id);
      toast.success("Asset deleted successfully");
      fetchAssets(); // Refresh the asset list
      return true;
    } catch (err) {
      console.error("Error deleting asset:", err);
      toast.error("Failed to delete asset");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter assets based on search, status, and OS type
  const filterAssets = (assets: Asset[], filters: AssetFilter): Asset[] => {
    return assets.filter((asset) => {
      // Filter by search term
      const searchMatch =
        !filters.search ||
        asset.hostname.toLowerCase().includes(filters.search.toLowerCase()) ||
        asset.ipAddress.toLowerCase().includes(filters.search.toLowerCase()) ||
        (asset.name &&
          asset.name.toLowerCase().includes(filters.search.toLowerCase()));

      // Filter by status
      const statusMatch =
        filters.status.length === 0 || filters.status.includes(asset.status);

      // Filter by OS type
      const osTypeMatch =
        filters.osType.length === 0 || filters.osType.includes(asset.os.name);

      return searchMatch && statusMatch && osTypeMatch;
    });
  };

  // Update filters and re-filter assets
  const updateFilters = useCallback(
    (newFilters: Partial<AssetFilter>) => {
      setFilters((prev) => {
        const updated = { ...prev, ...newFilters };
        const filtered = filterAssets(assets, updated);
        setFilteredAssets(filtered);
        return updated;
      });
    },
    [assets]
  );

  // Initial fetch
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    filteredAssets,
    isLoading,
    error,
    filters,
    updateFilters,
    availableOsTypes,
    addAsset,
    updateAsset,
    deleteAsset,
    isSubmitting,
    refreshAssets: fetchAssets,
  };
};
