import { useState } from "react";
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
  Card,
  CardHeader,
  CardContent,
  Collapse,
  Fade,
  Grow,
  Zoom,
  alpha,
  useTheme,
  TablePagination,
} from "@mui/material";
import {
  FileDownload as ExportIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
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

interface AssetDetailsProps {
  asset: Asset;
  onClose: () => void;
  onExport: (asset: Asset) => void;
  view?: "overview" | "services" | "applications";
  onTabChange?: (event: React.SyntheticEvent | null, newValue: number) => void;
}

const AssetDetails: React.FC<AssetDetailsProps> = ({
  asset,
  onClose,
  onExport,
  view = "overview",
  onTabChange,
}) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    os: true,
    services: true,
    applications: true,
  });
  const [servicesPage, setServicesPage] = useState(0);
  const [servicesRowsPerPage, setServicesRowsPerPage] = useState(5);
  const [appsPage, setAppsPage] = useState(0);
  const [appsRowsPerPage, setAppsRowsPerPage] = useState(5);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle services pagination
  const handleServicesPageChange = (event: unknown, newPage: number) => {
    setServicesPage(newPage);
  };

  const handleServicesRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setServicesRowsPerPage(parseInt(event.target.value, 10));
    setServicesPage(0);
  };

  // Handle applications pagination
  const handleAppsPageChange = (event: unknown, newPage: number) => {
    setAppsPage(newPage);
  };

  const handleAppsRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAppsRowsPerPage(parseInt(event.target.value, 10));
    setAppsPage(0);
  };

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

  // Render services view
  const renderServicesView = () => {
    return (
      <Fade in={true} timeout={800}>
        <Box sx={{ p: 2 }}>
          <Card
            elevation={0}
            sx={{
              mb: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <CardHeader
              title={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">Running Services</Typography>
                  <Chip
                    label={`${asset.services.length} services`}
                    size="small"
                    color="primary"
                  />
                </Box>
              }
              sx={{
                bgcolor:
                  theme.palette.mode === "light" ? "grey.50" : "grey.900",
                borderBottom: "1px solid",
                borderColor: "divider",
                py: 1,
              }}
            />
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}
                  >
                    <TableRow>
                      <TableCell>Service Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Start Type</TableCell>
                      <TableCell>PID</TableCell>
                      <TableCell>Port</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {asset.services
                      .slice(
                        servicesPage * servicesRowsPerPage,
                        servicesPage * servicesRowsPerPage + servicesRowsPerPage
                      )
                      .map((service, idx) => (
                        <TableRow
                          key={idx}
                          hover
                          sx={{
                            "&:nth-of-type(odd)": {
                              bgcolor:
                                theme.palette.mode === "light"
                                  ? alpha(theme.palette.grey[50], 0.5)
                                  : alpha(theme.palette.grey[900], 0.5),
                            },
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {service.displayName || service.name}
                            </Typography>
                            {service.displayName &&
                              service.displayName !== service.name && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {service.name}
                                </Typography>
                              )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={service.status}
                              color={
                                service.status === "running"
                                  ? "success"
                                  : service.status === "stopped"
                                  ? "error"
                                  : "default"
                              }
                              sx={{ minWidth: 75, fontSize: "0.75rem" }}
                            />
                          </TableCell>
                          <TableCell>{service.startType}</TableCell>
                          <TableCell>{service.pid || "N/A"}</TableCell>
                          <TableCell>{service.port || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={asset.services.length}
                rowsPerPage={servicesRowsPerPage}
                page={servicesPage}
                onPageChange={handleServicesPageChange}
                onRowsPerPageChange={handleServicesRowsPerPageChange}
              />
            </CardContent>
          </Card>
        </Box>
      </Fade>
    );
  };

  // Render applications view
  const renderApplicationsView = () => {
    return (
      <Fade in={true} timeout={800}>
        <Box sx={{ p: 2 }}>
          <Card
            elevation={0}
            sx={{
              mb: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <CardHeader
              title={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">Installed Applications</Typography>
                  <Chip
                    label={`${asset.applications.length} applications`}
                    size="small"
                    color="primary"
                  />
                </Box>
              }
              sx={{
                bgcolor:
                  theme.palette.mode === "light" ? "grey.50" : "grey.900",
                borderBottom: "1px solid",
                borderColor: "divider",
                py: 1,
              }}
            />
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}
                  >
                    <TableRow>
                      <TableCell>Application</TableCell>
                      <TableCell>Version</TableCell>
                      <TableCell>Publisher</TableCell>
                      <TableCell>Install Date</TableCell>
                      <TableCell>Size</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {asset.applications
                      .slice(
                        appsPage * appsRowsPerPage,
                        appsPage * appsRowsPerPage + appsRowsPerPage
                      )
                      .map((app, idx) => (
                        <TableRow
                          key={idx}
                          hover
                          sx={{
                            "&:nth-of-type(odd)": {
                              bgcolor:
                                theme.palette.mode === "light"
                                  ? alpha(theme.palette.grey[50], 0.5)
                                  : alpha(theme.palette.grey[900], 0.5),
                            },
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {app.name}
                            </Typography>
                          </TableCell>
                          <TableCell>{app.version}</TableCell>
                          <TableCell>{app.publisher}</TableCell>
                          <TableCell>
                            {new Date(app.installDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{app.size || "Unknown"}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={asset.applications.length}
                rowsPerPage={appsRowsPerPage}
                page={appsPage}
                onPageChange={handleAppsPageChange}
                onRowsPerPageChange={handleAppsRowsPerPageChange}
              />
            </CardContent>
          </Card>
        </Box>
      </Fade>
    );
  };

  // Render overview view
  const renderOverviewView = () => {
    return (
      <Box sx={{ maxWidth: "4xl", mx: "auto", p: 2 }}>
        {/* Header */}
        <Zoom in={true} timeout={500}>
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
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.1),
                  p: 1,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                  },
                }}
              >
                {getOsIcon()}
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="medium">
                  {asset.hostname}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  IP: {asset.ipAddress}
                  {asset.ipAddresses && asset.ipAddresses.length > 1 && (
                    <Tooltip title={asset.ipAddresses.join(", ")}>
                      <Chip
                        size="small"
                        label={`+${asset.ipAddresses.length - 1}`}
                        sx={{ ml: 1, height: 16, fontSize: "0.6rem" }}
                      />
                    </Tooltip>
                  )}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                label={asset.status}
                color={asset.status === "active" ? "success" : "default"}
                size="small"
                sx={{ borderRadius: 1 }}
              />
            </Box>
          </Box>
        </Zoom>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* OS Information */}
          <Grow in={true} timeout={700} style={{ transformOrigin: "0 0 0" }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="h6">Operating System</Typography>
                    {getOsIcon()}
                  </Box>
                }
                action={
                  <IconButton
                    onClick={() => toggleSection("os")}
                    sx={{
                      transform: expandedSections.os
                        ? "rotate(0deg)"
                        : "rotate(180deg)",
                      transition: "transform 0.3s",
                    }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                }
                sx={{
                  bgcolor:
                    theme.palette.mode === "light" ? "grey.50" : "grey.900",
                  borderBottom: expandedSections.os ? "1px solid" : "none",
                  borderColor: "divider",
                  py: 1,
                }}
              />
              <Collapse in={expandedSections.os} timeout="auto" unmountOnExit>
                <CardContent>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr 1fr",
                        md: "repeat(4, 1fr)",
                      },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography fontWeight={500}>{asset.os.name}</Typography>
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
                </CardContent>
              </Collapse>
            </Card>
          </Grow>

          {/* Services */}
          <Grow in={true} timeout={900} style={{ transformOrigin: "0 0 0" }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <CardHeader
                title={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="h6">Services</Typography>
                    <Chip
                      label={`${asset.services.length} services`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                }
                action={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {asset.services.length > 5 && (
                      <Button
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => handleTabChange(1)}
                        sx={{ mr: 1, fontSize: "0.75rem" }}
                      >
                        View All
                      </Button>
                    )}
                    <IconButton
                      onClick={() => toggleSection("services")}
                      sx={{
                        transform: expandedSections.services
                          ? "rotate(0deg)"
                          : "rotate(180deg)",
                        transition: "transform 0.3s",
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>
                }
                sx={{
                  bgcolor:
                    theme.palette.mode === "light" ? "grey.50" : "grey.900",
                  borderBottom: expandedSections.services
                    ? "1px solid"
                    : "none",
                  borderColor: "divider",
                  py: 1,
                }}
              />
              <Collapse
                in={expandedSections.services}
                timeout="auto"
                unmountOnExit
              >
                <CardContent sx={{ p: 0 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        }}
                      >
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
                        {asset.services.slice(0, 5).map((service, index) => (
                          <TableRow
                            key={index}
                            hover
                            sx={{
                              "&:nth-of-type(odd)": {
                                bgcolor:
                                  theme.palette.mode === "light"
                                    ? alpha(theme.palette.grey[50], 0.5)
                                    : alpha(theme.palette.grey[900], 0.5),
                              },
                            }}
                          >
                            <TableCell>{service.name}</TableCell>
                            <TableCell>{service.displayName}</TableCell>
                            <TableCell>
                              <Chip
                                label={service.status}
                                color={
                                  service.status === "running"
                                    ? "success"
                                    : service.status === "stopped"
                                    ? "error"
                                    : "default"
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
                </CardContent>
              </Collapse>
            </Card>
          </Grow>

          {/* Applications */}
          <Grow in={true} timeout={1100} style={{ transformOrigin: "0 0 0" }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <CardHeader
                title={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="h6">Installed Applications</Typography>
                    <Chip
                      label={`${asset.applications.length} applications`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                }
                action={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {asset.applications.length > 5 && (
                      <Button
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => handleTabChange(2)}
                        sx={{ mr: 1, fontSize: "0.75rem" }}
                      >
                        View All
                      </Button>
                    )}
                    <IconButton
                      onClick={() => toggleSection("applications")}
                      sx={{
                        transform: expandedSections.applications
                          ? "rotate(0deg)"
                          : "rotate(180deg)",
                        transition: "transform 0.3s",
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>
                }
                sx={{
                  bgcolor:
                    theme.palette.mode === "light" ? "grey.50" : "grey.900",
                  borderBottom: expandedSections.applications
                    ? "1px solid"
                    : "none",
                  borderColor: "divider",
                  py: 1,
                }}
              />
              <Collapse
                in={expandedSections.applications}
                timeout="auto"
                unmountOnExit
              >
                <CardContent sx={{ p: 0 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        }}
                      >
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Version</TableCell>
                          <TableCell>Publisher</TableCell>
                          <TableCell>Install Date</TableCell>
                          <TableCell>Size</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {asset.applications.slice(0, 5).map((app, index) => (
                          <TableRow
                            key={index}
                            hover
                            sx={{
                              "&:nth-of-type(odd)": {
                                bgcolor:
                                  theme.palette.mode === "light"
                                    ? alpha(theme.palette.grey[50], 0.5)
                                    : alpha(theme.palette.grey[900], 0.5),
                              },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {app.name}
                              </Typography>
                            </TableCell>
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
                </CardContent>
              </Collapse>
            </Card>
          </Grow>
        </Box>
      </Box>
    );
  };

  // Function to set tab value - needed for "View all" buttons
  const handleTabChange = (tabIndex: number) => {
    if (onTabChange) {
      onTabChange(null, tabIndex);
    }
  };

  // Return the content based on the current view
  switch (view) {
    case "services":
      return renderServicesView();
    case "applications":
      return renderApplicationsView();
    case "overview":
    default:
      return renderOverviewView();
  }
};

export default AssetDetails;
