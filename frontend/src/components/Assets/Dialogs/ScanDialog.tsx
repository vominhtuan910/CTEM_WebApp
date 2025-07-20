import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  LinearProgress,
  Chip,
  Stack,
  FormGroup,
} from "@mui/material";
import BaseDialog from "../../common/BaseDialog";
import { api } from "../../../services/api";
import toast from "react-hot-toast";

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
  const [scanType, setScanType] = useState<"quick" | "deep">("quick");
  const [ipRange, setIpRange] = useState("192.168.1.1-192.168.1.254");
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [options, setOptions] = useState({
    detectOS: true,
    detectServices: true,
    detectVulnerabilities: false,
    detectApplications: false,
  });

  // Progress simulation interval
  const [progressInterval, setProgressInterval] = useState<number | null>(null);

  const handleOptionChange = (option: keyof typeof options) => {
    setOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleStartScan = async () => {
    setIsScanning(true);
    setProgress(0);

    // Show toast notification
    toast.loading("Starting network scan...", { id: "asset-scan-toast" });

    try {
      // Start progress simulation
      const interval = window.setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prevProgress + (scanType === "quick" ? 5 : 2);
        });
      }, 300);

      setProgressInterval(interval as unknown as number);

      // Call the API to start the scan
      const result = await api.scan.startScan(ipRange.split("-")[0]);

      // Simulate waiting for scan to complete
      const scanDuration = scanType === "quick" ? 3000 : 6000;
      await new Promise((resolve) => setTimeout(resolve, scanDuration));

      // Clear the interval
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      // Set progress to 100% when done
      setProgress(100);

      // Update toast notification
      toast.success("Scan completed successfully!", { id: "asset-scan-toast" });

      // Wait a moment before closing the dialog
      setTimeout(() => {
        setIsScanning(false);
        onScanComplete(true, {
          scanDate: new Date(),
          scanType,
          ipRange,
          assetsFound: Math.floor(Math.random() * 10) + 1, // Mock data
        });
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Scan failed:", error);

      // Clear the interval
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      setIsScanning(false);
      setProgress(0);

      // Show error toast
      toast.error("Scan failed. Please try again.", { id: "asset-scan-toast" });

      onScanComplete(false, { error: "Scan failed. Please try again." });
    }
  };

  // Calculate estimated time based on scan type and options
  const getEstimatedTime = () => {
    let baseTime = scanType === "quick" ? "1-2" : "5-10";

    // Add time for additional options
    if (options.detectVulnerabilities) {
      baseTime = scanType === "quick" ? "3-5" : "10-15";
    }

    return baseTime;
  };

  return (
    <BaseDialog
      isOpen={open}
      title="Scan for Assets"
      body="Scan your network to discover and add new assets automatically."
      primaryLabel={isScanning ? "Scanning..." : "Start Scan"}
      secondaryLabel="Cancel"
      onPrimary={handleStartScan}
      onCancel={onClose}
      closeOnBackdropClick={!isScanning}
      closeOnEsc={!isScanning}
      mode="default"
      preLabel="Network Discovery"
      disablePrimaryButton={isScanning}
    >
      <Box sx={{ mt: 2 }}>
        {/* Scan Type Selection */}
        <Typography variant="subtitle2" gutterBottom>
          Scan Type
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            row
            value={scanType}
            onChange={(e) => setScanType(e.target.value as "quick" | "deep")}
          >
            <FormControlLabel
              value="quick"
              control={<Radio />}
              label="Quick Scan"
              disabled={isScanning}
            />
            <FormControlLabel
              value="deep"
              control={<Radio />}
              label="Deep Scan"
              disabled={isScanning}
            />
          </RadioGroup>
        </FormControl>

        {/* IP Range Input */}
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Target IP Range
        </Typography>
        <TextField
          fullWidth
          placeholder="e.g. 192.168.1.1-192.168.1.254"
          value={ipRange}
          onChange={(e) => setIpRange(e.target.value)}
          disabled={isScanning}
          size="small"
          sx={{ mb: 3 }}
        />

        {/* Scan Options */}
        <Typography variant="subtitle2" gutterBottom>
          Scan Options
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={options.detectOS}
                onChange={() => handleOptionChange("detectOS")}
                disabled={isScanning}
              />
            }
            label="Detect Operating Systems"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.detectServices}
                onChange={() => handleOptionChange("detectServices")}
                disabled={isScanning}
              />
            }
            label="Detect Running Services"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.detectApplications}
                onChange={() => handleOptionChange("detectApplications")}
                disabled={isScanning}
              />
            }
            label="Detect Installed Applications"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.detectVulnerabilities}
                onChange={() => handleOptionChange("detectVulnerabilities")}
                disabled={isScanning}
              />
            }
            label="Scan for Vulnerabilities"
          />
        </FormGroup>

        {/* Scan Information */}
        <Box sx={{ mt: 3, mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Chip
              label={`Scan Type: ${scanType === "quick" ? "Quick" : "Deep"}`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Est. Time: ${getEstimatedTime()} minutes`}
              size="small"
              color="secondary"
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* Progress Bar */}
        {isScanning && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {progress < 100
                ? "Scanning network..."
                : "Scan complete! Processing results..."}
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
      </Box>
    </BaseDialog>
  );
};

export default ScanDialog;
