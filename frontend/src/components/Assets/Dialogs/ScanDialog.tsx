import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  LinearProgress,
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
} from "@mui/material";

import {
  NetworkCheck as NetworkIcon,
  Dns as DnsIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  Computer as ComputerIcon,
  Apps as AppsIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

import BaseDialog from "../../common/BaseDialog";
import { api } from "../../../services/api";

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
  const [progress, setProgress] = useState(0);
  const [scanResults, setScanResults] = useState<any | null>(null);
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
      label: "Network Discovery",
      description: "Identifying network interfaces and services",
      icon: <NetworkIcon />,
    },
    {
      label: "System Information",
      description: "Collecting system details and configuration",
      icon: <ComputerIcon />,
    },
    {
      label: "Security Analysis",
      description: "Checking for open ports and running services",
      icon: <SecurityIcon />,
    },
    {
      label: "Asset Inventory",
      description: "Creating inventory of applications and services",
      icon: <AppsIcon />,
    },
  ];

  const handleStartScan = async () => {
    setIsScanning(true);
    setProgress(0);
    setScanResults(null);
    setError(null);
    setActiveStep(0);

    try {
      // Start progress simulation
      const interval = window.setInterval(() => {
        setProgress((prevProgress) => {
          // Update scan stage and active step based on progress
          if (prevProgress < 25) {
            setScanStage("Scanning network...");
            setActiveStep(0);
          } else if (prevProgress < 50) {
            setScanStage("Gathering system information...");
            setActiveStep(1);
          } else if (prevProgress < 75) {
            setScanStage("Analyzing security...");
            setActiveStep(2);
          } else if (prevProgress < 95) {
            setScanStage("Building asset inventory...");
            setActiveStep(3);
          } else {
            setScanStage("Finalizing results...");
          }

          return prevProgress >= 95 ? 95 : prevProgress + 1;
        });
      }, 150);

      setProgressInterval(interval as unknown as number);

      // Call the API to start the scan - targeting localhost
      const result = await api.scan.startScan("127.0.0.1");

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

      // Pass the results to the parent component
      onScanComplete(true, {
        scanDate: new Date(),
        target: "127.0.0.1",
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

      onScanComplete(false, { error: "Scan failed. Please try again." });
    }
  };

  const renderScanResults = () => {
    if (!scanResults || !scanResults.asset) return null;
    const asset = scanResults.asset;

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
                    secondary={`${asset.os?.name || "Unknown"} ${
                      asset.os?.version || ""
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
                  {asset.services?.filter(
                    (s: { status: string }) => s.status === "running"
                  ).length || 0}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Total Services:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {asset.services?.length || 0}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Applications:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {asset.applications?.length || 0}
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
          <Button variant="contained" onClick={onClose}>
            Done
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
        {/* Target information */}
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.info.main, 0.05),
          }}
        >
          <InfoIcon color="info" />
          <Typography variant="body2" color="text.secondary">
            This scan will analyze your local system (127.0.0.1) to identify
            network configuration, running services, and installed applications.
          </Typography>
        </Paper>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Scan Progress */}
        {isScanning && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <CircularProgress size={24} thickness={4} />
              <Typography variant="subtitle1">{scanStage}</Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Typography variant="caption" color="text.secondary">
                {progress}% Complete
              </Typography>
            </Box>

            <Stepper
              activeStep={activeStep}
              orientation="vertical"
              sx={{ mt: 3 }}
            >
              {scanSteps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
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
                    <Typography
                      variant="body2"
                      fontWeight={index === activeStep ? "bold" : "normal"}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        {/* Scan Results */}
        {scanResults && renderScanResults()}

        {/* Initial state - not scanning and no results yet */}
        {!isScanning && !scanResults && !error && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" paragraph>
              Click "Start Scan" to discover information about your system.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleStartScan}
              startIcon={<SecurityIcon />}
            >
              Start Scan
            </Button>
          </Box>
        )}
      </Box>
    </BaseDialog>
  );
};

export default ScanDialog;
