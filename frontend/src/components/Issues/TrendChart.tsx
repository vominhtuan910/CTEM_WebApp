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
  Skeleton
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { VulnerabilityTrend } from '../../types/vulnerability.types';

interface TrendChartProps {
  data: VulnerabilityTrend[];
  isLoading?: boolean;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, isLoading = false }) => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = React.useState('7d');
  
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };
  
  const formattedData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
    total: item.critical + item.high + item.medium + item.low
  }));
  
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
        <Box sx={{ p: 2, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="medium">Vulnerability Trends</Typography>
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
              <MenuItem value="30d" disabled>30 Days</MenuItem>
              <MenuItem value="90d" disabled>90 Days</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {isLoading ? (
            <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={formattedData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 5,
                  bottom: 5,
                }}
              >
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
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4,
                    boxShadow: theme.shadows[3]
                  }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend />
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
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          
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