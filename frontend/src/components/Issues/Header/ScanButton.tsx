import { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { SecurityOutlined } from "@mui/icons-material";

interface ScanButtonProps {
  onScanComplete: (success: boolean, data?: any) => void;
}

const ScanButton: React.FC<ScanButtonProps> = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);

    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      onScanComplete(true, { scanDate: new Date() });
    }, 2000);
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
