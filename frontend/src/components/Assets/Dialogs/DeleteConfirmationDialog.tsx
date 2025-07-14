import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { Asset } from "../../../types/asset.types";
import { dialogStyles } from "../../../utils/assets/assetStyles";

interface DeleteConfirmationDialogProps {
  open: boolean;
  asset: Asset | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  asset,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!asset) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: dialogStyles.paper,
        },
      }}
    >
      <DialogTitle sx={dialogStyles.title}>
        <Typography variant="h6">Delete Asset</Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={dialogStyles.closeButton}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={dialogStyles.content}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <WarningIcon color="error" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h6">Confirm Deletion</Typography>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to delete {asset.hostname}? This action
              cannot be undone.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isDeleting}
          sx={{ borderRadius: 2, minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isDeleting}
          sx={{ borderRadius: 2, minWidth: 100 }}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
