import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  useTheme, 
  alpha,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
  Skeleton,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
  ButtonGroup,
  Button
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { VulnerabilityTrend } from '../../types/vulnerability.types';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import DownloadIcon from '@mui/icons-material/Download';

interface TrendChartProps {
  data: VulnerabilityTrend[];
  isLoading?: boolean;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, isLoading = false }) => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = React.useState('7d');
  const [chartType, setChartType] = React.useState<'line' | 'bar' | 'area'>('line');
  const [metricView, setMetricView] = React.useState(0);
  
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };

  const handleChartTypeChange = (_event: React.MouseEvent<HTMLElement>, newType: 'line' | 'bar' | 'area' | null) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const handleMetricViewChange = (_event: React.SyntheticEvent, newValue: number) => {
    setMetricView(newValue);
  };
  
  const formattedData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
    total: item.critical + item.high + item.medium + item.low
  }));

  const downloadChartData = () => {
    // In a real app, this would export the chart data as CSV
    alert('Chart data would be downloaded as CSV in a real application');
  };
  
  const renderChart = () => {
    if (isLoading) {
      return <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />;
    }

    // Common props for all chart types
    const commonProps = {
      data: formattedData,
      margin: { top: 5, right: 30, left: 5, bottom: 5 },
    };

    // Return different chart based on selected type
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
              <XAxis 
                dataKey="date" 
                stroke={theme.palette.text.secondary}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 4,
                  boxShadow: theme.shadows[3]
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              {metricView === 0 ? (
                <>
                  <Bar dataKey="critical" name="Critical" fill={theme.palette.error.main} />
                  <Bar dataKey="high" name="High" fill={theme.palette.warning.main} />
                  <Bar dataKey="medium" name="Medium" fill={theme.palette.info.main} />
                  <Bar dataKey="low" name="Low" fill={theme.palette.success.main} />
                </>
              ) : (
                <Bar dataKey="total" name="Total" fill={theme.palette.primary.main} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
              <XAxis 
                dataKey="date" 
                stroke={theme.palette.text.secondary}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 4,
                  boxShadow: theme.shadows[3]
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              {metricView === 0 ? (
                <>
                  <Area 
                    type="monotone" 
                    dataKey="critical" 
                    name="Critical" 
                    fill={alpha(theme.palette.error.main, 0.6)} 
                    stroke={theme.palette.error.main}
                    stackId="1"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="high" 
                    name="High" 
                    fill={alpha(theme.palette.warning.main, 0.6)} 
                    stroke={theme.palette.warning.main}
                    stackId="1"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="medium" 
                    name="Medium" 
                    fill={alpha(theme.palette.info.main, 0.6)} 
                    stroke={theme.palette.info.main}
                    stackId="1"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="low" 
                    name="Low" 
                    fill={alpha(theme.palette.success.main, 0.6)} 
                    stroke={theme.palette.success.main}
                    stackId="1"
                  />
                </>
              ) : (
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  name="Total" 
                  fill={alpha(theme.palette.primary.main, 0.6)} 
                  stroke={theme.palette.primary.main}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
              <XAxis 
                dataKey="date" 
                stroke={theme.palette.text.secondary}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 4,
                  boxShadow: theme.shadows[3]
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              {metricView === 0 ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="critical"
                    name="Critical"
                    stroke={theme.palette.error.main}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="high"
                    name="High"
                    stroke={theme.palette.warning.main}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="medium"
                    name="Medium"
                    stroke={theme.palette.info.main}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="low"
                    name="Low"
                    stroke={theme.palette.success.main}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };
  
  return (
    <Card sx={{ 
      borderRadius: 2, 
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      border: '1px solid',
      borderColor: 'divider',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <CardContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05), 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box display="flex" alignItems="center">
            <Typography variant="subtitle1" fontWeight="medium">Vulnerability Trends</Typography>
            <Tooltip title="Track security issues over time to identify patterns and prioritize remediation efforts">
              <IconButton size="small" sx={{ ml: 0.5 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel id="time-range-label">Range</InputLabel>
              <Select
                labelId="time-range-label"
                id="time-range-select"
                value={timeRange}
                label="Range"
                onChange={handleTimeRangeChange}
              >
                <MenuItem value="7d">7 Days</MenuItem>
                <MenuItem value="30d">30 Days</MenuItem>
                <MenuItem value="90d">90 Days</MenuItem>
              </Select>
            </FormControl>
            
            <Tooltip title="Download chart data">
              <IconButton size="small" onClick={downloadChartData}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs 
            value={metricView} 
            onChange={handleMetricViewChange} 
            size="small"
            sx={{ minHeight: 'auto', '& .MuiTab-root': { minHeight: 'auto', py: 0.5 } }}
          >
            <Tab label="By Severity" />
            <Tab label="Total" />
          </Tabs>
          
          <ToggleButtonGroup
            size="small"
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
          >
            <ToggleButton value="line" aria-label="line chart">
              <ShowChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="bar" aria-label="bar chart">
              <BarChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="area" aria-label="area chart">
              <StackedLineChartIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {renderChart()}
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              {isLoading ? 'Loading...' : `Last updated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {!isLoading && `Total vulnerabilities: ${
                data.length > 0 
                  ? data[data.length - 1].critical + 
                    data[data.length - 1].high + 
                    data[data.length - 1].medium + 
                    data[data.length - 1].low
                  : 0
              }`}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrendChart; 