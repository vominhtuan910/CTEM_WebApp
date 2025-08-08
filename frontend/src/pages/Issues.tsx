import React, { useState } from "react";
import { Container } from "@mui/material";
import { useVulnerabilityData } from "../hooks/vulnerability/useVulnerabilityData";

// Import new components
import SummaryCards from "../components/Issues/Summary/SummaryCards";
import TabsSection from "../components/Issues/Tabs/TabsSection";

const Issues: React.FC = () => {
  const [lastScanDate, setLastScanDate] = useState<string | null>(null);

  // Use the hook to get vulnerability data
  const { summary } = useVulnerabilityData();

  const handleScanComplete = (success: boolean, data?: any) => {
    if (success && data) {
      setLastScanDate(new Date().toLocaleString());
    }
  };

  return (
    <Container maxWidth="xl" sx={{ pt: 3, mt: 2, pb: 6 }}>
      {/* Analytics Section */}
      <SummaryCards summary={summary} />

      {/* Tabs Section */}
      <TabsSection onScanComplete={handleScanComplete} />
    </Container>
  );
};

export default Issues;
