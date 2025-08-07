import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  useTheme,
  alpha,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  DeleteSweep as DeleteSweepIcon,
} from "@mui/icons-material";
import AssetCard from "../components/Assets/Cards/AssetCard";
import AssetFormDialog from "../components/Assets/Dialogs/AssetFormDialog";
import DeleteConfirmationDialog from "../components/Assets/Dialogs/DeleteConfirmationDialog";
import ClearAllConfirmationDialog from "../components/Assets/Dialogs/ClearAllConfirmationDialog";

import ScanDialog from "../components/Assets/Dialogs/ScanDialog";
import { Asset } from "../types/asset.types";
import { useAssets } from "../hooks/assets/useAssets";

import { toast } from "react-hot-toast";

const Assets = () => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [dialogState, setDialogState] = useState<{
    add: boolean;
    delete: boolean;
    scan: boolean;
    clearAll: boolean;
  }>({
    add: false,
    delete: false,
    scan: false,
    clearAll: false,
  });
  const [importFile, setImportFile] = useState<File | null>(null);

  // Use our custom hooks
  const {
    assets,
    isLoading,
    addAsset,
    deleteAsset,
    clearAllAssets,
    isSubmitting,
    refreshAssets,
  } = useAssets();

  // Handle scan completion
  const handleScanComplete = async (success: boolean, data?: any) => {
    if (success && data) {
      // Create detailed success message
      const hostsFound = data.hostsFound || 0;
      const assetsAdded = data.assetsAdded || 0;

      let message = "Nmap scan completed successfully!";
      if (hostsFound > 0) {
        message += ` Found ${hostsFound} host${hostsFound > 1 ? "s" : ""}`;
        if (assetsAdded > 0) {
          message += `, added ${assetsAdded} new asset${
            assetsAdded > 1 ? "s" : ""
          } to inventory.`;
        } else {
          message += ` (no new assets added).`;
        }
      } else {
        message += " No hosts discovered on the target network.";
      }

      toast.success(message, {
        duration: 5000, // Show for 5 seconds
      });

      // Assets are automatically saved by the Nmap scan service
      // Always refresh the asset list after a successful scan
      await refreshAssets();
    } else {
      const errorMessage = data?.error || "Nmap scan failed";
      toast.error(errorMessage);
    }
  };

  // Handle asset actions (delete)
  const handleAssetAction = async (action: "delete", asset: Asset) => {
    setSelectedAsset(asset);
    if (action === "delete") {
      setDialogState({ ...dialogState, delete: true });
    }
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (selectedAsset) {
      const success = await deleteAsset(selectedAsset.id);
      if (success) {
        setDialogState({ ...dialogState, delete: false });
        setSelectedAsset(null);
      }
    }
  };

  // Handle add asset
  const handleAddAsset = async (assetData: Partial<Asset>) => {
    const success = await addAsset(assetData);
    if (success) {
      setDialogState({ ...dialogState, add: false });
      setImportFile(null);
    }
  };

  // Handle import file
  const handleImportFile = (file: File) => {
    setImportFile(file);
  };

  // Close all dialogs
  const closeDialog = () => {
    setDialogState({
      add: false,
      delete: false,
      scan: false,
      clearAll: false,
    });
    setSelectedAsset(null);
    setImportFile(null);
  };

  // Render asset stats
  const renderAssetStats = () => {
    const totalAssets = assets.length;
    const activeAssets = assets.filter(
      (asset) => asset.status === "active"
    ).length;
    const inactiveAssets = totalAssets - activeAssets;

    return (
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: "100%",
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              borderLeft: `4px solid ${theme.palette.primary.main}`,
            }}
          >
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Total Assets
              </Typography>
              <Typography variant="h4">{totalAssets}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: "100%",
              backgroundColor: alpha(theme.palette.success.main, 0.05),
              borderLeft: `4px solid ${theme.palette.success.main}`,
            }}
          >
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Active Assets
              </Typography>
              <Typography variant="h4">{activeAssets}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: "100%",
              backgroundColor: alpha(theme.palette.error.main, 0.05),
              borderLeft: `4px solid ${theme.palette.error.main}`,
            }}
          >
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Inactive Assets
              </Typography>
              <Typography variant="h4">{inactiveAssets}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Assets
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogState({ ...dialogState, add: true })}
            sx={{ mr: 1 }}
          >
            Import Asset
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setDialogState({ ...dialogState, scan: true })}
            sx={{ mr: 1 }}
          >
            Scan
          </Button>
          {assets.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteSweepIcon />}
              onClick={() => setDialogState({ ...dialogState, clearAll: true })}
              disabled={isSubmitting}
            >
              Clear All
            </Button>
          )}
        </Box>
      </Box>

      {/* Asset Stats */}
      {renderAssetStats()}

      {/* Filters and View Toggle */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Tooltip title="Grid View">
            <IconButton
              color={viewMode === "grid" ? "primary" : "default"}
              onClick={() => setViewMode("grid")}
            >
              <ViewModuleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="List View">
            <IconButton
              color={viewMode === "list" ? "primary" : "default"}
              onClick={() => setViewMode("list")}
            >
              <ViewListIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Asset Grid/List */}
      {isLoading ? (
        <Typography>Loading assets...</Typography>
      ) : assets.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            No assets found
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            component="p"
            gutterBottom
          >
            Import assets from a file or scan your network to discover assets
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogState({ ...dialogState, add: true })}
            sx={{ mr: 2 }}
          >
            Import Asset
          </Button>
          <Button
            variant="outlined"
            onClick={() => setDialogState({ ...dialogState, scan: true })}
          >
            Nmap Scan
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {assets.map((asset) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={asset.id}>
              <AssetCard
                asset={asset}
                viewMode={viewMode}
                onDelete={(asset) => handleAssetAction("delete", asset)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialogs */}
      <AssetFormDialog
        open={dialogState.add}
        type="add"
        onClose={closeDialog}
        onSubmit={handleAddAsset}
        isSubmitting={isSubmitting}
        importFile={importFile}
        onImportFile={handleImportFile}
      />

      {selectedAsset && (
        <>
          <DeleteConfirmationDialog
            open={dialogState.delete}
            asset={selectedAsset}
            onClose={closeDialog}
            onConfirm={handleConfirmDelete}
            isDeleting={isSubmitting}
          />
        </>
      )}

      <ScanDialog
        open={dialogState.scan}
        onClose={closeDialog}
        onScanComplete={handleScanComplete}
      />

      <ClearAllConfirmationDialog
        open={dialogState.clearAll}
        onClose={closeDialog}
        onConfirm={clearAllAssets}
        assetCount={assets.length}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
};

export default Assets;
