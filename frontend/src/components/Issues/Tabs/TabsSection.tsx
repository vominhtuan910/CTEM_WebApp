import { useState } from "react";
import {
  Box,
  Card,
  Tabs,
  Tab,
  Typography,
  Badge,
  alpha,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  SecurityOutlined,
  BugReportOutlined,
  WarningOutlined,
  NotificationsActiveOutlined,
  AssessmentOutlined,
} from "@mui/icons-material";
import VulnerabilityTable from "../Vulnerability/VulnerabilityTable";
import ScanButton from "../Header/ScanButton";
import RiskAssessmentPanel from "../Summary/RiskAssessmentPanel";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`issues-tabpanel-${index}`}
      aria-labelledby={`issues-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface TabsSectionProps {
  onScanComplete: (success: boolean, data?: any) => void;
}

const TabsSection: React.FC<TabsSectionProps> = ({ onScanComplete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const cardStyles = {
    borderRadius: 2,
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
    border: "1px solid",
    borderColor: "divider",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
      transform: "translateY(-2px)",
    },
  };

  return (
    <Card sx={{ ...cardStyles, mb: 4, overflow: "visible" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : undefined}
          sx={{
            "& .MuiTab-root": {
              py: 2,
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
              },
            },
          }}
        >
          <Tab
            icon={<SecurityOutlined />}
            iconPosition="start"
            label="Vulnerabilities"
            sx={{ borderRadius: "4px 4px 0 0" }}
          />
          <Tab
            icon={<BugReportOutlined />}
            iconPosition="start"
            label="Misconfigurations"
            sx={{ borderRadius: "4px 4px 0 0" }}
          />
          <Tab
            icon={<WarningOutlined />}
            iconPosition="start"
            label="Compliance"
            sx={{ borderRadius: "4px 4px 0 0" }}
          />
          <Tab
            icon={<NotificationsActiveOutlined />}
            iconPosition="start"
            label="Alerts"
            sx={{ borderRadius: "4px 4px 0 0" }}
          />
          <Tab
            icon={<AssessmentOutlined />}
            iconPosition="start"
            label={
              <Badge
                color="error"
                badgeContent="New"
                sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem" } }}
              >
                Risk Assessment
              </Badge>
            }
            sx={{ borderRadius: "4px 4px 0 0" }}
          />
        </Tabs>
      </Box>

      <Box
        sx={{
          p: 3,
          bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
        }}
      >
        <TabPanel value={tabValue} index={0}>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <ScanButton onScanComplete={onScanComplete} />
            <Typography variant="body2" color="text.secondary">
              Pro Tip: Press "S" key to quickly start a new scan
            </Typography>
          </Box>
          <VulnerabilityTable fetchFromApi={false} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
              bgcolor: "white",
              borderRadius: 2,
              p: 4,
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
            <BugReportOutlined
              sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Misconfiguration detection coming soon
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ maxWidth: 400 }}
            >
              We're working on adding tools to detect and fix misconfigurations
              in your systems. This feature will be available in the next
              update.
            </Typography>
            <Button
              variant="outlined"
              sx={{ mt: 3 }}
              startIcon={<NotificationsActiveOutlined />}
            >
              Notify me when available
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
              bgcolor: "white",
              borderRadius: 2,
              p: 4,
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
            <WarningOutlined
              sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Compliance monitoring coming soon
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ maxWidth: 400 }}
            >
              Track compliance with industry standards and regulations. This
              feature will help you ensure your systems meet required security
              standards.
            </Typography>
            <Button
              variant="outlined"
              sx={{ mt: 3 }}
              startIcon={<NotificationsActiveOutlined />}
            >
              Notify me when available
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
              bgcolor: "white",
              borderRadius: 2,
              p: 4,
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
            <NotificationsActiveOutlined
              sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Security alerts coming soon
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ maxWidth: 400 }}
            >
              Get real-time notifications about security events and threats. Set
              up custom alert rules based on severity, asset type, and more.
            </Typography>
            <Button
              variant="outlined"
              sx={{ mt: 3 }}
              startIcon={<NotificationsActiveOutlined />}
            >
              Notify me when available
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <RiskAssessmentPanel />
        </TabPanel>
      </Box>
    </Card>
  );
};

export default TabsSection;
