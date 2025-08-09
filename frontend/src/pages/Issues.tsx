import React from "react";
import { Container, Typography, Box } from "@mui/material";
import VulnerabilitySection from "../components/Issues/Tabs/TabsSection";

const Issues: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ pt: 3, mt: 2, pb: 6 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          sx={{
            color: "text.primary",
            mb: 1,
          }}
        >
          Vulnerability Assessment
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and manage security vulnerabilities across your infrastructure
        </Typography>
      </Box>

      {/* Vulnerability Section */}
      <VulnerabilitySection />
    </Container>
  );
};

export default Issues;
