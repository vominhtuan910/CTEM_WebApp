import React, { useState } from "react";
import { Asset } from "../../../types/asset.types";
import { scanApi } from "../../../services/api";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Divider,
  alpha,
  Button,
  CardActions,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Circle as StatusIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import {
  FaWindows,
  FaApple,
  FaLinux,
  FaUbuntu,
  FaFedora,
  FaRedhat,
  FaCentos,
  FaSuse,
  FaRaspberryPi,
  FaServer,
  FaCloud,
  FaQuestion,
} from "react-icons/fa";
import {
  SiArchlinux,
  SiKalilinux,
  SiManjaro,
  SiGentoo,
  SiElementary,
  SiDebian,
} from "react-icons/si";
import {
  cardStyles,
  actionButtonStyle,
} from "../../../utils/assets/assetStyles";

// Define PaletteColor type
type PaletteColor =
  | "primary"
  | "secondary"
  | "error"
  | "warning"
  | "info"
  | "success";

interface AssetCardGridProps {
  asset: Asset;
  onDelete: (asset: Asset) => void;
}

const AssetCardGrid: React.FC<AssetCardGridProps> = ({ asset, onDelete }) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleScanVulnerabilities = async () => {
    try {
      setIsScanning(true);
      const result = await scanApi.scanVulnerabilities(asset.id);

      if (result.success) {
        // You could add a toast notification here
        console.log("Vulnerability scan started successfully:", result);
      } else {
        console.error("Failed to start vulnerability scan:", result);
      }
    } catch (error) {
      console.error("Error starting vulnerability scan:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusColor = (status: string): PaletteColor => {
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "maintenance":
        return "warning";
      default:
        return "primary";
    }
  };

  const getOsIcon = () => {
    const osName = asset.os.name.toLowerCase();
    const iconSize = 40;

    // For debugging
    console.log(`OS Name: ${asset.os.name}`);

    // Direct match for exact OS names
    switch (osName) {
      case "windows":
        return <FaWindows size={iconSize} />;
      case "ubuntu":
        return <FaUbuntu size={iconSize} />;
      case "macos":
        return <FaApple size={iconSize} />;
      case "centos":
        return <FaCentos size={iconSize} />;
      case "debian":
        return <SiDebian size={iconSize} />;
    }

    // Fallback to substring detection
    // Windows detection
    if (osName.includes("windows")) {
      return <FaWindows size={iconSize} />;
    }

    // macOS detection
    if (
      osName.includes("mac") ||
      osName.includes("osx") ||
      osName.includes("macos")
    ) {
      return <FaApple size={iconSize} />;
    }

    // Linux distributions
    if (
      osName.includes("linux") ||
      osName.includes("gnu") ||
      osName.includes("unix")
    ) {
      // Ubuntu
      if (
        osName.includes("ubuntu") ||
        osName.includes("kubuntu") ||
        osName.includes("xubuntu")
      ) {
        return <FaUbuntu size={iconSize} />;
      }

      // Fedora
      if (
        osName.includes("fedora") ||
        osName.includes("red hat") ||
        osName.includes("redhat") ||
        osName.includes("rhel")
      ) {
        return osName.includes("fedora") ? (
          <FaFedora size={iconSize} />
        ) : (
          <FaRedhat size={iconSize} />
        );
      }

      // Debian
      if (osName.includes("debian")) {
        return <SiDebian size={iconSize} />;
      }

      // CentOS
      if (osName.includes("centos") || osName.includes("cent os")) {
        return <FaCentos size={iconSize} />;
      }

      // SUSE
      if (
        osName.includes("suse") ||
        osName.includes("opensuse") ||
        osName.includes("open suse")
      ) {
        return <FaSuse size={iconSize} />;
      }

      // Arch
      if (osName.includes("arch")) {
        return <SiArchlinux size={iconSize} />;
      }

      // Kali
      if (osName.includes("kali")) {
        return <SiKalilinux size={iconSize} />;
      }

      // Manjaro
      if (osName.includes("manjaro")) {
        return <SiManjaro size={iconSize} />;
      }

      // Gentoo
      if (osName.includes("gentoo")) {
        return <SiGentoo size={iconSize} />;
      }

      // Elementary OS
      if (osName.includes("elementary")) {
        return <SiElementary size={iconSize} />;
      }

      // Raspberry Pi OS
      if (osName.includes("raspberry") || osName.includes("raspbian")) {
        return <FaRaspberryPi size={iconSize} />;
      }

      // Generic Linux
      return <FaLinux size={iconSize} />;
    }

    // Ubuntu (special case, as it might not include "linux" in the name)
    if (osName.includes("ubuntu")) {
      return <FaUbuntu size={iconSize} />;
    }

    // CentOS (special case, as it might not include "linux" in the name)
    if (osName.includes("centos")) {
      return <FaCentos size={iconSize} />;
    }

    // Debian (special case, as it might not include "linux" in the name)
    if (osName.includes("debian")) {
      return <SiDebian size={iconSize} />;
    }

    // Cloud or Virtual Servers
    if (
      osName.includes("cloud") ||
      osName.includes("virtual") ||
      osName.includes("vm") ||
      osName.includes("hypervisor")
    ) {
      return <FaCloud size={iconSize} />;
    }

    // Server OS
    if (osName.includes("server") || osName.includes("network")) {
      return <FaServer size={iconSize} />;
    }

    // Fallback
    console.log("Falling back to question mark icon for OS:", asset.os.name);
    return <FaQuestion size={iconSize} />;
  };

  const statusColor = getStatusColor(asset.status);

  return (
    <Card sx={cardStyles.gridCard}>
      <CardContent sx={{ p: 3 }}>
        {/* Status Indicator */}
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            bgcolor: (theme) => alpha(theme.palette[statusColor].main, 0.1),
          }}
        >
          <StatusIcon
            sx={{
              fontSize: 10,
              color: `${statusColor}.main`,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: `${statusColor}.main`,
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {asset.status}
          </Typography>
        </Box>

        {/* Asset Type Icon */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: "50%",
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {getOsIcon()}
          </Box>
        </Box>

        {/* Hostname & IP */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            {asset.hostname}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontFamily: "monospace" }}
          >
            {asset.ipAddress}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* OS Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" align="center">
            {asset.os.name} {asset.os.version}
          </Typography>
          <Typography
            variant="caption"
            align="center"
            display="block"
            color="text.secondary"
          >
            {asset.os.architecture}
          </Typography>
        </Box>
      </CardContent>

      {/* Scan Vulnerabilities Button */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          fullWidth
          startIcon={<SecurityIcon />}
          onClick={handleScanVulnerabilities}
          disabled={isScanning}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {isScanning ? "Scanning..." : "Scan Vulnerabilities"}
        </Button>
      </CardActions>

      {/* Action Buttons */}
      <Box
        className="asset-actions"
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          display: "flex",
          gap: 1,
          opacity: 0,
          transition: "opacity 0.2s ease-in-out",
          zIndex: 2,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip title="Delete">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onDelete(asset);
            }}
            size="small"
            sx={actionButtonStyle("error")}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default AssetCardGrid;
