import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  LinearProgress,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Paper,
  Grid,
} from "@mui/material";
import {
  NetworkCheck as NetworkIcon,
  Storage as StorageIcon,
  Dns as DnsIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import BaseDialog from "../../common/BaseDialog";
import { api } from "../../../services/api";
import toast from "react-hot-toast";

interface ScanDialogProps {
  open: boolean;
  onClose: () => void;
  onScanComplete: (success: boolean, data?: any) => void;
}

interface ScanResults {
  ports?: {
    openPorts?: Array<{
      port: string;
      protocol: string;
      service: string;
    }>;
  };
  sockets?: Array<{
    protocol: string;
    local_port: string;
    state: string;
  }>;
  system?: {
    hostname?: string;
    ip_addresses_short?: string;
    network_interfaces?: Record<string, any>;
  };
}

const ScanDialog: React.FC<ScanDialogProps> = ({
  open,
  onClose,
  onScanComplete,
}) => {
  const [targetIP, setTargetIP] = useState("127.0.0.1");
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanResults, setScanResults] = useState<ScanResults | null>(null);
  const [scanStage, setScanStage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Progress simulation interval
  const [progressInterval, setProgressInterval] = useState<number | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setScanResults(null);
      setProgress(0);
      setError(null);
      setScanStage("");
    }
  }, [open]);

  const handleStartScan = async () => {
    setIsScanning(true);
    setProgress(0);
    setScanResults(null);
    setError(null);

    // Show toast notification
    toast.loading("Starting network scan...", { id: "asset-scan-toast" });

    try {
      // Start progress simulation
      const interval = window.setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 95) {
            clearInterval(interval);
            return 95; // Leave the last 5% for processing results
          }

          // Update scan stage based on progress
          if (prevProgress < 30) {
            setScanStage("Scanning ports...");
          } else if (prevProgress < 60) {
            setScanStage("Checking network sockets...");
          } else if (prevProgress < 90) {
            setScanStage("Gathering system information...");
          } else {
            setScanStage("Processing results...");
          }

          return prevProgress + 2;
        });
      }, 200);

      setProgressInterval(interval as unknown as number);

      // Call the API to start the scan
      const result = await api.scan.startScan(targetIP);

      // Wait a moment to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch the scan results
      const portsData = await api.scan.getPorts();
      const socketsData = await api.scan.getSockets();
      const systemData = await api.scan.getSystemInfo();

      // Combine all results
      const combinedResults = {
        ports: portsData,
        sockets: socketsData,
        system: systemData,
      };

      // Clear the interval
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      // Set progress to 100% when done
      setProgress(100);
      setScanStage("Scan completed");
      setScanResults(combinedResults);

      // Update toast notification
      toast.success("Scan completed successfully!", { id: "asset-scan-toast" });

      // Calculate number of assets found (network interfaces + open ports)
      const networkInterfaces = Object.keys(
        systemData?.network_interfaces || {}
      ).length;
      const openPorts = portsData?.openPorts?.length || 0;
      const assetsFound = networkInterfaces + (openPorts > 0 ? 1 : 0);

      // Pass the results to the parent component
      onScanComplete(true, {
        scanDate: new Date(),
        target: targetIP,
        assetsFound: assetsFound,
        results: combinedResults,
      });
    } catch (error) {
      console.error("Scan failed:", error);

      // Clear the interval
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      setIsScanning(false);
      setProgress(0);
      setScanStage("");
      setError(
        "Scan failed. Please check if the backend server is running and try again."
      );

      // Show error toast
      toast.error("Scan failed. Please try again.", { id: "asset-scan-toast" });

      onScanComplete(false, { error: "Scan failed. Please try again." });
    }
  };

  const renderScanResults = () => {
    if (!scanResults) return null;

    return (
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Scan Results Summary
        </Typography>

        <Grid container spacing={2}>
          {/* System Information */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              System Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <DnsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Hostname"
                  secondary={scanResults.system?.hostname || "N/A"}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <NetworkIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="IP Addresses"
                  secondary={scanResults.system?.ip_addresses_short || "N/A"}
                />
              </ListItem>
            </List>
          </Grid>

          {/* Open Ports */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Open Ports
            </Typography>
            {scanResults.ports?.openPorts &&
            scanResults.ports.openPorts.length > 0 ? (
              <List dense>
                {scanResults.ports.openPorts.slice(0, 5).map((port, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <StorageIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${port.port}/${port.protocol}`}
                      secondary={port.service}
                    />
                  </ListItem>
                ))}
                {scanResults.ports.openPorts.length > 5 && (
                  <ListItem>
                    <ListItemText
                      secondary={`+ ${
                        scanResults.ports.openPorts.length - 5
                      } more ports`}
                    />
                  </ListItem>
                )}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No open ports detected
              </Typography>
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Chip
            icon={<CheckIcon />}
            label="Scan Complete"
            color="success"
            size="small"
          />
        </Box>
      </Paper>
    );
  };

  return (
    <BaseDialog
      isOpen={open}
      title="Network Scan"
      body="Scan your network to discover assets, open ports, and system information."
      primaryLabel={isScanning ? "Scanning..." : "Start Scan"}
      secondaryLabel="Close"
      onPrimary={handleStartScan}
      onCancel={onClose}
      closeOnBackdropClick={!isScanning}
      closeOnEsc={!isScanning}
      mode="default"
      preLabel="Asset Discovery"
      disablePrimaryButton={isScanning}
      size="md"
    >
      <Box sx={{ mt: 2 }}>
        {/* Target IP Input */}
        <Typography variant="subtitle2" gutterBottom>
          Target IP Address
        </Typography>
        <TextField
          fullWidth
          placeholder="e.g. 127.0.0.1"
          value={targetIP}
          onChange={(e) => setTargetIP(e.target.value)}
          disabled={isScanning}
          size="small"
          sx={{ mb: 3 }}
          helperText="Enter the IP address to scan. Use 127.0.0.1 for localhost."
        />

        {/* Scan Information */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1}>
            <Chip
              icon={<SecurityIcon />}
              label="Port Scanning"
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<NetworkIcon />}
              label="Network Analysis"
              size="small"
              color="secondary"
              variant="outlined"
            />
            <Chip
              icon={<DnsIcon />}
              label="System Info"
              size="small"
              color="info"
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Progress Bar */}
        {isScanning && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {scanStage || "Preparing scan..."}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              align="right"
              sx={{ display: "block", mt: 0.5 }}
            >
              {progress}% Complete
            </Typography>
          </Box>
        )}

        {/* Scan Results */}
        {scanResults && renderScanResults()}
      </Box>
    </BaseDialog>
  );
};

export default ScanDialog;
