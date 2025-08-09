import React from "react";
import { Box, Card, alpha } from "@mui/material";
import VulnerabilityTable from "../Vulnerability/VulnerabilityTable";

const VulnerabilitySection: React.FC = () => {
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
      <Box
        sx={{
          p: 3,
          bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
        }}
      >
        <VulnerabilityTable fetchFromApi={true} />
      </Box>
    </Card>
  );
};

export default VulnerabilitySection;
