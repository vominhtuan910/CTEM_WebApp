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
  Tooltip,
  Grid,
  Card,
  CardContent,
  Divider,
  alpha,
  useTheme,
  Fab,
} from "@mui/material";
import {
  GridView,
  List,
  Add,
  CloudUpload,
  FileDownload,
  SecurityOutlined,
  Refresh,
  Search as SearchIcon,
} from "@mui/icons-material";
import AssetCard from "../components/Assets/Cards/AssetCard";
import AssetFilters from "../components/Assets/Filters/AssetFilters";
import AssetFormDialog from "../components/Assets/Dialogs/AssetFormDialog";
import AssetDetailsDialog from "../components/Assets/Dialogs/AssetDetailsDialog";
import AssetExportDialog from "../components/Assets/Dialogs/AssetExportDialog";
import ImportDialog from "../components/Assets/Dialogs/ImportDialog";
import DeleteConfirmationDialog from "../components/Assets/Dialogs/DeleteConfirmationDialog";
import ScanDialog from "../components/Assets/Dialogs/ScanDialog";
import { Asset, AssetFilter } from "../types/asset.types";
import { useAssets } from "../hooks/assets/useAssets";
import { useAssetExport } from "../hooks/assets/useAssetExport";
import toast from "react-hot-toast";
import { api } from "../services/api";

const Assets = () => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [filters, setFilters] = useState<AssetFilter>({
    search: "",
    status: [],
    osType: [],
  });
  const [isScanning, setIsScanning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [openDialog, setOpenDialog] = useState<
    "add" | "import" | "view" | "edit" | "delete" | "scan" | null
  >(null);

  // Hooks
  const {
    assets,
    loading,
    submitting,
    availableOsTypes,
    addAsset,
    updateAsset,
    deleteAsset,
    filterAssets,
    fetchAssets,
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

  // Scan for assets
  const handleScanAssets = async () => {
    setIsScanning(true);
    toast.loading("Scanning for assets...", { id: "scan-toast" });

    try {
      // Start a scan
      await api.scan.startScan("127.0.0.1");

      // Wait a moment for scan to complete
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Refresh assets
      await fetchAssets();

      toast.success("Scan completed successfully!", { id: "scan-toast" });
    } catch (error) {
      console.error("Scan failed:", error);
      toast.error("Scan failed. Please try again.", { id: "scan-toast" });
    } finally {
      setIsScanning(false);
    }
  };

  // Refresh assets
  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.loading("Refreshing assets...", { id: "refresh-toast" });

    try {
      await fetchAssets();
      toast.success("Assets refreshed successfully!", { id: "refresh-toast" });
    } catch (error) {
      console.error("Refresh failed:", error);
      toast.error("Failed to refresh assets.", { id: "refresh-toast" });
    } finally {
      setIsRefreshing(false);
    }
  };

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
    fetchAssets(); // Refresh assets after import
  };

  const closeDialog = () => {
    setOpenDialog(null);
    setSelectedAsset(null);
  };

  // Render asset statistics
  const renderAssetStats = () => {
    const activeAssets = assets.filter(
      (asset) => asset.status === "active"
    ).length;
    const inactiveAssets = assets.filter(
      (asset) => asset.status === "inactive"
    ).length;
    const totalServices = assets.reduce(
      (sum, asset) => sum + asset.services.length,
      0
    );
    const totalApplications = assets.reduce(
      (sum, asset) => sum + asset.applications.length,
      0
    );

    return (
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              transition: "all 0.2s",
              "&:hover": {
                boxShadow: 3,
                borderColor: "primary.main",
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h3"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                {assets.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Assets
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              transition: "all 0.2s",
              "&:hover": {
                boxShadow: 3,
                borderColor: "success.main",
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h3"
                sx={{ fontWeight: "bold", color: "success.main" }}
              >
                {activeAssets}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Assets
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              transition: "all 0.2s",
              "&:hover": {
                boxShadow: 3,
                borderColor:
                  theme.palette.mode === "light" ? "grey.500" : "grey.700",
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: "bold",
                  color:
                    theme.palette.mode === "light" ? "grey.700" : "grey.300",
                }}
              >
                {totalServices}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Services
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              transition: "all 0.2s",
              "&:hover": {
                boxShadow: 3,
                borderColor: "info.main",
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h3"
                sx={{ fontWeight: "bold", color: "info.main" }}
              >
                {totalApplications}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
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
          Assets Management
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Tooltip title="Refresh assets">
            <Button
              variant="outlined"
              color="info"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={isRefreshing}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                },
              }}
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </Tooltip>
          <Tooltip title="Scan network for assets">
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SecurityOutlined />}
              onClick={() => setOpenDialog("scan")}
              disabled={isScanning}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                boxShadow: 2,
                "&:hover": { boxShadow: 4 },
              }}
            >
              {isScanning ? "Scanning..." : "Scan"}
            </Button>
          </Tooltip>
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

      {/* Asset Statistics */}
      {!loading && assets.length > 0 && renderAssetStats()}

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
            Try adjusting your filters, adding new assets, or scanning your
            network.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SecurityOutlined />}
              onClick={() => setOpenDialog("scan")}
              sx={{
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Scan Network
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

      {/* Floating Action Button for scanning */}
      <Fab
        color="secondary"
        aria-label="scan"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          boxShadow: 3,
          "&:hover": {
            boxShadow: 6,
          },
        }}
        onClick={() => setOpenDialog("scan")}
      >
        <SecurityOutlined />
      </Fab>

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

      {/* Scan Dialog Component */}
      <ScanDialog
        open={openDialog === "scan"}
        onClose={closeDialog}
        onScanComplete={(success, data) => {
          if (success) {
            const assetsFound = data.assetsFound || 0;
            toast.success(
              `Scan completed! Found ${assetsFound} ${
                assetsFound === 1 ? "asset" : "assets"
              }.`
            );
            fetchAssets();
            // Only close dialog if scan was successful
            setOpenDialog(null);
          }
        }}
      />
    </Container>
  );
};

export default Assets;
