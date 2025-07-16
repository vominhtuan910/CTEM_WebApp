import { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  Box,
  Checkbox,
  FormGroup,
  Divider,
  Alert,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";

import FileCopyIcon from "@mui/icons-material/FileCopy";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import CodeIcon from "@mui/icons-material/Code";
import { format } from "date-fns";
import { Vulnerability } from "../../../types/vulnerability.types";
import BaseDialog from "../../common/BaseDialog";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  vulnerabilities: Vulnerability[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`export-tabpanel-${index}`}
      aria-labelledby={`export-tab-${index}`}
      {...other}
      style={{ width: "100%" }}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  vulnerabilities,
}) => {
  const theme = useTheme();
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "pdf">(
    "csv"
  );
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "name",
    "type",
    "cvssScore",
    "severityLevel",
    "affectedAssets",
    "discoveryDate",
    "status",
  ]);
  const [tabValue, setTabValue] = useState(0);
  const [previewData, setPreviewData] = useState<string>("");

  // Generate preview when needed
  useEffect(() => {
    if (tabValue === 1) {
      generatePreview();
    }
  }, [tabValue, exportFormat, selectedFields]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExportFormat(event.target.value as "csv" | "json" | "pdf");
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleSelectAll = () => {
    setSelectedFields(Object.keys(fieldLabels));
  };

  const handleSelectNone = () => {
    setSelectedFields([]);
  };

  const generatePreview = () => {
    if (selectedFields.length === 0) {
      setPreviewData("No fields selected for preview");
      return;
    }

    switch (exportFormat) {
      case "csv":
        setPreviewData(generateCSVPreview());
        break;
      case "json":
        setPreviewData(generateJSONPreview());
        break;
      case "pdf":
        setPreviewData(
          "PDF preview not available. PDFs can be previewed after export."
        );
        break;
    }
  };

  const generateCSVPreview = (): string => {
    const headers = selectedFields.map((field) => fieldLabels[field]);
    const rows = vulnerabilities.slice(0, 3).map((vuln) => {
      return selectedFields.map((field) => {
        switch (field) {
          case "affectedAssets":
            return vuln.affectedAssets.join(", ");
          case "discoveryDate":
            return format(new Date(vuln.discoveryDate), "yyyy-MM-dd");
          case "cveReferences":
            return vuln.cveReferences.join(", ");
          default:
            return vuln[field as keyof Vulnerability]?.toString() || "";
        }
      });
    });

    return (
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n") +
      "\n...(showing first 3 rows of " +
      vulnerabilities.length +
      ")"
    );
  };

  const generateJSONPreview = (): string => {
    const jsonData = vulnerabilities.slice(0, 3).map((vuln) => {
      const exportObj: Record<string, any> = {};
      selectedFields.forEach((field) => {
        exportObj[field] = vuln[field as keyof Vulnerability];
      });
      return exportObj;
    });

    return (
      JSON.stringify(jsonData, null, 2) +
      "\n...(showing first 3 items of " +
      vulnerabilities.length +
      ")"
    );
  };

  const handleExport = () => {
    if (selectedFields.length === 0) {
      return;
    }

    switch (exportFormat) {
      case "csv":
        exportToCSV();
        break;
      case "json":
        exportToJSON();
        break;
      case "pdf":
        alert("PDF export would be implemented here in a real application");
        break;
    }

    onClose();
  };

  const exportToCSV = () => {
    const headers = selectedFields.map((field) => fieldLabels[field]);

    const csvData = vulnerabilities.map((vuln) => {
      return selectedFields.map((field) => {
        switch (field) {
          case "affectedAssets":
            return vuln.affectedAssets.join(", ");
          case "discoveryDate":
            return format(new Date(vuln.discoveryDate), "yyyy-MM-dd");
          case "cveReferences":
            return vuln.cveReferences.join(", ");
          default:
            return vuln[field as keyof Vulnerability]?.toString() || "";
        }
      });
    });

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    downloadFile(
      csvContent,
      `vulnerabilities_${format(new Date(), "yyyyMMdd")}.csv`,
      "text/csv"
    );
  };

  const exportToJSON = () => {
    const jsonData = vulnerabilities.map((vuln) => {
      const exportObj: Record<string, any> = {};
      selectedFields.forEach((field) => {
        exportObj[field] = vuln[field as keyof Vulnerability];
      });
      return exportObj;
    });

    const jsonContent = JSON.stringify(jsonData, null, 2);
    downloadFile(
      jsonContent,
      `vulnerabilities_${format(new Date(), "yyyyMMdd")}.json`,
      "application/json"
    );
  };

  const downloadFile = (
    content: string,
    fileName: string,
    contentType: string
  ) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(previewData);
  };

  const fieldLabels: Record<string, string> = {
    name: "Name",
    type: "Type",
    cvssScore: "CVSS Score",
    severityLevel: "Severity Level",
    affectedAssets: "Affected Assets",
    discoveryDate: "Discovery Date",
    status: "Status",
    description: "Description",
    recommendations: "Recommendations",
    cveReferences: "CVE References",
    vector: "CVSS Vector",
    exploitAvailable: "Exploit Available",
    patchAvailable: "Patch Available",
    assignedTo: "Assigned To",
    lastUpdated: "Last Updated",
    tags: "Tags",
  };

  const getFormatIcon = () => {
    switch (exportFormat) {
      case "csv":
        return <TableChartIcon sx={{ mr: 1 }} />;
      case "json":
        return <CodeIcon sx={{ mr: 1 }} />;
      case "pdf":
        return <PictureAsPdfIcon sx={{ mr: 1 }} />;
    }
  };

  // Main content for the dialog - export settings and preview tabs
  const exportContent = (
    <>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: "divider", mt: 1 }}
      >
        <Tab label="Export Settings" />
        <Tab label="Preview" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="subtitle2" gutterBottom>
          Export {vulnerabilities.length} vulnerabilities
        </Typography>

        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>
            Export Format
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              row
              name="export-format"
              value={exportFormat}
              onChange={handleFormatChange}
            >
              <FormControlLabel
                value="csv"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center">
                    <TableChartIcon sx={{ mr: 0.5, fontSize: 18 }} />
                    CSV
                  </Box>
                }
              />
              <FormControlLabel
                value="json"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center">
                    <CodeIcon sx={{ mr: 0.5, fontSize: 18 }} />
                    JSON
                  </Box>
                }
              />
              <FormControlLabel
                value="pdf"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center">
                    <PictureAsPdfIcon sx={{ mr: 0.5, fontSize: 18 }} />
                    PDF
                  </Box>
                }
                disabled
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box mt={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography variant="subtitle1">Fields to Export</Typography>
            <Box>
              <Button size="small" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button size="small" onClick={handleSelectNone}>
                Clear
              </Button>
            </Box>
          </Box>

          {selectedFields.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Please select at least one field to export
            </Alert>
          )}

          <FormGroup>
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              }}
              gap={1}
            >
              {Object.entries(fieldLabels).map(([field, label]) => (
                <FormControlLabel
                  key={field}
                  control={
                    <Checkbox
                      checked={selectedFields.includes(field)}
                      onChange={() => handleFieldToggle(field)}
                      size="small"
                    />
                  }
                  label={label}
                />
              ))}
            </Box>
          </FormGroup>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="subtitle1">
            {getFormatIcon()}
            Preview ({exportFormat.toUpperCase()})
          </Typography>
          <Tooltip title="Copy to clipboard">
            <IconButton onClick={copyToClipboard} size="small">
              <FileCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {selectedFields.length === 0 ? (
          <Alert severity="warning">No fields selected for preview</Alert>
        ) : (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              maxHeight: 300,
              overflow: "auto",
              fontFamily: "monospace",
              fontSize: "0.8rem",
              whiteSpace: "pre-wrap",
              bgcolor: alpha(theme.palette.background.default, 0.5),
            }}
          >
            {previewData}
          </Paper>
        )}

        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            Showing preview of first 3 items. Full export will include all{" "}
            {vulnerabilities.length} vulnerabilities.
          </Typography>
        </Box>
      </TabPanel>
    </>
  );

  // Impact points for the dialog
  const impactPoints = [
    `${vulnerabilities.length} vulnerabilities will be exported`,
    `Export format: ${exportFormat.toUpperCase()}`,
    `${selectedFields.length} fields selected for export`,
  ];

  return (
    <BaseDialog
      isOpen={open}
      title="Export Vulnerabilities"
      body="Select the format and fields for exporting vulnerability data."
      impactPoints={impactPoints}
      primaryLabel="Export"
      secondaryLabel="Cancel"
      onPrimary={handleExport}
      onCancel={onClose}
      preLabel="Data Export"
    >
      {exportContent}
    </BaseDialog>
  );
};

export default ExportDialog;
