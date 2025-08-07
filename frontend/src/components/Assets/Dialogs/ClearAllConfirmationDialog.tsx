import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import {
  Warning as WarningIcon,
  DeleteSweep as DeleteSweepIcon,
} from "@mui/icons-material";

interface ClearAllConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  assetCount: number;
  isSubmitting?: boolean;
}

const ClearAllConfirmationDialog: React.FC<ClearAllConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  assetCount,
  isSubmitting = false,
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const success = await onConfirm();
      if (success) {
        handleClose();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isProcessing) return; // Prevent closing while processing
    setConfirmed(false);
    onClose();
  };

  const isLoading = isSubmitting || isProcessing;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <DeleteSweepIcon color="error" />
          <Typography variant="h6" component="span">
            Clear All Assets
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon />
            <Typography variant="body2" fontWeight="medium">
              This action cannot be undone!
            </Typography>
          </Box>
        </Alert>

        <Typography variant="body1" gutterBottom>
          You are about to delete{" "}
          <strong>
            {assetCount === 0
              ? "all assets"
              : `${assetCount} asset${assetCount > 1 ? "s" : ""}`}
          </strong>{" "}
          and all their related data including:
        </Typography>

        <Box component="ul" sx={{ mt: 1, mb: 2, pl: 2 }}>
          <Typography component="li" variant="body2" color="text.secondary">
            All scan results (Nmap, OpenVAS)
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            All vulnerability findings
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            All asset metadata and history
          </Typography>
        </Box>

        {assetCount === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              No assets found in the database. This operation will have no
              effect.
            </Typography>
          </Alert>
        ) : (
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                color="error"
                disabled={isLoading}
              />
            }
            label={
              <Typography variant="body2">
                I understand that this action is permanent and cannot be undone
              </Typography>
            }
            sx={{ mt: 1 }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isLoading} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={assetCount > 0 ? !confirmed || isLoading : isLoading}
          variant="contained"
          color="error"
          startIcon={
            isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DeleteSweepIcon />
            )
          }
        >
          {isLoading
            ? "Clearing..."
            : assetCount === 0
            ? "Clear All"
            : `Delete ${assetCount} Asset${assetCount > 1 ? "s" : ""}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClearAllConfirmationDialog;
