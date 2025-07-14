import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  CircularProgress,
  Container,
  alpha,
} from "@mui/material";
import {
  GridView,
  List,
  Add,
  CloudUpload,
  FileDownload,
} from "@mui/icons-material";
import {
  AssetCard,
  AssetFilters,
  AssetFormDialog,
  AssetDetailsDialog,
  AssetExportDialog,
  ImportDialog,
  DeleteConfirmationDialog,
} from "../components/Assets";
import { Asset, AssetFilter } from "../types/asset.types";
import { useAssets, useAssetExport } from "../hooks/assets";
import toast from "react-hot-toast";

const Assets = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [filters, setFilters] = useState<AssetFilter>({
    search: "",
    status: [],
    osType: [],
  });

  const [openDialog, setOpenDialog] = useState<
    "add" | "import" | "view" | "edit" | "delete" | null
  >(null);

  // Available filter options (would come from API in real app)
  const availableOsTypes = ["Windows", "Ubuntu", "macOS"];

  // Hooks
  const {
    assets,
    loading,
    submitting,
    addAsset,
    updateAsset,
    deleteAsset,
    filterAssets,
  } = useAssets();

  const {
    exportDialog,
    openExportDialog,
    closeExportDialog,
    updateExportOptions,
    exportAssetData,
  } = useAssetExport();

  // Filtered assets based on applied filters
  const filteredAssets = filterAssets(assets, filters);

  // Event handlers
  const handleAssetAction = async (
    action: "view" | "edit" | "delete",
    asset: Asset
  ) => {
    setSelectedAsset(asset);
    switch (action) {
      case "view":
        setOpenDialog("view");
        break;
      case "edit":
        setOpenDialog("edit");
        break;
      case "delete":
        setOpenDialog("delete");
        break;
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedAsset) {
      const success = await deleteAsset(selectedAsset.id);
      if (success) {
        toast.success(`Successfully deleted asset: ${selectedAsset.hostname}`);
      }
      setOpenDialog(null);
      setSelectedAsset(null);
    }
  };

  const handleAddAsset = async (assetData: Partial<Asset>) => {
    const success = await addAsset(assetData);
    if (success) {
      setOpenDialog(null);
    }
  };

  const handleEditAsset = async (assetData: Partial<Asset>) => {
    if (!selectedAsset) return;
    const success = await updateAsset(selectedAsset.id, assetData);
    if (success) {
      setOpenDialog(null);
      setSelectedAsset(null);
    }
  };

  const handleImportComplete = (data: any) => {
    console.log("Import completed with data:", data);
    toast.success(`Successfully imported ${data.importedCount} assets`);
  };

  const closeDialog = () => {
    setOpenDialog(null);
    setSelectedAsset(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "primary.main",
            fontWeight: 600,
          }}
        >
          Assets
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={() => toast.success("Export feature coming soon")}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => setOpenDialog("import")}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            Import
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog("add")}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              boxShadow: 2,
              "&:hover": { boxShadow: 4 },
            }}
          >
            Add Asset
          </Button>
        </Box>
      </Box>

      {/* Filters and View Toggle */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexWrap: { xs: "wrap", md: "nowrap" },
          }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <AssetFilters
              filters={filters}
              onFilterChange={setFilters}
              availableOsTypes={availableOsTypes}
            />
          </Box>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
            sx={{
              height: 40,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              "& .MuiToggleButton-root": {
                border: "none",
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                },
              },
            }}
          >
            <ToggleButton value="grid">
              <GridView />
            </ToggleButton>
            <ToggleButton value="list">
              <List />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Asset Grid/List */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 400,
          }}
        >
          <CircularProgress />
        </Box>
      ) : filteredAssets.length === 0 ? (
        <Paper
          sx={{
            textAlign: "center",
            py: 8,
            px: 3,
            borderRadius: 3,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No assets found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Try adjusting your filters or adding new assets.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog("add")}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              boxShadow: 2,
              "&:hover": { boxShadow: 4 },
            }}
          >
            Add Asset
          </Button>
        </Paper>
      ) : (
        <Box
          sx={{
            ...(viewMode === "grid"
              ? {
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                    xl: "repeat(4, 1fr)",
                  },
                }
              : {
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }),
          }}
        >
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onView={(asset) => handleAssetAction("view", asset)}
              onEdit={(asset) => handleAssetAction("edit", asset)}
              onDelete={(asset) => handleAssetAction("delete", asset)}
              onExport={openExportDialog}
              viewMode={viewMode}
            />
          ))}
        </Box>
      )}

      {/* Add/Edit Asset Dialog */}
      <AssetFormDialog
        open={openDialog === "add" || openDialog === "edit"}
        type={openDialog === "add" ? "add" : "edit"}
        asset={selectedAsset || undefined}
        onClose={closeDialog}
        onSubmit={openDialog === "add" ? handleAddAsset : handleEditAsset}
        isSubmitting={submitting}
      />

      {/* View Asset Dialog */}
      <AssetDetailsDialog
        open={openDialog === "view" && selectedAsset !== null}
        asset={selectedAsset}
        onClose={closeDialog}
        onExport={openExportDialog}
        onEdit={(asset) => handleAssetAction("edit", asset)}
        onDelete={(asset) => handleAssetAction("delete", asset)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={openDialog === "delete" && selectedAsset !== null}
        asset={selectedAsset}
        onClose={closeDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={submitting}
      />

      {/* Export Dialog */}
      <AssetExportDialog
        open={exportDialog.open}
        asset={exportDialog.asset}
        options={exportDialog.options}
        onClose={closeExportDialog}
        onExport={exportAssetData}
        onOptionsChange={updateExportOptions}
      />

      {/* Import Dialog Component */}
      <ImportDialog
        open={openDialog === "import"}
        onClose={closeDialog}
        onImportComplete={handleImportComplete}
      />
    </Container>
  );
};

export default Assets;
