import { Theme, alpha } from "@mui/material";

export const dialogStyles = {
  paper: {
    borderRadius: 3,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    overflow: "hidden",
    background: "#f8f9fa",
    border: "none",
  },
  title: {
    pb: 2,
    pt: 2,
    px: 3,
    fontWeight: 600,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "none",
    bgcolor: "white",
  },
  content: {
    p: 0,
    bgcolor: "#f8f9fa",
    "& .MuiBox-root": {
      p: 3,
    },
  },
  actions: {
    p: 3,
    pt: 2,
    borderTop: "none",
    bgcolor: "white",
  },
  closeButton: {
    color: "text.secondary",
    "&:hover": {
      color: "error.main",
      backgroundColor: (theme: Theme) => alpha(theme.palette.error.main, 0.1),
    },
    transition: "all 0.2s ease-in-out",
  },
};

export const sectionStyles = {
  card: {
    mb: 2,
    borderRadius: 2,
    boxShadow: "none",
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "white",
    overflow: "hidden",
  },
  title: {
    p: 2,
    bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.05),
    borderBottom: "1px solid",
    borderColor: "divider",
    fontWeight: 500,
  },
  content: {
    p: 3,
  },
};

export const cardStyles = {
  gridCard: {
    position: "relative",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    borderRadius: 3,
    border: "1px solid",
    borderColor: "divider",
    overflow: "hidden",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: (theme: Theme) =>
        `0 12px 24px ${alpha(
          theme.palette.primary.main,
          0.15
        )}, 0 4px 8px rgba(0, 0, 0, 0.1)`,
      borderColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.3),
      "& .asset-actions": {
        opacity: 1,
      },
    },
  },
  listCard: {
    position: "relative",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    overflow: "hidden",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: (theme: Theme) =>
        `0 8px 16px ${alpha(
          theme.palette.primary.main,
          0.15
        )}, 0 2px 4px rgba(0, 0, 0, 0.1)`,
      borderColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.3),
      "& .asset-actions": {
        opacity: 1,
      },
    },
  },
};

// Define the accepted color values to avoid type error
type ColorType =
  | "primary"
  | "secondary"
  | "error"
  | "warning"
  | "info"
  | "success";

export const actionButtonStyle = (color: ColorType) => ({
  color: `${color}.main`,
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: (theme: Theme) => alpha(theme.palette[color].main, 0.15),
    transform: "scale(1.05)",
    boxShadow: (theme: Theme) =>
      `0 2px 8px ${alpha(theme.palette[color].main, 0.25)}`,
  },
});
