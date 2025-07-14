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
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    borderRadius: 3,
    border: "1px solid",
    borderColor: "divider",
    overflow: "hidden",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
      "& .asset-actions": {
        opacity: 1,
      },
    },
  },
  listCard: {
    position: "relative",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    overflow: "hidden",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.08)",
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
  "&:hover": {
    backgroundColor: (theme: Theme) => alpha(theme.palette[color].main, 0.1),
  },
});
