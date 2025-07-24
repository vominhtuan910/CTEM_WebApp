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
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from "@mui/icons-material";
import AssetCard from "../components/Assets/Cards/AssetCard";
import AssetFormDialog from "../components/Assets/Dialogs/AssetFormDialog";
import DeleteConfirmationDialog from "../components/Assets/Dialogs/DeleteConfirmationDialog";
import AssetDetailsDialog from "../components/Assets/Dialogs/AssetDetailsDialog";
import AssetExportDialog from "../components/Assets/Dialogs/AssetExportDialog";
import ScanDialog from "../components/Assets/Dialogs/ScanDialog";
import AssetFilters from "../components/Assets/Filters/AssetFilters";
import { Asset } from "../types/asset.types";
import { useAssets } from "../hooks/assets/useAssets";
import { useAssetExport } from "../hooks/assets/useAssetExport";
import { toast } from "react-hot-toast";

const Assets = () => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [dialogState, setDialogState] = useState<{
    add: boolean;
    edit: boolean;
    delete: boolean;
    details: boolean;
    scan: boolean;
  }>({
    add: false,
    edit: false,
    delete: false,
    details: false,
    scan: false,
  });
  const [importFile, setImportFile] = useState<File | null>(null);

  // Use our custom hooks
  const {
    assets,
    filteredAssets,
    isLoading,
    filters,
    updateFilters,
    availableOsTypes,
    addAsset,
    updateAsset,
    deleteAsset,
    isSubmitting,
    refreshAssets,
  } = useAssets();

  const {
    exportDialogState,
    openExportDialog,
    closeExportDialog,
    updateExportOptions,
    exportAssetData,
  } = useAssetExport();

  // Handle scan completion
  const handleScanComplete = async (success: boolean, data?: any) => {
    if (success && data) {
      toast.success("Scan completed successfully");

      // If we have a saved asset from the scan, refresh the asset list
      if (data.savedAsset) {
        await refreshAssets();
      }
    } else {
      toast.error("Scan failed");
    }
  };

  // Handle asset actions (view, edit, delete)
  const handleAssetAction = async (
    action: "view" | "edit" | "delete" | "export",
    asset: Asset
  ) => {
    setSelectedAsset(asset);
    if (action === "view") {
      setDialogState({ ...dialogState, details: true });
    } else if (action === "edit") {
      setDialogState({ ...dialogState, edit: true });
    } else if (action === "delete") {
      setDialogState({ ...dialogState, delete: true });
    } else if (action === "export") {
      openExportDialog(asset);
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

  // Handle edit asset
  const handleEditAsset = async (assetData: Partial<Asset>) => {
    if (selectedAsset) {
      const success = await updateAsset(selectedAsset.id, assetData);
      if (success) {
        setDialogState({ ...dialogState, edit: false });
        setSelectedAsset(null);
      }
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
      edit: false,
      delete: false,
      details: false,
      scan: false,
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
            startIcon={<RefreshIcon />}
            onClick={() => refreshAssets()}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setDialogState({ ...dialogState, scan: true })}
          >
            Scan
          </Button>
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
        <AssetFilters
          filters={filters}
          onFilterChange={updateFilters}
          availableOsTypes={availableOsTypes}
        />
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
      ) : filteredAssets.length === 0 ? (
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
          <Typography variant="body2" color="text.secondary" paragraph>
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
            Scan Network
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredAssets.map((asset) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={asset.id}>
              <AssetCard
                asset={asset}
                viewMode={viewMode}
                onView={(asset) => handleAssetAction("view", asset)}
                onEdit={(asset) => handleAssetAction("edit", asset)}
                onDelete={(asset) => handleAssetAction("delete", asset)}
                onExport={(asset) => handleAssetAction("export", asset)}
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
          <AssetFormDialog
            open={dialogState.edit}
            type="edit"
            asset={selectedAsset}
            onClose={closeDialog}
            onSubmit={handleEditAsset}
            isSubmitting={isSubmitting}
          />

          <DeleteConfirmationDialog
            open={dialogState.delete}
            asset={selectedAsset}
            onClose={closeDialog}
            onConfirm={handleConfirmDelete}
            isDeleting={isSubmitting}
          />

          <AssetDetailsDialog
            open={dialogState.details}
            asset={selectedAsset}
            onClose={closeDialog}
            onExport={(asset) => handleAssetAction("export", asset)}
            onEdit={(asset) => handleAssetAction("edit", asset)}
            onDelete={(asset) => handleAssetAction("delete", asset)}
          />
        </>
      )}

      <AssetExportDialog
        open={exportDialogState.open}
        asset={exportDialogState.asset}
        options={exportDialogState.options}
        onClose={closeExportDialog}
        onExport={exportAssetData}
        onOptionsChange={updateExportOptions}
      />

      <ScanDialog
        open={dialogState.scan}
        onClose={closeDialog}
        onScanComplete={handleScanComplete}
      />
    </Box>
  );
};

export default Assets;
