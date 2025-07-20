import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Tabs,
  Tab,
  Divider,
  useTheme,
  alpha,
  Chip,
  Fade,
  Tooltip,
  Typography,
  ButtonGroup,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as DownloadIcon,
  Dashboard as DashboardIcon,
  Memory as MemoryIcon,
  Apps as AppsIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Asset } from "../../../types/asset.types";
import AssetDetails from "../Details/AssetDetails";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import BaseDialog from "../../common/BaseDialog";

interface AssetDetailsDialogProps {
  open: boolean;
  asset: Asset | null;
  onClose: () => void;
  onExport: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

const AssetDetailsDialog: React.FC<AssetDetailsDialogProps> = ({
  open,
  asset,
  onClose,
  onExport,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);

  // Animate content when dialog opens
  useEffect(() => {
    if (open) {
      // Small delay for the animation to start after dialog opens
      const timer = setTimeout(() => {
        setAnimateIn(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
    }
  }, [open]);

  if (!asset) return null;

  const handleTabChange = (
    event: React.SyntheticEvent | null,
    newValue: number
  ) => {
    setTabValue(newValue);
  };

  const handleEditClick = () => {
    onClose();
    onEdit(asset);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setDeleteDialogOpen(false);
    onClose();
    onDelete(asset);
  };

  // Get health score color
  const getHealthScoreColor = (score?: number) => {
    if (!score) return theme.palette.grey[500];
    if (score >= 80) return theme.palette.success.main;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Create a title for the dialog with asset status
  const dialogTitle = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <span>Asset Details</span>
      <Chip
        label={asset.status}
        color={asset.status === "active" ? "success" : "default"}
        size="small"
        sx={{ height: 20, fontSize: "0.7rem" }}
      />
      {asset.healthScore && (
        <Tooltip title="Health Score">
          <Chip
            icon={<SecurityIcon sx={{ fontSize: "0.9rem !important" }} />}
            label={`${asset.healthScore}%`}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.7rem",
              bgcolor: alpha(getHealthScoreColor(asset.healthScore), 0.1),
              color: getHealthScoreColor(asset.healthScore),
              borderColor: getHealthScoreColor(asset.healthScore),
              "& .MuiChip-icon": {
                color: getHealthScoreColor(asset.healthScore),
              },
            }}
            variant="outlined"
          />
        </Tooltip>
      )}
    </Box>
  );

  // Create custom content for the dialog
  const customContent = (
    <Fade in={animateIn} timeout={500}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, mt: 1 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="asset details tabs"
            sx={{
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab
              icon={<DashboardIcon fontSize="small" />}
              iconPosition="start"
              label="Overview"
              sx={{
                minHeight: 48,
                transition: "all 0.2s",
                "&.Mui-selected": {
                  color: "primary.main",
                  fontWeight: "bold",
                },
              }}
            />
            <Tab
              icon={<MemoryIcon fontSize="small" />}
              iconPosition="start"
              label="Services"
              sx={{
                minHeight: 48,
                transition: "all 0.2s",
                "&.Mui-selected": {
                  color: "primary.main",
                  fontWeight: "bold",
                },
              }}
            />
            <Tab
              icon={<AppsIcon fontSize="small" />}
              iconPosition="start"
              label="Applications"
              sx={{
                minHeight: 48,
                transition: "all 0.2s",
                "&.Mui-selected": {
                  color: "primary.main",
                  fontWeight: "bold",
                },
              }}
            />
          </Tabs>
        </Box>

        <Box sx={{ overflow: "auto", flex: 1, padding: "16px 0" }}>
          {tabValue === 0 && (
            <AssetDetails
              asset={asset}
              onClose={onClose}
              onExport={onExport}
              view="overview"
              onTabChange={handleTabChange}
            />
          )}

          {tabValue === 1 && (
            <AssetDetails
              asset={asset}
              onClose={onClose}
              onExport={onExport}
              view="services"
              onTabChange={handleTabChange}
            />
          )}

          {tabValue === 2 && (
            <AssetDetails
              asset={asset}
              onClose={onClose}
              onExport={onExport}
              view="applications"
              onTabChange={handleTabChange}
            />
          )}
        </Box>

        <Divider />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
          }}
        >
          <Box>
            <Tooltip title="Last updated">
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <InfoIcon fontSize="inherit" />
                {asset.lastUpdated
                  ? `Updated: ${new Date(asset.lastUpdated).toLocaleString()}`
                  : `Scanned: ${new Date(asset.lastScan).toLocaleString()}`}
              </Typography>
            </Tooltip>
          </Box>

          {/* Streamlined action buttons */}
          <ButtonGroup
            variant="outlined"
            size="small"
            aria-label="asset actions"
          >
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => onExport(asset)}
              color="primary"
              sx={{
                borderRadius: "4px 0 0 4px",
                transition: "all 0.2s",
              }}
            >
              Export
            </Button>
            <Button
              startIcon={<EditIcon />}
              onClick={handleEditClick}
              color="primary"
              sx={{
                transition: "all 0.2s",
              }}
            >
              Edit
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
              color="error"
              sx={{
                borderRadius: "0 4px 4px 0",
                transition: "all 0.2s",
              }}
            >
              Delete
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
    </Fade>
  );

  return (
    <>
      <BaseDialog
        isOpen={open}
        title={dialogTitle}
        body=""
        primaryLabel="Close"
        onPrimary={onClose}
        onCancel={onClose}
        preLabel={asset.hostname}
        mode="default"
        size="lg"
        maxHeightPercentage={80}
        showSecondaryButton={false}
      >
        {customContent}
      </BaseDialog>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        asset={asset}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default AssetDetailsDialog;
