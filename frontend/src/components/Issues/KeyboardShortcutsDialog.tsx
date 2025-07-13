import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  alpha,
} from "@mui/material";
import { KeyboardOutlined } from "@mui/icons-material";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({
  open,
  onClose,
}) => {
  const shortcuts = [
    { key: "F", description: "Focus search field" },
    { key: "R", description: "Refresh data" },
    { key: "E", description: "Export data" },
    { key: "1-4", description: "Switch between tabs" },
    { key: "S", description: "Start new scan" },
    { key: "/", description: "Show keyboard shortcuts" },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <KeyboardOutlined sx={{ mr: 1 }} />
          Keyboard Shortcuts
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            These shortcuts are available throughout the Issues page to help you
            work more efficiently.
          </Typography>

          {shortcuts.map((shortcut, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1,
                borderBottom:
                  index < shortcuts.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2">{shortcut.description}</Typography>
              <Chip
                label={shortcut.key}
                size="small"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                }}
              />
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default KeyboardShortcutsDialog;
