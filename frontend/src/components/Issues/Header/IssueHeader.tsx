import React from "react";
import {
  Typography,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ShieldOutlined,
  RefreshOutlined,
  FilterAltOutlined,
  DownloadOutlined,
  SettingsOutlined,
  KeyboardOutlined,
} from "@mui/icons-material";

interface IssueHeaderProps {
  lastScanDate: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onExportOpen: () => void;
  onKeyboardShortcutsOpen: () => void;
}

const IssueHeader: React.FC<IssueHeaderProps> = ({
  lastScanDate,
  isRefreshing,
  onRefresh,
  onExportOpen,
  onKeyboardShortcutsOpen,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mb: 4,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", md: "center" },
        gap: 2,
      }}
    >
      <Box>
        <Box display="flex" alignItems="center" mb={1}>
          <ShieldOutlined
            sx={{
              fontSize: 40,
              color: "primary.main",
              mr: 2,
              p: 1,
              borderRadius: "50%",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            }}
          />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Security Issues
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Manage and track security issues across your assets
          {lastScanDate && (
            <Box component="span" ml={2} fontStyle="italic">
              Last scan: {lastScanDate}
            </Box>
          )}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          width: { xs: "100%", md: "auto" },
        }}
      >
        <Tooltip title="Refresh data">
          <IconButton
            onClick={onRefresh}
            sx={{
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
              },
            }}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <RefreshOutlined />
            )}
          </IconButton>
        </Tooltip>

        <Button
          variant="outlined"
          startIcon={<FilterAltOutlined />}
          sx={{
            borderRadius: 2,
            flex: { xs: 1, md: "none" },
          }}
        >
          Filters
        </Button>

        <Button
          variant="contained"
          disableElevation
          startIcon={<DownloadOutlined />}
          onClick={onExportOpen}
          sx={{
            borderRadius: 2,
            flex: { xs: 1, md: "none" },
          }}
        >
          Export
        </Button>

        <Tooltip title="Security settings">
          <IconButton
            sx={{
              bgcolor: (theme) => alpha(theme.palette.grey[200], 0.5),
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.grey[300], 0.7),
              },
            }}
          >
            <SettingsOutlined />
          </IconButton>
        </Tooltip>

        <Tooltip title="Keyboard shortcuts (/)">
          <IconButton
            onClick={onKeyboardShortcutsOpen}
            sx={{
              bgcolor: (theme) => alpha(theme.palette.grey[200], 0.5),
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.grey[300], 0.7),
              },
            }}
          >
            <KeyboardOutlined />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default IssueHeader;
