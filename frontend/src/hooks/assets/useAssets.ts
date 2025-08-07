import { useState, useEffect, useCallback } from "react";
import { Asset } from "../../types/asset.types";
import { assetApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { transformBackendAssetsResponse } from "../../utils/assetTransform";

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
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
    } catch (err) {
      console.error("Error fetching assets:", err);
      setError(err as Error);
      toast.error("Failed to load assets");
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  // Clear all assets
  const clearAllAssets = async (): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await assetApi.clearAll();

      if (response.success) {
        // Clear the local state
        setAssets([]);

        // Show success message with count
        const deletedCount = response.deleted_count || 0;
        if (deletedCount > 0) {
          toast.success(
            `Successfully deleted ${deletedCount} asset${
              deletedCount > 1 ? "s" : ""
            }`
          );
        } else {
          toast.success("No assets to delete");
        }

        return true;
      } else {
        toast.error(response.message || "Failed to clear assets");
        return false;
      }
    } catch (err) {
      console.error("Error clearing all assets:", err);
      toast.error("Failed to clear all assets");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    isLoading,
    error,
    addAsset,
    updateAsset,
    deleteAsset,
    clearAllAssets,
    isSubmitting,
    refreshAssets: fetchAssets,
  };
};
