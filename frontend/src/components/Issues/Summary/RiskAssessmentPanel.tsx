import { Box, Typography, Button, Card, Chip } from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  AssessmentOutlined,
  PriorityHighOutlined,
  DateRangeOutlined,
  TrendingDownOutlined,
} from "@mui/icons-material";

const RiskAssessmentPanel: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
        borderRadius: 2,
        p: 4,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Security Risk Assessment
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Comprehensive analysis of security risks in your environment based on
          detected vulnerabilities.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PriorityHighOutlined color="error" sx={{ mr: 2 }} />
                <Typography variant="subtitle1" fontWeight="medium">
                  Top Risk Factors
                </Typography>
              </Box>
              <Box sx={{ pl: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2">Outdated Dependencies</Typography>
                  <Chip label="High" color="error" size="small" />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2">
                    Insecure API Endpoints
                  </Typography>
                  <Chip label="Critical" color="error" size="small" />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2">
                    Missing Authentication
                  </Typography>
                  <Chip label="High" color="warning" size="small" />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">
                    Unencrypted Data Storage
                  </Typography>
                  <Chip label="Medium" color="info" size="small" />
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <DateRangeOutlined color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1" fontWeight="medium">
                  Remediation Timeline
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Box
                  sx={{
                    bgcolor: "error.main",
                    width: "40%",
                    height: 10,
                    borderRadius: 5,
                    mr: 1,
                  }}
                />
                <Typography variant="caption">Critical (24h)</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Box
                  sx={{
                    bgcolor: "warning.main",
                    width: "30%",
                    height: 10,
                    borderRadius: 5,
                    mr: 1,
                  }}
                />
                <Typography variant="caption">High (7 days)</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Box
                  sx={{
                    bgcolor: "info.main",
                    width: "20%",
                    height: 10,
                    borderRadius: 5,
                    mr: 1,
                  }}
                />
                <Typography variant="caption">Medium (30 days)</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    bgcolor: "success.main",
                    width: "10%",
                    height: 10,
                    borderRadius: 5,
                    mr: 1,
                  }}
                />
                <Typography variant="caption">Low (90 days)</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingDownOutlined color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1" fontWeight="medium">
                  Risk Reduction Recommendations
                </Typography>
              </Box>
              <Box sx={{ pl: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2">
                    Update all dependencies to latest secure versions
                  </Typography>
                  <Chip
                    icon={<TrendingDownOutlined />}
                    label="85% Risk Reduction"
                    size="small"
                    color="success"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2">
                    Implement API authentication for all endpoints
                  </Typography>
                  <Chip
                    icon={<TrendingDownOutlined />}
                    label="65% Risk Reduction"
                    size="small"
                    color="success"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">
                    Enable encryption for all stored sensitive data
                  </Typography>
                  <Chip
                    icon={<TrendingDownOutlined />}
                    label="40% Risk Reduction"
                    size="small"
                    color="success"
                  />
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AssessmentOutlined />}
        sx={{ alignSelf: "flex-start" }}
      >
        Generate Full Risk Report
      </Button>
    </Box>
  );
};

export default RiskAssessmentPanel;
