import { Asset } from "../../../types/asset.types";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Box,
  alpha,
  CardActionArea,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Circle as StatusIcon,
  Settings as ServicesIcon,
  Apps as AppsIcon,
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

interface AssetCardListProps {
  asset: Asset;
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onExport: (asset: Asset) => void;
}

const AssetCardList: React.FC<AssetCardListProps> = ({
  asset,
  onView,
  onEdit,
  onDelete,
  onExport,
}) => {
  const runningServices = asset.services.filter(
    (s) => s.status === "running"
  ).length;
  const totalServices = asset.services.length;

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
    const version = asset.os.version?.toLowerCase() || "";
    const iconSize = 20;

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

  const statusColor = getStatusColor(asset.status);

  const handleCardClick = () => {
    onView(asset);
  };

  return (
    <Card sx={cardStyles.listCard}>
      <CardActionArea onClick={handleCardClick} sx={{ height: "100%" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Icon and Basic Info */}
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: (theme) =>
                  alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
              }}
            >
              {getOsIcon()}
            </Box>

            {/* Hostname and IP */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                {asset.hostname}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontFamily: "monospace",
                }}
              >
                {asset.ipAddress}
              </Typography>
            </Box>

            {/* OS Info */}
            <Box sx={{ minWidth: 200 }}>
              <Typography variant="body2" sx={{ color: "text.primary" }}>
                {asset.os.name} {asset.os.version}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {asset.os.architecture}
              </Typography>
            </Box>

            {/* Services & Apps Count */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip
                title={`${runningServices}/${totalServices} Services Running`}
              >
                <Chip
                  icon={<ServicesIcon fontSize="small" />}
                  label={`${runningServices}/${totalServices}`}
                  size="small"
                  sx={{ borderRadius: 1 }}
                />
              </Tooltip>
              <Tooltip title={`${asset.applications.length} Applications`}>
                <Chip
                  icon={<AppsIcon fontSize="small" />}
                  label={asset.applications.length}
                  size="small"
                  sx={{ borderRadius: 1 }}
                />
              </Tooltip>
            </Box>

            {/* Status */}
            <Box sx={{ minWidth: 90 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  maxWidth: "fit-content",
                  bgcolor: (theme) =>
                    alpha(theme.palette[statusColor].main, 0.1),
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
            </Box>

            {/* Action Buttons */}
            <Box
              className="asset-actions"
              sx={{
                display: "flex",
                gap: 1,
                opacity: 0,
                transition: "opacity 0.2s ease-in-out",
                zIndex: 2,
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip title="Edit">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(asset);
                  }}
                  size="small"
                  sx={actionButtonStyle("info")}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
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
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default AssetCardList;
