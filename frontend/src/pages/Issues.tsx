import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper,
  Button,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import BugReportIcon from '@mui/icons-material/BugReport';
import WarningIcon from '@mui/icons-material/Warning';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';

import VulnerabilityTable from '../components/Issues/Vulnerability/VulnerabilityTable';
import ScanButton from '../components/Issues/ScanButton';
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

const Issues: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [lastScanDate, setLastScanDate] = useState<string | null>(null);
  
  // Use the hook to get vulnerability data
  const { summary } = useVulnerabilityData();
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
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Issues
          </Typography>
          
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<FilterAltIcon />}
              sx={{ mr: 2 }}
            >
              Filters
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
            >
              Export
            </Button>
          </Box>
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

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <AssessmentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Total Issues</Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold">
              {totalIssues}
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <SecurityIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">Critical Issues</Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold" color="error.main">
              {criticalCount}
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">High Issues</Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold" color="warning.main">
              {highCount}
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <BugReportIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6">Other Issues</Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold" color="info.main">
              {mediumCount + lowCount}
            </Typography>
            <Box display="flex" mt={1}>
              <Chip label={`Medium: ${mediumCount}`} size="small" color="info" sx={{ mr: 1 }} />
              <Chip label={`Low: ${lowCount}`} size="small" color="success" />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Vulnerabilities" />
          <Tab icon={<BugReportIcon />} iconPosition="start" label="Misconfigurations" />
          <Tab icon={<WarningIcon />} iconPosition="start" label="Compliance" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <ScanButton onScanComplete={handleScanComplete} />
        <VulnerabilityTable fetchFromApi={false} />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <Typography variant="h6" color="text.secondary">
            Misconfiguration detection coming soon
          </Typography>
        </Box>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <Typography variant="h6" color="text.secondary">
            Compliance monitoring coming soon
          </Typography>
        </Box>
      </TabPanel>
    </Container>
  );
};

export default Issues;
