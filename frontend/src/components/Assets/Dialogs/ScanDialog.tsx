import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  TextField,
} from "@mui/material";

import { Warning as WarningIcon } from "@mui/icons-material";

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
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scan options
  const [target, setTarget] = useState<string>("localhost");

  // Check if Windows platform
  const isWindows = navigator.userAgent.toLowerCase().includes("win");

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setError(null);
      setTarget("localhost");
      setIsScanning(false);
    }
  }, [open]);

  // Simple scanning message
  const scanningMessage =
    "Running Nmap network discovery. This may take a few minutes...";

  // Simplified handleStartScan function
  const handleStartScan = async () => {
    setIsScanning(true);
    setError(null);

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

      // Parse the scan results directly from the Nmap response
      const parsedResults = await parserApi.parseScan(newScanId, scanResult);

      setIsScanning(false);

      // Pass the results to the parent component and close dialog
      onScanComplete(true, {
        scanDate: new Date(),
        target,
        scanId: newScanId,
        results: parsedResults,
        savedAsset: scanResult.saved_assets > 0,
        hostsFound: scanResult.total_hosts || 0,
        assetsAdded: scanResult.saved_assets || 0,
      });

      // Close the dialog immediately after successful scan
      onClose();
    } catch (error) {
      console.error("Nmap scan failed:", error);
      setIsScanning(false);

      // Simplified error handling
      let errorMessage =
        "Nmap scan failed. Please check your network connection and try again.";

      if (error instanceof Error) {
        if (
          error.message.includes("permission") ||
          error.message.includes("administrator")
        ) {
          errorMessage =
            "Nmap scan failed due to insufficient privileges. Try running as administrator.";
        } else if (
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("Network Error")
        ) {
          errorMessage =
            "Cannot connect to the backend server. Please make sure it's running.";
        } else if (
          error.message.includes("not found") ||
          error.message.includes("not installed")
        ) {
          errorMessage =
            "Nmap is not installed. Please install Nmap and try again.";
        }
      }

      setError(errorMessage);
      onScanComplete(false, { error: errorMessage });
    }
  };

  return (
    <BaseDialog
      isOpen={open}
      title="Network Discovery"
      body=""
      primaryLabel={isScanning ? "Scanning..." : "Start network scan"}
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
        {isWindows && !isScanning && (
          <Alert severity="info" icon={<WarningIcon />} sx={{ mb: 2 }}>
            Nmap may require administrator privileges for better results.
          </Alert>
        )}

        {/* Target input */}
        {!isScanning && (
          <TextField
            fullWidth
            size="small"
            label="Target Network or IP"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            margin="dense"
            helperText="Enter network IP address with subnet mask (e.g., 192.168.1.0/24)"
            sx={{ mb: 2 }}
          />
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Scanning Message */}
        {isScanning && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              justifyContent: "center",
              py: 3,
            }}
          >
            <CircularProgress size={24} thickness={4} />
            <Typography variant="body1">{scanningMessage}</Typography>
          </Box>
        )}
      </Box>
    </BaseDialog>
  );
};

export default ScanDialog;
