import React, {
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
  ReactNode,
} from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  alpha,
  useTheme,
  Paper,
} from "@mui/material";

import {
  Close as CloseIcon,
  FiberManualRecord as BulletIcon,
  ErrorOutline as WarningIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";

/**
 * BaseDialog Component
 *
 * A reusable accessible dialog component that follows modern UX patterns
 * for desktop applications. Supports confirmation dialogs, alerts, and forms.
 */
interface BaseDialogProps {
  /** Controls whether the dialog is open */
  isOpen: boolean;
  /** Dialog title displayed in header */
  title: string | ReactNode;
  /** Main dialog content text */
  body: string;
  /** Optional list of impact points displayed as bullets */
  impactPoints?: string[];
  /** Label for primary/confirmation button */
  primaryLabel: string;
  /** Label for secondary/cancel button (default: "Cancel") */
  secondaryLabel?: string;
  /** Function called when primary action is confirmed */
  onPrimary: () => void;
  /** Function called when dialog is cancelled/closed */
  onCancel: () => void;
  /** Dialog mode - affects styling and accessibility attributes */
  mode?: "default" | "destructive";
  /** Optional text that user must type to enable confirmation */
  requireConfirmationText?: string;
  /** Optional callback after confirmation, useful for undo functionality */
  onAfterConfirm?: () => void;
  /** Controls whether clicking the backdrop closes the dialog (default: true) */
  closeOnBackdropClick?: boolean;
  /** Optional pre-title label text */
  preLabel?: string;
  /** Whether to allow pressing ESC to close (default: true) */
  closeOnEsc?: boolean;
  /** Optional children to render after the body text and impact points */
  children?: ReactNode;
}

const BaseDialog: React.FC<BaseDialogProps> = ({
  isOpen,
  title,
  body,
  impactPoints = [],
  primaryLabel,
  secondaryLabel = "Cancel",
  onPrimary,
  onCancel,
  mode = "default",
  requireConfirmationText,
  onAfterConfirm,
  closeOnBackdropClick = true,
  preLabel,
  closeOnEsc = true,
  children,
}) => {
  const theme = useTheme();
  const [confirmText, setConfirmText] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(!requireConfirmationText);
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Track the element that had focus before dialog opened
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus management when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      // Short timeout to ensure DOM is ready
      setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 50);
    } else {
      // Return focus to the element that opened the dialog
      if (previousFocusRef.current && "focus" in previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      // Reset confirmation state
      setConfirmText("");
      setIsConfirmed(!requireConfirmationText);
    }
  }, [isOpen, requireConfirmationText]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && closeOnEsc) {
      onCancel();
    }
  };

  const handlePrimary = () => {
    onPrimary();
    if (onAfterConfirm) {
      onAfterConfirm();
    }
  };

  const handleConfirmTextChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setConfirmText(value);
    setIsConfirmed(value === requireConfirmationText);
  };

  // Handle clicking the backdrop
  const handleClose = (_: object, reason: string) => {
    if (reason === "backdropClick" && closeOnBackdropClick) {
      onCancel();
    } else if (reason === "escapeKeyDown" && closeOnEsc) {
      onCancel();
    }
  };

  // Styles based on mode
  const getPrimaryButtonColor = () => {
    return mode === "destructive" ? "error" : "primary";
  };

  const getIconForMode = () => {
    return mode === "destructive" ? (
      <WarningIcon color="error" sx={{ fontSize: 24, mr: 1 }} />
    ) : (
      <InfoIcon color="primary" sx={{ fontSize: 24, mr: 1 }} />
    );
  };

  const getTitleBarColor = () => {
    return mode === "destructive"
      ? alpha(theme.palette.error.main, 0.1)
      : alpha(theme.palette.primary.main, 0.1);
  };

  const getBorderColor = () => {
    return mode === "destructive"
      ? theme.palette.error.main
      : theme.palette.primary.main;
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-body"
      aria-modal="true"
      role={mode === "destructive" ? "alertdialog" : "dialog"}
      onKeyDown={handleKeyDown}
      maxWidth="sm"
      PaperProps={{
        component: Paper,
        elevation: 24,
        sx: {
          borderRadius: 2,
          overflow: "hidden",
          width: "100%",
          maxWidth: 500,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
          border:
            mode === "destructive"
              ? `1px solid ${alpha(theme.palette.error.main, 0.3)}`
              : undefined,
        },
      }}
      sx={{
        backdropFilter: "blur(3px)",
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        id="dialog-title"
        sx={{
          p: 2,
          bgcolor: getTitleBarColor(),
          borderLeft: `4px solid ${getBorderColor()}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {getIconForMode()}
          <Box>
            {preLabel && (
              <Typography
                variant="caption"
                component="div"
                color="text.secondary"
                sx={{ fontWeight: 500, mb: 0.5 }}
              >
                {preLabel}
              </Typography>
            )}
            {typeof title === "string" ? (
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            ) : (
              title
            )}
          </Box>
        </Box>
        <IconButton
          aria-label="close dialog"
          onClick={onCancel}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              color: "error.main",
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              transform: "rotate(90deg)",
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Typography
          id="dialog-body"
          variant="body1"
          paragraph
          sx={{ whiteSpace: "pre-line" }}
        >
          {body}
        </Typography>

        {/* Impact Points (Optional) */}
        {impactPoints && impactPoints.length > 0 && (
          <List dense disablePadding sx={{ mt: 1 }}>
            {impactPoints.map((point, index) => (
              <ListItem key={index} disableGutters sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <BulletIcon
                    fontSize="small"
                    color={mode === "destructive" ? "error" : "primary"}
                    sx={{ fontSize: 10 }}
                  />
                </ListItemIcon>
                <ListItemText primary={point} sx={{ m: 0 }} />
              </ListItem>
            ))}
          </List>
        )}

        {/* Custom Content (Optional) */}
        {children}

        {/* Confirmation Text Field (Optional) */}
        {requireConfirmationText && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Type{" "}
              <Typography
                component="span"
                variant="body2"
                fontWeight="bold"
                color={mode === "destructive" ? "error" : "primary"}
              >
                {requireConfirmationText}
              </Typography>{" "}
              to confirm:
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={confirmText}
              onChange={handleConfirmTextChange}
              placeholder={requireConfirmationText}
              variant="outlined"
              autoComplete="off"
              error={confirmText.length > 0 && !isConfirmed}
              helperText={
                confirmText.length > 0 && !isConfirmed
                  ? "Text doesn't match"
                  : " "
              }
              sx={{ mt: 1 }}
            />
          </Box>
        )}
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{ px: 3, py: 2, display: "flex", justifyContent: "space-between" }}
      >
        <Button
          onClick={onCancel}
          variant="outlined"
          color="inherit"
          sx={{ minWidth: 100 }}
          ref={initialFocusRef} // Initial focus on the cancel button
        >
          {secondaryLabel}
        </Button>
        <Button
          onClick={handlePrimary}
          variant="contained"
          color={getPrimaryButtonColor()}
          disabled={!isConfirmed}
          sx={{
            minWidth: 100,
            fontWeight: 500,
            boxShadow:
              mode === "destructive"
                ? "0 3px 8px rgba(211, 47, 47, 0.25)"
                : undefined,
          }}
        >
          {primaryLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BaseDialog;
