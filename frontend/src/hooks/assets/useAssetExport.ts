import { useState } from "react";
import { Asset } from "../../types/asset.types";
import toast from "react-hot-toast";

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
  const [exportDialog, setExportDialog] = useState<ExportDialogState>({
    open: false,
    asset: null,
    options: {
      services: true,
      applications: true,
    },
  });

  const openExportDialog = (asset: Asset) => {
    setExportDialog({
      open: true,
      asset,
      options: {
        services: true,
        applications: true,
      },
    });
  };

  const closeExportDialog = () => {
    setExportDialog((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const updateExportOptions = (options: Partial<ExportOptions>) => {
    setExportDialog((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        ...options,
      },
    }));
  };

  const exportAssetData = () => {
    if (!exportDialog.asset) return false;

    const asset = exportDialog.asset;
    const { services, applications } = exportDialog.options;

    let exportData: any = {
      hostname: asset.hostname,
      ipAddress: asset.ipAddress,
      exportDate: new Date().toISOString(),
    };

    if (services) {
      exportData.services = asset.services.map((service) => ({
        name: service.name,
        status: service.status,
        port: service.port,
      }));
    }

    if (applications) {
      exportData.applications = asset.applications.map((app) => ({
        name: app.name,
        version: app.version,
        installDate: app.installDate,
      }));
    }

    // Convert to CSV or JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${asset.hostname}_export_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    closeExportDialog();
    toast.success("Export completed successfully");
    return true;
  };

  return {
    exportDialog,
    openExportDialog,
    closeExportDialog,
    updateExportOptions,
    exportAssetData,
  };
};
