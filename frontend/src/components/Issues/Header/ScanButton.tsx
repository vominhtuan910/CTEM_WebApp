import { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { SecurityOutlined } from "@mui/icons-material";
import { api } from "../../../services/api";
import toast from "react-hot-toast";

interface ScanButtonProps {
  onScanComplete: (success: boolean, data?: any) => void;
}

const ScanButton: React.FC<ScanButtonProps> = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);

    try {
      // Show toast notification
      toast.loading("Starting security scan...", { id: "scan-toast" });

      // Use the real API to start a scan
      const result = await api.scan.startScan("127.0.0.1");

      // After scan completes, get the port data
      const portData = await api.scan.getPorts();

      // Update toast notification
      toast.success("Scan completed successfully!", { id: "scan-toast" });

      setIsScanning(false);
      onScanComplete(true, {
        scanDate: new Date(),
        ports: portData,
      });
    } catch (error) {
      console.error("Scan failed:", error);
      setIsScanning(false);

      // Show error toast
      toast.error("Scan failed. Please try again.", { id: "scan-toast" });

      onScanComplete(false, { error: "Scan failed. Please try again." });
    }
  };

  return (
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
    >
      {isScanning ? "Scanning..." : "Scan for Vulnerabilities"}
    </Button>
  );
};

export default ScanButton;
