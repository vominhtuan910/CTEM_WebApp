import { useState } from "react";
import {
  Box,
  Button,
  Tabs,
  Tab,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as DownloadIcon,
  Dashboard as DashboardIcon,
  Memory as MemoryIcon,
  Apps as AppsIcon,
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`asset-tabpanel-${index}`}
      aria-labelledby={`asset-tab-${index}`}
      {...other}
      style={{ padding: "16px 0" }}
    >
      {value === index && children}
    </div>
  );
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

  if (!asset) return null;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
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

  // Create a title for the dialog
  const dialogTitle = "Asset Details";

  // Create a descriptive body text (optional since we're using custom content)
  const body = `Details for ${asset.hostname}`;

  // Create custom content for the dialog
  const customContent = (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, mt: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="asset details tabs"
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

      <TabPanel value={tabValue} index={0}>
        <AssetDetails
          asset={asset}
          onClose={onClose}
          onExport={onExport}
          view="overview"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <AssetDetails
          asset={asset}
          onClose={onClose}
          onExport={onExport}
          view="services"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <AssetDetails
          asset={asset}
          onClose={onClose}
          onExport={onExport}
          view="applications"
        />
      </TabPanel>

      <Divider />
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          p: 2,
          bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
        }}
      >
        <Button
          startIcon={<EditIcon />}
          onClick={handleEditClick}
          variant="outlined"
          color="primary"
          size="small"
        >
          Edit
        </Button>
        <Button
          startIcon={<DownloadIcon />}
          onClick={() => onExport(asset)}
          variant="outlined"
          color="primary"
          size="small"
        >
          Export
        </Button>
        <Button
          startIcon={<DeleteIcon />}
          onClick={handleDeleteClick}
          variant="outlined"
          color="error"
          size="small"
        >
          Delete
        </Button>
      </Box>
    </>
  );

  // The AssetDetailsDialog doesn't really use the primary/secondary buttons from BaseDialog
  // since it has its own action buttons in the content
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
