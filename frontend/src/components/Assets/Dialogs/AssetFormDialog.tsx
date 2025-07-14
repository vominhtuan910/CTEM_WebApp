import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Card,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Asset } from "../../../types/asset.types";
import AssetForm from "../Forms/AssetForm";
import { dialogStyles, sectionStyles } from "../../../utils/assets/assetStyles";

interface AssetFormDialogProps {
  open: boolean;
  type: "add" | "edit";
  asset?: Asset;
  onClose: () => void;
  onSubmit: (data: Partial<Asset>) => void;
  isSubmitting: boolean;
}

const AssetFormDialog: React.FC<AssetFormDialogProps> = ({
  open,
  type,
  asset,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const isAdd = type === "add";

  return (
    <Dialog
      open={open}
      onClose={() => !isSubmitting && onClose()}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: dialogStyles.paper,
      }}
      TransitionProps={{
        style: {
          transitionDuration: "300ms",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        },
      }}
    >
      <DialogTitle sx={dialogStyles.title}>
        {isAdd ? (
          <Typography variant="h6">Add New Asset</Typography>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6">Edit Asset</Typography>
            <Typography
              variant="subtitle2"
              color="primary.main"
              sx={{ fontWeight: 500 }}
            >
              {asset?.hostname}
            </Typography>
          </Box>
        )}
        <IconButton
          onClick={() => !isSubmitting && onClose()}
          size="small"
          sx={dialogStyles.closeButton}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={dialogStyles.content}>
        <Box>
          {isAdd ? (
            // Add asset form
            <AssetForm
              onSubmit={onSubmit}
              onCancel={onClose}
              isSubmitting={isSubmitting}
            />
          ) : (
            // Edit asset form with section card
            asset && (
              <Card sx={sectionStyles.card}>
                <Typography variant="subtitle1" sx={sectionStyles.title}>
                  Basic Information
                </Typography>
                <Box sx={sectionStyles.content}>
                  <AssetForm
                    asset={asset}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    isSubmitting={isSubmitting}
                  />
                </Box>
              </Card>
            )
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AssetFormDialog;
