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
  Button,
  useTheme,
  alpha,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";
import {
  NetworkCheck as NetworkIcon,
  Storage as StorageIcon,
  Dns as DnsIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  Computer as ComputerIcon,
  Apps as AppsIcon,
  Memory as MemoryIcon,
  Layers as LayersIcon,
  Speed as SpeedIcon,
  Refresh as RefreshIcon,
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
  asset?: {
    hostname?: string;
    ipAddress?: string;
    os?: {
      name?: string;
      version?: string;
    };
    services?: Array<{
      name: string;
      displayName: string;
      status: string;
      port?: number;
    }>;
    applications?: Array<{
      name: string;
      version: string;
      publisher: string;
    }>;
  };
  raw?: {
    portData?: any;
    systemInfo?: any;
    detailedScan?: any;
  };
}

const ScanDialog: React.FC<ScanDialogProps> = ({
  open,
  onClose,
  onScanComplete,
}) => {
  const theme = useTheme();
  const [targetIP, setTargetIP] = useState("127.0.0.1");
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanResults, setScanResults] = useState<ScanResults | null>(null);
  const [scanStage, setScanStage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Progress simulation interval
  const [progressInterval, setProgressInterval] = useState<number | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setScanResults(null);
      setProgress(0);
      setError(null);
      setScanStage("");
      setActiveStep(0);
    }
  }, [open]);

  // Steps for the scanning process
  const scanSteps = [
    {
      label: "Basic Network Scan",
      description: "Scanning network ports and identifying open services",
      icon: <NetworkIcon />,
    },
    {
      label: "System Information",
      description: "Gathering system information and network interfaces",
      icon: <ComputerIcon />,
    },
    {
      label: "Detailed Analysis",
      description: "Running detailed OS-specific scan",
      icon: <SecurityIcon />,
    },
    {
      label: "Processing Results",
      description: "Analyzing and formatting scan results",
      icon: <LayersIcon />,
    },
  ];

  const handleStartScan = async () => {
    setIsScanning(true);
    setProgress(0);
    setScanResults(null);
    setError(null);
    setActiveStep(0);

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

          // Update scan stage and active step based on progress
          if (prevProgress < 25) {
            setScanStage("Scanning network ports...");
            setActiveStep(0);
          } else if (prevProgress < 50) {
            setScanStage("Gathering system information...");
            setActiveStep(1);
          } else if (prevProgress < 75) {
            setScanStage("Running detailed scan...");
            setActiveStep(2);
          } else {
            setScanStage("Processing results...");
            setActiveStep(3);
          }

          return prevProgress + 1;
        });
      }, 150);

      setProgressInterval(interval as unknown as number);

      // Call the API to start the scan
      const result = await api.scan.startScan(targetIP);

      // Wait a moment to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get the latest scan results
      const latestScan = await api.scan.getLatestScan();

      // Clear the interval
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      // Set progress to 100% when done
      setProgress(100);
      setScanStage("Scan completed");
      setScanResults(latestScan);

      // Update toast notification
      toast.success("Scan completed successfully!", { id: "asset-scan-toast" });

      // Pass the results to the parent component
      onScanComplete(true, {
        scanDate: new Date(),
        target: targetIP,
        assetsFound: 1,
        results: latestScan,
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
    if (!scanResults || !scanResults.asset) return null;
    const asset = scanResults.asset;

    return (
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Typography
          variant="subtitle1"
          gutterBottom
          fontWeight="bold"
          color="primary"
        >
          Scan Results Summary
        </Typography>

        <Grid container spacing={2}>
          {/* System Information */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ mb: 2 }}>
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
                    secondary={asset.hostname || "N/A"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NetworkIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="IP Address"
                    secondary={asset.ipAddress || "N/A"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ComputerIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Operating System"
                    secondary={`${asset.os?.name || "Unknown"} ${
                      asset.os?.version || ""
                    }`}
                  />
                </ListItem>
              </List>
            </Box>
          </Grid>

          {/* Services */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Open Services
            </Typography>
            {asset.services && asset.services.length > 0 ? (
              <List dense>
                {asset.services.slice(0, 5).map((service, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <StorageIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={service.displayName}
                      secondary={service.port ? `Port ${service.port}` : ""}
                    />
                    <Chip
                      label={service.status}
                      size="small"
                      color={
                        service.status === "running" ? "success" : "default"
                      }
                      sx={{ ml: 1 }}
                    />
                  </ListItem>
                ))}
                {asset.services.length > 5 && (
                  <ListItem>
                    <ListItemText
                      secondary={`+ ${asset.services.length - 5} more services`}
                    />
                  </ListItem>
                )}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No open services detected
              </Typography>
            )}
          </Grid>

          {/* Applications */}
          {asset.applications && asset.applications.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Installed Applications
              </Typography>
              <Grid container spacing={1}>
                {asset.applications.slice(0, 6).map((app, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <AppsIcon color="action" fontSize="small" />
                      <Box>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ fontWeight: "medium" }}
                        >
                          {app.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {app.version}{" "}
                          {app.publisher ? `• ${app.publisher}` : ""}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
                {asset.applications.length > 6 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      + {asset.applications.length - 6} more applications
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
          )}
        </Grid>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleStartScan}
            disabled={isScanning}
            variant="outlined"
            size="small"
          >
            Scan Again
          </Button>
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
      body="Scan your network to discover assets, open ports, services, and installed applications."
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
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
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
            <Chip
              icon={<AppsIcon />}
              label="Application Detection"
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<MemoryIcon />}
              label="Service Discovery"
              size="small"
              color="warning"
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

        {/* Scan Progress Stepper */}
        {isScanning && (
          <Box sx={{ mt: 2 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {scanSteps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor:
                            index === activeStep
                              ? alpha(theme.palette.primary.main, 0.8)
                              : index < activeStep
                              ? alpha(theme.palette.success.main, 0.8)
                              : alpha(theme.palette.grey[500], 0.2),
                          color:
                            index <= activeStep ? "white" : "text.secondary",
                        }}
                      >
                        {step.icon}
                      </Box>
                    )}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                    {index === activeStep && (
                      <LinearProgress
                        variant="determinate"
                        value={(progress % 25) * 4} // Scale to 0-100 for each step
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {scanStage || "Preparing scan..."}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress}% Complete
              </Typography>
            </Box>
          </Box>
        )}

        {/* Scan Results */}
        {scanResults && renderScanResults()}
      </Box>
    </BaseDialog>
  );
};

export default ScanDialog;
