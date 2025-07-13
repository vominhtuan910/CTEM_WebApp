import React, { useState, useEffect } from "react";
import { Container, Snackbar, Alert } from "@mui/material";
import useVulnerabilityData from "../hooks/useVulnerabilityData";

// Import new components
import IssueHeader from "../components/Issues/Header/IssueHeader";
import SearchFilterBar from "../components/Issues/Filters/SearchFilterBar";
import SummaryCards from "../components/Issues/Summary/SummaryCards";
import TabsSection from "../components/Issues/Tabs/TabsSection";
import HelpSection from "../components/Issues/Tabs/HelpSection";
import KeyboardShortcutsDialog from "../components/Issues/Dialogs/KeyboardShortcutsDialog";
import ExportDialog from "../components/Issues/Dialogs/ExportDialog";

const Issues: React.FC = () => {
  const [lastScanDate, setLastScanDate] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] =
    useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "info" | "warning" | "error"
  >("success");

  // Use the hook to get vulnerability data
  const { summary, refreshData, isRefreshing } = useVulnerabilityData();

  const handleScanComplete = (success: boolean, data?: any) => {
    if (success && data) {
      setLastScanDate(new Date().toLocaleString());
      refreshData();
      showSnackbar("Scan completed successfully", "success");
    }
  };

  const handleRefresh = () => {
    refreshData();
    setLastScanDate(new Date().toLocaleString());
    showSnackbar("Data refreshed", "info");
  };

  const handleExportOpen = () => {
    setIsExportOpen(true);
  };

  const handleExportClose = () => {
    setIsExportOpen(false);
  };

  const handleDateRangeChange = (range: {
    start: Date | null;
    end: Date | null;
  }) => {
    if (range.start && range.end) {
      showSnackbar(
        `Applied date filter: ${range.start.toLocaleDateString()} - ${range.end.toLocaleDateString()}`,
        "success"
      );
      // Implement actual filtering logic here
    }
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "info" | "warning" | "error"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Global shortcuts
      switch (e.key) {
        case "f":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            document.getElementById("issues-search")?.focus();
          }
          break;
        case "r":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleRefresh();
          }
          break;
        case "e":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleExportOpen();
          }
          break;
        case "s":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleScanComplete(true, { scanDate: new Date() });
          }
          break;
        case "/":
          e.preventDefault();
          setShowKeyboardShortcuts(true);
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            // Tab switching is now handled in TabsSection component
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Container maxWidth="xl" sx={{ pt: 3, mt: 2, pb: 6 }}>
      {/* Header Section */}
      <IssueHeader
        lastScanDate={lastScanDate}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onExportOpen={handleExportOpen}
        onKeyboardShortcutsOpen={() => setShowKeyboardShortcuts(true)}
      />

      {/* Search and Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Analytics Section */}
      <SummaryCards summary={summary} />

      {/* Tabs Section */}
      <TabsSection onScanComplete={handleScanComplete} />

      {/* Help Section */}
      <HelpSection />

      {/* Export Dialog */}
      <ExportDialog
        open={isExportOpen}
        onClose={handleExportClose}
        vulnerabilities={summary ? Array(summary.total).fill({}) : []}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        open={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </Container>
  );
};

export default Issues;
