import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
  Box,
  Card,
  FormGroup,
  FormControlLabel,
  Checkbox,
  alpha,
  useTheme,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Asset } from "../../../types/asset.types";
import { dialogStyles, sectionStyles } from "../../../utils/assets/assetStyles";

interface AssetExportDialogProps {
  open: boolean;
  asset: Asset | null;
  options: {
    services: boolean;
    applications: boolean;
  };
  onClose: () => void;
  onExport: () => void;
  onOptionsChange: (
    options: Partial<{ services: boolean; applications: boolean }>
  ) => void;
}

const AssetExportDialog: React.FC<AssetExportDialogProps> = ({
  open,
  asset,
  options,
  onClose,
  onExport,
  onOptionsChange,
}) => {
  const theme = useTheme();

  if (!asset) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
        <Typography variant="h6">Export Host Data</Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={dialogStyles.closeButton}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={dialogStyles.content}>
        <Box>
          <Card sx={sectionStyles.card}>
            <Typography variant="subtitle1" sx={sectionStyles.title}>
              Select Export Options
            </Typography>
            <Box sx={sectionStyles.content}>
              <Typography variant="body1" gutterBottom>
                Select the data you want to export from{" "}
                <Typography
                  component="span"
                  fontWeight="bold"
                  color="primary.main"
                >
                  {asset.hostname}
                </Typography>
                :
              </Typography>
              <FormGroup sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={options.services}
                      onChange={(e) =>
                        onOptionsChange({ services: e.target.checked })
                      }
                      sx={{
                        color: "secondary.main",
                        "&.Mui-checked": {
                          color: "secondary.main",
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        Services
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Export list of services and their status
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={options.applications}
                      onChange={(e) =>
                        onOptionsChange({ applications: e.target.checked })
                      }
                      sx={{
                        color: "secondary.main",
                        "&.Mui-checked": {
                          color: "secondary.main",
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        Applications
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Export list of installed applications and versions
                      </Typography>
                    </Box>
                  }
                />
              </FormGroup>
            </Box>
          </Card>
        </Box>
      </DialogContent>
      <DialogActions sx={dialogStyles.actions}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onExport}
          disabled={!options.services && !options.applications}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            bgcolor: "success.main",
            "&:hover": {
              bgcolor: "success.dark",
            },
            "&.Mui-disabled": {
              bgcolor: alpha(theme.palette.success.main, 0.3),
            },
          }}
        >
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetExportDialog;
