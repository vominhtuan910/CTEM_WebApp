import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Paper,
  Grid,
  Button,
  useTheme,
  alpha,
  CircularProgress,
  TextField,
} from "@mui/material";

import {
  NetworkCheck as NetworkIcon,
  Dns as DnsIcon,
  Check as CheckIcon,
  Computer as ComputerIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

import BaseDialog from "../../common/BaseDialog";
import { scanApi, parserApi } from "../../../services/api";

interface ScanDialogProps {
  open: boolean;
  onClose: () => void;
  onScanComplete: (success: boolean, data?: any) => void;
}

const ScanDialog: React.FC<ScanDialogProps> = ({
  open,
  onClose,
  onScanComplete,
}) => {
  const theme = useTheme();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);

  // Scan options
  const [target, setTarget] = useState<string>("localhost");

  // Always scan with all options enabled
  const scanOptions = {
    systemScan: true,
    networkScan: true,
    servicesScan: true,
  };

  // Check if Windows platform
  const isWindows = navigator.userAgent.toLowerCase().includes("win");

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setScanResults(null);
      setError(null);
      setScanId(null);
      setTarget("localhost");
    }
  }, [open]);

  // Simple scanning message
  const scanningMessage =
    "Running Nmap network discovery. This may take a few minutes...";

  // Update the handleStartScan function to use the Nmap network scan API
  const handleStartScan = async () => {
    setIsScanning(true);
    setScanResults(null);
    setError(null);
    setScanId(null);

    try {
      // Convert target to network format for Nmap
      let network = target;
      if (target === "localhost") {
        network = "127.0.0.1/32";
      } else if (!target.includes("/")) {
        // If it's a single IP without CIDR, add /32
        network = `${target}/32`;
      }

      // Use the new Nmap network scan API
      const scanResult = await scanApi.scanNetwork(network);

      // Check if the scan was successful
      if (!scanResult.success) {
        throw new Error(scanResult.error || "Nmap scan failed");
      }

      // Generate a scan ID for compatibility
      const newScanId = `nmap_${Date.now()}`;
      setScanId(newScanId);

      // Parse the scan results directly from the Nmap response
      const parsedResults = await parserApi.parseScan(newScanId, scanResult);

      setIsScanning(false);
      setScanResults({
        scanDate: new Date(),
        scanId: newScanId,
        parsedResults: parsedResults.parsedResults,
        rawScanResult: scanResult,
      });

      // Pass the results to the parent component
      onScanComplete(true, {
        scanDate: new Date(),
        target,
        scanId: newScanId,
        results: parsedResults,
        savedAsset: scanResult.saved_assets > 0, // Assets are auto-saved by Nmap scan
      });
    } catch (error) {
      console.error("Nmap scan failed:", error);

      setIsScanning(false);

      // Determine the specific error message
      let errorMessage =
        "Nmap scan failed. Please check if the backend server is running and Nmap is installed.";

      if (error instanceof Error) {
        if (
          error.message.includes("administrator") ||
          error.message.includes("elevation") ||
          error.message.includes("permission")
        ) {
          errorMessage =
            "Nmap scan failed due to insufficient privileges. Some scan features may require administrator/root access.";
        } else if (
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("Network Error")
        ) {
          errorMessage =
            "Cannot connect to the backend server. Please make sure it's running.";
        } else if (error.message.includes("timeout")) {
          errorMessage =
            "Nmap scan timed out. The target system might be unreachable or the scan takes too long.";
        } else if (
          error.message.includes("not found") ||
          error.message.includes("not installed")
        ) {
          errorMessage =
            "Nmap is not installed or not found in PATH. Please install Nmap and try again.";
        } else {
          // Use the actual error message for other cases
          errorMessage = `Nmap scan failed: ${error.message}`;
        }
      }

      setError(errorMessage);
      onScanComplete(false, { error: errorMessage });
    }
  };

  const handleSaveResults = async () => {
    if (!scanId) {
      setError("No scan ID available. Cannot save results.");
      return;
    }

    try {
      // For Nmap scans, assets are automatically saved during the scan
      // Just notify the parent component and close the dialog
      onScanComplete(true, {
        scanDate: new Date(),
        target,
        scanId,
        results: scanResults,
        savedAsset: true, // Assets are auto-saved by Nmap scan
      });
      onClose();
    } catch (err) {
      console.error("Failed to save scan results:", err);
      setError("Failed to save scan results to database");
    }
  };

  const renderScanResults = () => {
    if (!scanResults || !scanResults.parsedResults) return null;
    const asset = scanResults.parsedResults.assetInfo;

    return (
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 3,
          mt: 3,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.7),
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" color="primary">
            Scan Complete
          </Typography>
          <Chip
            icon={<CheckIcon />}
            label="Success"
            color="success"
            size="small"
            sx={{ height: 24 }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" gutterBottom color="textSecondary">
              System Information
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <List dense disablePadding>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ComputerIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2">Hostname</Typography>}
                    secondary={asset.hostname || "localhost"}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <NetworkIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2">IP Address</Typography>
                    }
                    secondary={asset.ipAddress || "127.0.0.1"}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <DnsIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2">Operating System</Typography>
                    }
                    secondary={`${asset.osName || "Unknown"} ${
                      asset.osVersion || ""
                    } ${asset.osBuildNumber || ""}`}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <DnsIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2">Platform</Typography>}
                    secondary={`${asset.osPlatform || "Unknown"} | Kernel: ${
                      asset.osKernelVersion || "Unknown"
                    }`}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" gutterBottom color="textSecondary">
              Scan Summary
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Hosts Discovered:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {scanResults.rawScanResult?.total_hosts || 1}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Assets Saved:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {scanResults.rawScanResult?.saved_assets || 1}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">MAC Address:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {asset.macAddress || "Not detected"}
                </Typography>
              </Box>
              {asset.manufacturer && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography variant="body2">Manufacturer:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {asset.manufacturer}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleStartScan}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Scan Again
          </Button>
          <Button variant="contained" onClick={handleSaveResults}>
            Save & Close
          </Button>
        </Box>
      </Paper>
    );
  };

  return (
    <BaseDialog
      isOpen={open}
      title="Nmap Network Discovery"
      body="Use Nmap to discover hosts on your network and detect operating systems. Assets will be automatically saved to your inventory."
      primaryLabel={isScanning ? "Scanning..." : "Start Nmap Scan"}
      secondaryLabel="Close"
      onPrimary={handleStartScan}
      onCancel={onClose}
      closeOnBackdropClick={!isScanning}
      closeOnEsc={!isScanning}
      mode="default"
      disablePrimaryButton={isScanning}
      size="md"
    >
      <Box sx={{ mt: 2 }}>
        {/* Admin warning for Windows */}
        {isWindows && !isScanning && !scanResults && (
          <Alert severity="info" icon={<WarningIcon />} sx={{ mb: 2 }}>
            Nmap may require administrator privileges for OS detection and some
            advanced features. Running as administrator will provide more
            detailed scan results.
          </Alert>
        )}

        {/* Scan options */}
        {!isScanning && !scanResults && (
          <>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Network Target
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Target Network or IP"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                margin="dense"
                helperText="Enter IP address, hostname, or network range (e.g., 192.168.1.0/24)"
                placeholder="localhost"
              />
            </Paper>
          </>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Scanning Message */}
        {isScanning && (
          <Box
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              justifyContent: "center",
              py: 4,
            }}
          >
            <CircularProgress size={30} thickness={4} />
            <Typography variant="subtitle1">{scanningMessage}</Typography>
          </Box>
        )}

        {/* Scan Results */}
        {scanResults && renderScanResults()}
      </Box>
    </BaseDialog>
  );
};

export default ScanDialog;
