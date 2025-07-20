import { Box, Typography, Chip, alpha } from "@mui/material";
import BaseDialog from "../../common/BaseDialog";

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

  // Create impact points for the dialog (these will be the shortcuts)
  const impactPoints = shortcuts.map(
    (shortcut) => `${shortcut.key}: ${shortcut.description}`
  );

  // Custom content for displaying shortcuts in a more visually appealing way
  const shortcutsContent = (
    <Box sx={{ mt: 1 }}>
      {shortcuts.map((shortcut, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 1,
            borderBottom: index < shortcuts.length - 1 ? "1px solid" : "none",
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
  );

  return (
    <BaseDialog
      isOpen={open}
      onCancel={onClose}
      title="Keyboard Shortcuts"
      body="These shortcuts are available throughout the Issues page to help you work more efficiently."
      primaryLabel="Close"
      onPrimary={onClose}
      preLabel="Productivity"
      showSecondaryButton={false}
    >
      {shortcutsContent}
    </BaseDialog>
  );
};

export default KeyboardShortcutsDialog;
