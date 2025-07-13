import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  alpha,
  Fade,
} from "@mui/material";
import {
  AssessmentOutlined,
  SecurityOutlined,
  WarningOutlined,
  BugReportOutlined,
} from "@mui/icons-material";
import { VulnerabilitySummary } from "../../types/vulnerability.types";

interface SummaryCardsProps {
  summary: VulnerabilitySummary;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const {
    total: totalIssues,
    critical: criticalCount,
    high: highCount,
    medium: mediumCount,
    low: lowCount,
  } = summary;

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
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr 1fr 1fr",
        },
        gap: 3,
        mb: 4,
      }}
    >
      <Fade in={true} style={{ transitionDelay: "100ms" }}>
        <Card sx={cardStyles}>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <Box display="flex" alignItems="center">
                <AssessmentOutlined color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="medium">
                  Total Issues
                </Typography>
              </Box>
            </Box>
            <Box sx={{ p: 2 }}>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {totalIssues}
              </Typography>
              <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
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

      <Fade in={true} style={{ transitionDelay: "200ms" }}>
        <Card sx={cardStyles}>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
              }}
            >
              <Box display="flex" alignItems="center">
                <SecurityOutlined color="error" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="medium">
                  Critical Issues
                </Typography>
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

      <Fade in={true} style={{ transitionDelay: "300ms" }}>
        <Card sx={cardStyles}>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05),
              }}
            >
              <Box display="flex" alignItems="center">
                <WarningOutlined color="warning" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="medium">
                  High Issues
                </Typography>
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

      <Fade in={true} style={{ transitionDelay: "400ms" }}>
        <Card sx={cardStyles}>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
              }}
            >
              <Box display="flex" alignItems="center">
                <BugReportOutlined color="info" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="medium">
                  Other Issues
                </Typography>
              </Box>
            </Box>
            <Box sx={{ p: 2 }}>
              <Typography variant="h3" fontWeight="bold" color="info.main">
                {mediumCount + lowCount}
              </Typography>
              <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
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
  );
};

export default SummaryCards;
