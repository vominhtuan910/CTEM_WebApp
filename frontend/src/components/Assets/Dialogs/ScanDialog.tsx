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
  Security as SecurityIcon,
  Check as CheckIcon,
  Computer as ComputerIcon,
  Apps as AppsIcon,
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
  const scanningMessage = "Scanning your system. This may take a minute...";

  // Update the handleStartScan function to use the simplified options
  const handleStartScan = async () => {
    setIsScanning(true);
    setScanResults(null);
    setError(null);
    setScanId(null);

    try {
      // Get OS info to determine which scan to run
      const userAgent = navigator.userAgent.toLowerCase();
      const isWindows = userAgent.includes("win");
      const isMac = userAgent.includes("mac");
      const isLinux = userAgent.includes("linux");

      // Always run all scan options
      const scanResult = await scanApi.startScan({
        target,
        runNmap: true,
        runLynis: isLinux || isMac,
        runPowerShell: isWindows,
        scanOptions: {
          systemScan: true,
          networkScan: true,
          servicesScan: true,
        },
      });

      // Store the scan ID for later use
      const newScanId = scanResult?.scanId;
      if (!newScanId) {
        throw new Error("No scan ID returned from API");
      }

      setScanId(newScanId);

      // Check if the scan was successful by looking at overall status
      if (scanResult?.scanStatus?.overall === "failed") {
        throw new Error(
          `Scan failed: ${scanResult.errors?.overall || "Unknown error"}`
        );
      }

      try {
        // Parse the scan results using the scanId we just received
        const parsedResults = await parserApi.parseScan(newScanId);

        setIsScanning(false);
        setScanResults(parsedResults);

        // Pass the results to the parent component
        onScanComplete(true, {
          scanDate: new Date(),
          target,
          scanId: newScanId,
          results: parsedResults,
        });
      } catch (parseError) {
        console.error("Error parsing scan results:", parseError);

        setIsScanning(false);

        // Store a partial result
        const partialResult = {
          scanDate: new Date(),
          scanId: newScanId,
          parsedResults: {
            assetInfo: {
              hostname: target,
              ipAddress: target === "localhost" ? "127.0.0.1" : target,
              status: "active",
              osName: isWindows
                ? "Windows"
                : isMac
                ? "macOS"
                : isLinux
                ? "Linux"
                : "Unknown",
              osVersion: "",
            },
          },
        };

        setScanResults(partialResult);

        // Show error but don't stop the process
        setError(
          "Scan completed, but there was an issue processing the results. Some information may be incomplete."
        );

        // Still notify parent of partial success
        onScanComplete(true, {
          scanDate: new Date(),
          target,
          scanId: newScanId,
          results: partialResult,
          partial: true,
        });
      }
    } catch (error) {
      console.error("Scan failed:", error);

      setIsScanning(false);

      // Determine the specific error message
      let errorMessage =
        "Scan failed. Please check if the backend server is running and try again.";

      if (error instanceof Error) {
        if (
          error.message.includes("administrator") ||
          error.message.includes("elevation")
        ) {
          errorMessage =
            "Scan failed because it requires administrator privileges. Please run the application as administrator.";
        } else if (
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("Network Error")
        ) {
          errorMessage =
            "Cannot connect to the backend server. Please make sure it's running.";
        } else if (error.message.includes("scanId")) {
          errorMessage =
            "Scan was initiated but no valid scan ID was returned. Check the backend logs.";
        } else if (error.message.includes("timeout")) {
          errorMessage =
            "Scan timed out. The target system might be unreachable or the scan takes too long.";
        } else if (error.message.includes("not installed")) {
          errorMessage =
            "Required scan tools are not installed. Check the backend logs for details.";
        } else {
          // Use the actual error message for other cases
          errorMessage = `Scan failed: ${error.message}`;
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
      const saveResult = await parserApi.saveScanResults(scanId);
      onScanComplete(true, {
        scanDate: new Date(),
        target,
        scanId,
        results: scanResults,
        savedAsset: saveResult.asset,
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
              Services Summary
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Running Services:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {scanResults.parsedResults.services?.filter(
                    (s: { status: string }) => s.status === "running"
                  ).length || 0}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Total Services:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {scanResults.parsedResults.services?.length || 0}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Applications:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {scanResults.parsedResults.applications?.length || 0}
                </Typography>
              </Box>
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
      title="Asset Discovery Scan"
      body="Scan your system to discover network configuration, services, and applications."
      primaryLabel={isScanning ? "Scanning..." : "Start Scan"}
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
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
            Windows system scan requires administrator privileges. Some features
            may not work if the application is not running as administrator.
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
                Scan Target
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Target IP or Hostname"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                margin="dense"
                helperText="Enter IP address or hostname (default: localhost)"
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
