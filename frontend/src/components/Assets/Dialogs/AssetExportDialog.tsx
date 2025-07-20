import React from "react";
import {
  Typography,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Asset } from "../../../types/asset.types";
import BaseDialog from "../../common/BaseDialog";

interface AssetExportDialogProps {
  open: boolean;
  asset: Asset | null;
  options: {
    services: boolean;
    applications: boolean;
  };
  onClose: () => void;
  onExport: () => void;
  onOptionsChange: (
    options: Partial<{ services: boolean; applications: boolean }>
  ) => void;
}

const AssetExportDialog: React.FC<AssetExportDialogProps> = ({
  open,
  asset,
  options,
  onClose,
  onExport,
  onOptionsChange,
}) => {
  if (!asset) return null;

  // Create a formatted body text with the export options
  const bodyText = `Select the data you want to export from ${asset.hostname}:

To include services: ${options.services ? "✓" : "□"}
To include applications: ${options.applications ? "✓" : "□"}

You can toggle these options in the export settings.`;

  // Impact points to highlight what will be exported
  const impactPoints = [];
  if (options.services) {
    impactPoints.push("Services and their status will be exported");
  }
  if (options.applications) {
    impactPoints.push("Applications and their versions will be exported");
  }
  if (impactPoints.length === 0) {
    impactPoints.push("Select at least one option to enable export");
  }

  // Since we can't use children in the new BaseDialog, we'll need to create a separate
  // dialog for the export options selection and another for confirmation.
  // For now, we'll just show the confirmation dialog with the selected options.

  return (
    <BaseDialog
      isOpen={open}
      title="Export Host Data"
      body={bodyText}
      impactPoints={impactPoints}
      primaryLabel="Export"
      secondaryLabel="Cancel"
      onPrimary={onExport}
      onCancel={onClose}
      mode="default"
      showSecondaryButton={false}
    />
  );
};

export default AssetExportDialog;
