import { useState } from "react";
import { Button, CircularProgress, Tooltip, Box } from "@mui/material";
import { SecurityOutlined, InfoOutlined } from "@mui/icons-material";
import { scanApi } from "../../../services/api";
import { toast } from "react-hot-toast";

interface ScanButtonProps {
  onScanComplete: (success: boolean, data?: any) => void;
}

const ScanButton: React.FC<ScanButtonProps> = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);

  // Check if platform is Windows for admin warning
  const isWindows = navigator.platform.toLowerCase().includes("win");

  const handleScan = async () => {
    setIsScanning(true);

    try {
      // Show toast notification
      toast.loading("Starting security scan...", { id: "scan-toast" });

      // Use the real API to start a scan with auto OS detection
      const scanResult = await scanApi.startScan({
        target: "localhost",
        autoDetectOS: true, // Enable automatic OS detection and tool selection
        scanOptions: {
          systemScan: true,
          networkScan: true,
          servicesScan: true,
        },
      });

      // Get scan tools status
      const toolsStatus = await scanApi.getScanToolsStatus();

      // Update toast notification
      toast.success("Scan completed successfully!", { id: "scan-toast" });

      setIsScanning(false);
      onScanComplete(true, {
        scanDate: new Date(),
        scanId: scanResult.scanId,
        toolsStatus,
      });
    } catch (error) {
      console.error("Scan failed:", error);
      setIsScanning(false);

      // Check if the error is related to admin privileges
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isAdminError =
        errorMsg.toLowerCase().includes("administrator") ||
        errorMsg.toLowerCase().includes("elevation");

      // Show appropriate error message
      if (isAdminError) {
        toast.error(
          "Scan requires administrator privileges. Please restart the application as administrator.",
          {
            id: "scan-toast",
            duration: 5000,
          }
        );
      } else {
        toast.error("Scan failed. Please try again.", { id: "scan-toast" });
      }

      onScanComplete(false, { error: errorMsg });
    }
  };

  const scanButton = (
    <Button
      variant="contained"
      color="primary"
      startIcon={
        isScanning ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <SecurityOutlined />
        )
      }
      onClick={handleScan}
      disabled={isScanning}
      sx={{ borderRadius: 2 }}
      endIcon={isWindows ? <InfoOutlined fontSize="small" /> : undefined}
    >
      {isScanning ? "Scanning..." : "Scan for Vulnerabilities"}
    </Button>
  );

  // Wrap with tooltip only on Windows
  return isWindows ? (
    <Tooltip
      title={
        <Box sx={{ p: 0.5 }}>
          Full system scanning requires administrator privileges on Windows.
          <br />
          Some features may not work if not running as administrator.
        </Box>
      }
      arrow
      placement="bottom"
    >
      <span>{scanButton}</span>
    </Tooltip>
  ) : (
    scanButton
  );
};

export default ScanButton;
