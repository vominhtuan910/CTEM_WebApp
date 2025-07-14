import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Button,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as DownloadIcon,
} from "@mui/icons-material";
import { Asset } from "../../../types/asset.types";
import AssetDetails from "../Details/AssetDetails";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { dialogStyles } from "../../../utils/assets/assetStyles";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!asset) return null;

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

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: dialogStyles.paper,
          },
          backdrop: {
            sx: {
              transition: "background-color 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            },
          },
          root: {
            sx: {
              transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            },
          },
        }}
        sx={{
          "& .MuiDialog-paper": {
            transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          },
        }}
      >
        <DialogTitle sx={dialogStyles.title}>
          <Typography variant="h6">Asset Details</Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={dialogStyles.closeButton}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={dialogStyles.content}>
          <AssetDetails asset={asset} onClose={onClose} onExport={onExport} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 3,
              pt: 3,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
              sx={{ borderRadius: 2, minWidth: 120 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
              sx={{ borderRadius: 2, minWidth: 120 }}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => onExport(asset)}
              sx={{ borderRadius: 2, minWidth: 120 }}
            >
              Download
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

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
