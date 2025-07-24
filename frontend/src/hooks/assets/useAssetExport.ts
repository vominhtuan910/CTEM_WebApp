import { useState } from "react";
import { Asset } from "../../types/asset.types";
import { toast } from "react-hot-toast";

interface ExportOptions {
  services: boolean;
  applications: boolean;
}

interface ExportDialogState {
  open: boolean;
  asset: Asset | null;
  options: ExportOptions;
}

export const useAssetExport = () => {
  const [exportDialogState, setExportDialogState] = useState<ExportDialogState>(
    {
      open: false,
      asset: null,
      options: {
        services: true,
        applications: true,
      },
    }
  );

  // Open export dialog with selected asset
  const openExportDialog = (asset: Asset) => {
    setExportDialogState({
      open: true,
      asset,
      options: {
        services: true,
        applications: true,
      },
    });
  };

  // Close export dialog
  const closeExportDialog = () => {
    setExportDialogState({
      ...exportDialogState,
      open: false,
    });
  };

  // Update export options
  const updateExportOptions = (options: Partial<ExportOptions>) => {
    setExportDialogState({
      ...exportDialogState,
      options: {
        ...exportDialogState.options,
        ...options,
      },
    });
  };

  // Export asset data
  const exportAssetData = () => {
    if (!exportDialogState.asset) return false;

    try {
      const asset = exportDialogState.asset;
      const options = exportDialogState.options;

      // Create export data
      const exportData: any = {
        id: asset.id,
        hostname: asset.hostname,
        ipAddress: asset.ipAddress,
        status: asset.status,
        os: asset.os,
      };

      // Include services if selected
      if (options.services) {
        exportData.services = asset.services;
      }

      // Include applications if selected
      if (options.applications) {
        exportData.applications = asset.applications;
      }

      // Create a Blob with the data
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });

      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `asset_${asset.hostname}_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Asset data exported successfully`);
      closeExportDialog();
      return true;
    } catch (error) {
      console.error("Error exporting asset data:", error);
      toast.error("Failed to export asset data");
      return false;
    }
  };

  return {
    exportDialogState,
    openExportDialog,
    closeExportDialog,
    updateExportOptions,
    exportAssetData,
  };
};
