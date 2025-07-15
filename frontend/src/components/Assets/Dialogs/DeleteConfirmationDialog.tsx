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
import { alpha } from "@mui/material/styles";

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
      maxWidth="xs"
      fullWidth={false}
      slotProps={{
        paper: {
          sx: {
            ...dialogStyles.paper,
            width: "auto",
            minWidth: "320px",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          ...dialogStyles.title,
          py: 1,
          px: 2,
          bgcolor: (theme) => alpha(theme.palette.info.main, 0.15),
          borderBottom: "1px solid",
          borderColor: (theme) => alpha(theme.palette.info.main, 0.25),
          color: "info.dark",
        }}
      >
        <Typography variant="h6" color="info.dark">
          Delete asset ?
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={dialogStyles.closeButton}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{ ...dialogStyles.content, "& .MuiBox-root": { p: 2 } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <WarningIcon color="error" sx={{ fontSize: 24, mt: 1 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
              Confirm Deletion
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to delete {asset.hostname}? This action
              cannot be undone.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isDeleting}
          sx={{ borderRadius: 2, minWidth: 70, px: 1.5 }}
          size="small"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isDeleting}
          sx={{ borderRadius: 2, minWidth: 70, px: 1.5 }}
          size="small"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
