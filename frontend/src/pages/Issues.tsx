import React, { useState} from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Button,
  Card,
  CardContent,
  Chip,
  alpha,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Fade,
  CircularProgress
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import BugReportIcon from '@mui/icons-material/BugReport';
import WarningIcon from '@mui/icons-material/Warning';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ShieldIcon from '@mui/icons-material/Shield';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsIcon from '@mui/icons-material/Settings';

import VulnerabilityTable from '../components/Issues/Vulnerability/VulnerabilityTable';
import TrendChart from '../components/Issues/TrendChart';
import SecurityScoreCard from '../components/Issues/SecurityScoreCard';
import useVulnerabilityData from '../hooks/useVulnerabilityData';

// Interface for the tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`issues-tabpanel-${index}`}
      aria-labelledby={`issues-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Common styles for cards and sections
const cardStyles = {
  borderRadius: 2,
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  border: '1px solid',
  borderColor: 'divider',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)'
  }
};

// Scan Button component
const ScanButton: React.FC<{ onScanComplete: (success: boolean, data?: any) => void }> = ({ onScanComplete }) => {
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
      startIcon={isScanning ? <CircularProgress size={20} color="inherit" /> : <SecurityIcon />}
      onClick={handleScan}
      disabled={isScanning}
      sx={{ borderRadius: 2 }}
    >
      {isScanning ? 'Scanning...' : 'Scan for Vulnerabilities'}
    </Button>
  );
};

const Issues: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [lastScanDate, setLastScanDate] = useState<string | null>(null);
  
  // Use the hook to get vulnerability data
  const { 
    summary, 
    refreshData, 
    isRefreshing, 
    trends 
  } = useVulnerabilityData();
  
  const { 
    total: totalIssues, 
    critical: criticalCount, 
    high: highCount, 
    medium: mediumCount, 
    low: lowCount 
  } = summary;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleScanComplete = (success: boolean, data?: any) => {
    if (success && data) {
      setLastScanDate(new Date().toLocaleString());
      refreshData();
    }
  };

  const handleRefresh = () => {
    refreshData();
    setLastScanDate(new Date().toLocaleString());
  };

  return (
    <Container maxWidth="xl" sx={{ pt: 3, mt: 2, pb: 6 }}>
      {/* Header Section */}
      <Box 
        sx={{ 
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2
        }}
      >
        <Box>
          <Box display="flex" alignItems="center" mb={1}>
            <ShieldIcon 
              sx={{ 
                fontSize: 40, 
                color: 'primary.main',
                mr: 2,
                p: 1,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)
              }} 
            />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Security Issues
            </Typography>
          </Box>
          
          <Typography variant="body1" color="text.secondary">
            Manage and track security issues across your assets
            {lastScanDate && (
              <Box component="span" ml={2} fontStyle="italic">
                Last scan: {lastScanDate}
              </Box>
            )}
          </Typography>
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 1,
            width: { xs: '100%', md: 'auto' }
          }}
        >
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={handleRefresh}
              sx={{ 
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                }
              }}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <RefreshIcon />
              )}
            </IconButton>
          </Tooltip>
          
          <Button 
            variant="outlined" 
            startIcon={<FilterAltIcon />}
            sx={{ 
              borderRadius: 2,
              flex: { xs: 1, md: 'none' }
            }}
          >
            Filters
          </Button>
          
          <Button 
            variant="contained" 
            disableElevation
            startIcon={<DownloadIcon />}
            sx={{ 
              borderRadius: 2,
              flex: { xs: 1, md: 'none' }
            }}
          >
            Export
          </Button>
          
          <Tooltip title="Security settings">
            <IconButton 
              sx={{ 
                bgcolor: (theme) => alpha(theme.palette.grey[200], 0.5),
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.grey[300], 0.7),
                }
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Analytics Section */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 66%' }}>
          <TrendChart data={trends} isLoading={isRefreshing} />
        </Box>
        <Box sx={{ flex: '1 1 33%' }}>
          <SecurityScoreCard summary={summary} isLoading={isRefreshing} />
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: '1fr 1fr', 
            md: '1fr 1fr 1fr 1fr' 
          }, 
          gap: 3, 
          mb: 4 
        }}
      >
        <Fade in={true} style={{ transitionDelay: '100ms' }}>
          <Card sx={cardStyles}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                <Box display="flex" alignItems="center">
                  <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight="medium">Total Issues</Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {totalIssues}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip 
                    label={`${criticalCount} Critical`} 
                    size="small" 
                    color="error"
                    sx={{ borderRadius: 1 }}
                  />
                  <Chip 
                    label={`${highCount} High`} 
                    size="small" 
                    color="warning"
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>
        
        <Fade in={true} style={{ transitionDelay: '200ms' }}>
          <Card sx={cardStyles}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, bgcolor: (theme) => alpha(theme.palette.error.main, 0.05) }}>
                <Box display="flex" alignItems="center">
                  <SecurityIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight="medium">Critical Issues</Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="h3" fontWeight="bold" color="error.main">
                  {criticalCount}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Requires immediate attention
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
        
        <Fade in={true} style={{ transitionDelay: '300ms' }}>
          <Card sx={cardStyles}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05) }}>
                <Box display="flex" alignItems="center">
                  <WarningIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight="medium">High Issues</Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="h3" fontWeight="bold" color="warning.main">
                  {highCount}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Should be addressed soon
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
        
        <Fade in={true} style={{ transitionDelay: '400ms' }}>
          <Card sx={cardStyles}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, bgcolor: (theme) => alpha(theme.palette.info.main, 0.05) }}>
                <Box display="flex" alignItems="center">
                  <BugReportIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight="medium">Other Issues</Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="h3" fontWeight="bold" color="info.main">
                  {mediumCount + lowCount}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip 
                    label={`${mediumCount} Medium`} 
                    size="small" 
                    color="info"
                    sx={{ borderRadius: 1 }}
                  />
                  <Chip 
                    label={`${lowCount} Low`} 
                    size="small" 
                    color="success"
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Box>

      {/* Tabs Section */}
      <Card sx={{ ...cardStyles, mb: 4, overflow: 'visible' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : undefined}
            sx={{
              '& .MuiTab-root': {
                py: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                }
              }
            }}
          >
            <Tab 
              icon={<SecurityIcon />} 
              iconPosition="start" 
              label="Vulnerabilities" 
              sx={{ borderRadius: '4px 4px 0 0' }}
            />
            <Tab 
              icon={<BugReportIcon />} 
              iconPosition="start" 
              label="Misconfigurations" 
              sx={{ borderRadius: '4px 4px 0 0' }}
            />
            <Tab 
              icon={<WarningIcon />} 
              iconPosition="start" 
              label="Compliance" 
              sx={{ borderRadius: '4px 4px 0 0' }}
            />
            <Tab 
              icon={<NotificationsActiveIcon />} 
              iconPosition="start" 
              label="Alerts" 
              sx={{ borderRadius: '4px 4px 0 0' }}
            />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 3, bgcolor: (theme) => alpha(theme.palette.background.default, 0.5) }}>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3 }}>
              <ScanButton onScanComplete={handleScanComplete} />
            </Box>
            <VulnerabilityTable fetchFromApi={false} />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px',
                bgcolor: 'white',
                borderRadius: 2,
                p: 4,
                border: '1px dashed',
                borderColor: 'divider'
              }}
            >
              <BugReportIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Misconfiguration detection coming soon
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
                We're working on adding tools to detect and fix misconfigurations in your systems.
                This feature will be available in the next update.
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 3 }}
                startIcon={<NotificationsActiveIcon />}
              >
                Notify me when available
              </Button>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px',
                bgcolor: 'white',
                borderRadius: 2,
                p: 4,
                border: '1px dashed',
                borderColor: 'divider'
              }}
            >
              <WarningIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Compliance monitoring coming soon
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
                Track compliance with industry standards and regulations.
                This feature will help you ensure your systems meet required security standards.
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 3 }}
                startIcon={<NotificationsActiveIcon />}
              >
                Notify me when available
              </Button>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px',
                bgcolor: 'white',
                borderRadius: 2,
                p: 4,
                border: '1px dashed',
                borderColor: 'divider'
              }}
            >
              <NotificationsActiveIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Security alerts coming soon
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
                Get real-time notifications about security events and threats.
                Set up custom alert rules based on severity, asset type, and more.
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 3 }}
                startIcon={<NotificationsActiveIcon />}
              >
                Notify me when available
              </Button>
            </Box>
          </TabPanel>
        </Box>
      </Card>
      
      {/* Help Section */}
      <Box 
        sx={{ 
          p: 3, 
          bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
          borderRadius: 2,
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette.info.main, 0.2),
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}
      >
        <HelpOutlineIcon color="info" sx={{ fontSize: 24 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight="medium">
            Need help managing security issues?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check our <Link component="span" sx={{ cursor: 'pointer', color: 'primary.main' }}>security best practices guide</Link> or <Link component="span" sx={{ cursor: 'pointer', color: 'primary.main' }}>contact our support team</Link>.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="info" 
          disableElevation
          sx={{ ml: { xs: 0, sm: 'auto' }, mt: { xs: 2, sm: 0 } }}
        >
          View Documentation
        </Button>
      </Box>
    </Container>
  );
};

const Link = ({ children, ...props }: any) => (
  <Typography component="span" {...props}>{children}</Typography>
);

export default Issues;
