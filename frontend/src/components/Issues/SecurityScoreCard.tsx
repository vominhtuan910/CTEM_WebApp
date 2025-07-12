import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  useTheme, 
  alpha,
  CircularProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { VulnerabilitySummary } from '../../types/vulnerability.types';

interface SecurityScoreCardProps {
  summary: VulnerabilitySummary;
  isLoading?: boolean;
}

const SecurityScoreCard: React.FC<SecurityScoreCardProps> = ({ summary, isLoading = false }) => {
  const theme = useTheme();
  
  // Calculate security score based on vulnerability summary
  // This is a simple calculation - in a real app this would be more sophisticated
  const calculateSecurityScore = (): number => {
    const { total, critical, high, medium, low, fixed } = summary;
    
    if (total === 0) return 100;
    
    // Weighted calculation
    const criticalWeight = 10;
    const highWeight = 5;
    const mediumWeight = 2;
    const lowWeight = 1;
    
    const totalWeight = critical * criticalWeight + 
                       high * highWeight + 
                       medium * mediumWeight + 
                       low * lowWeight;
    
    // Calculate percentage of fixed issues
    const fixedPercentage = fixed / total;
    
    // Base score starts at 100 and is reduced by the weighted vulnerabilities
    let score = 100 - (totalWeight / total) * 10;
    
    // Adjust score based on percentage of fixed issues
    score += fixedPercentage * 10;
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  };
  
  const securityScore = calculateSecurityScore();
  
  // Determine score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 70) return theme.palette.success.light;
    if (score >= 50) return theme.palette.warning.main;
    if (score >= 30) return theme.palette.warning.dark;
    return theme.palette.error.main;
  };
  
  const scoreColor = getScoreColor(securityScore);
  
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
          <Typography variant="subtitle1" fontWeight="medium">Security Score</Typography>
          <Tooltip title="Security score is calculated based on the number and severity of vulnerabilities. Higher is better.">
            <IconButton size="small">
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={120}
                  thickness={4}
                  sx={{ color: (theme) => alpha(theme.palette.grey[300], 0.5) }}
                />
                <CircularProgress
                  variant="determinate"
                  value={securityScore}
                  size={120}
                  thickness={4}
                  sx={{ 
                    color: scoreColor,
                    position: 'absolute',
                    left: 0,
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="h3"
                    component="div"
                    color="text.primary"
                    fontWeight="bold"
                  >
                    {securityScore}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body1" fontWeight="medium" textAlign="center">
                {securityScore >= 90 && 'Excellent'}
                {securityScore >= 70 && securityScore < 90 && 'Good'}
                {securityScore >= 50 && securityScore < 70 && 'Fair'}
                {securityScore >= 30 && securityScore < 50 && 'Poor'}
                {securityScore < 30 && 'Critical'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
                {summary.fixed} of {summary.total} issues fixed
              </Typography>
            </>
          )}
        </Box>
        
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Recommendations:
          </Typography>
          <Typography variant="body2" fontWeight="medium" color={summary.critical > 0 ? 'error.main' : 'text.primary'}>
            {summary.critical > 0 
              ? `Address ${summary.critical} critical vulnerabilities`
              : 'No critical vulnerabilities'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SecurityScoreCard; 