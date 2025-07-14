import { Asset } from "../../../types/asset.types";
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { FileDownload as ExportIcon } from "@mui/icons-material";
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

interface AssetDetailsProps {
  asset: Asset;
  onClose: () => void;
  onExport: (asset: Asset) => void;
}

const AssetDetails: React.FC<AssetDetailsProps> = ({
  asset,
  onClose,
  onExport,
}) => {
  const getOsIcon = () => {
    const osName = asset.os.name.toLowerCase();
    const version = asset.os.version?.toLowerCase() || "";
    const iconSize = 30;

    // Direct match for exact OS names in our mockAssets data
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
    return <FaQuestion size={iconSize} />;
  };

  return (
    <Box sx={{ maxWidth: "4xl", mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 45,
              height: 45,
              borderRadius: "50%",
              backgroundColor: (theme) => theme.palette.primary.light + "20",
              p: 1,
            }}
          >
            {getOsIcon()}
          </Box>
          <Box>
            <Typography variant="h4">{asset.hostname}</Typography>
            <Typography variant="body2" color="text.secondary">
              Last scan: {new Date(asset.lastScan).toLocaleString()}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="Export Asset Data">
            <IconButton
              onClick={() => onExport(asset)}
              sx={{
                color: "success.main",
                "&:hover": {
                  backgroundColor: "success.light",
                },
              }}
            >
              <ExportIcon />
            </IconButton>
          </Tooltip>
          <Chip
            label={asset.status}
            color={asset.status === "active" ? "success" : "default"}
            size="small"
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* OS Information */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Operating System
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Name
              </Typography>
              <Typography>{asset.os.name}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Version
              </Typography>
              <Typography>{asset.os.version}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Architecture
              </Typography>
              <Typography>{asset.os.architecture}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Build Number
              </Typography>
              <Typography>{asset.os.buildNumber}</Typography>
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Last Boot Time
            </Typography>
            <Typography>
              {new Date(asset.os.lastBootTime).toLocaleString()}
            </Typography>
          </Box>
        </Paper>

        {/* Services */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Services
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Display Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Type</TableCell>
                  <TableCell>PID</TableCell>
                  <TableCell>Port</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {asset.services.map((service, index) => (
                  <TableRow key={index}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.displayName}</TableCell>
                    <TableCell>
                      <Chip
                        label={service.status}
                        color={
                          service.status === "running" ? "success" : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{service.startType}</TableCell>
                    <TableCell>{service.pid || "-"}</TableCell>
                    <TableCell>{service.port || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Applications */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Installed Applications
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Publisher</TableCell>
                  <TableCell>Install Date</TableCell>
                  <TableCell>Size</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {asset.applications.map((app, index) => (
                  <TableRow key={index}>
                    <TableCell>{app.name}</TableCell>
                    <TableCell>{app.version}</TableCell>
                    <TableCell>{app.publisher}</TableCell>
                    <TableCell>
                      {new Date(app.installDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{app.size || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Box sx={{ mt: 6, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": {
              bgcolor: "primary.dark",
            },
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<ExportIcon />}
          onClick={() => onExport(asset)}
          sx={{
            bgcolor: "success.main",
            color: "white",
            "&:hover": {
              bgcolor: "success.dark",
            },
          }}
        >
          Export Data
        </Button>
      </Box>
    </Box>
  );
};

export default AssetDetails;
