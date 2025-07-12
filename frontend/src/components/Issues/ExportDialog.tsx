import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
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
  Alert
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import { format } from 'date-fns';
import { Vulnerability } from '../../types/vulnerability.types';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  vulnerabilities: Vulnerability[];
}

const ExportDialog: React.FC<ExportDialogProps> = ({ open, onClose, vulnerabilities }) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'name', 'type', 'cvssScore', 'severityLevel', 'affectedAssets', 'discoveryDate', 'status'
  ]);

  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExportFormat(event.target.value as 'csv' | 'json' | 'pdf');
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field) 
        : [...prev, field]
    );
  };

  const handleExport = () => {
    if (selectedFields.length === 0) {
      return;
    }

    switch (exportFormat) {
      case 'csv':
        exportToCSV();
        break;
      case 'json':
        exportToJSON();
        break;
      case 'pdf':
        alert('PDF export would be implemented here in a real application');
        break;
    }

    onClose();
  };

  const exportToCSV = () => {
    const headers = selectedFields.map(field => {
      switch (field) {
        case 'name': return 'Name';
        case 'type': return 'Type';
        case 'cvssScore': return 'CVSS Score';
        case 'severityLevel': return 'Severity';
        case 'affectedAssets': return 'Affected Assets';
        case 'discoveryDate': return 'Discovery Date';
        case 'status': return 'Status';
        case 'description': return 'Description';
        case 'recommendations': return 'Recommendations';
        case 'cveReferences': return 'CVE References';
        default: return field;
      }
    });

    const csvData = vulnerabilities.map(vuln => {
      return selectedFields.map(field => {
        switch (field) {
          case 'affectedAssets':
            return vuln.affectedAssets.join(', ');
          case 'discoveryDate':
            return format(new Date(vuln.discoveryDate), 'yyyy-MM-dd');
          case 'cveReferences':
            return vuln.cveReferences.join(', ');
          default:
            return vuln[field as keyof Vulnerability]?.toString() || '';
        }
      });
    });
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    downloadFile(csvContent, 'vulnerabilities.csv', 'text/csv');
  };

  const exportToJSON = () => {
    const jsonData = vulnerabilities.map(vuln => {
      const exportObj: Record<string, any> = {};
      selectedFields.forEach(field => {
        exportObj[field] = vuln[field as keyof Vulnerability];
      });
      return exportObj;
    });
    
    const jsonContent = JSON.stringify(jsonData, null, 2);
    downloadFile(jsonContent, 'vulnerabilities.json', 'application/json');
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fieldLabels: Record<string, string> = {
    name: 'Name',
    type: 'Type',
    cvssScore: 'CVSS Score',
    severityLevel: 'Severity Level',
    affectedAssets: 'Affected Assets',
    discoveryDate: 'Discovery Date',
    status: 'Status',
    description: 'Description',
    recommendations: 'Recommendations',
    cveReferences: 'CVE References'
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <GetAppIcon sx={{ mr: 1 }} />
          Export Vulnerabilities
        </Box>
      </DialogTitle>
      <DialogContent>
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
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              <FormControlLabel value="json" control={<Radio />} label="JSON" />
              <FormControlLabel value="pdf" control={<Radio />} label="PDF" disabled />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Fields to Export
          </Typography>
          {selectedFields.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Please select at least one field to export
            </Alert>
          )}
          <FormGroup>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
              {Object.entries(fieldLabels).map(([field, label]) => (
                <FormControlLabel
                  key={field}
                  control={
                    <Checkbox
                      checked={selectedFields.includes(field)}
                      onChange={() => handleFieldToggle(field)}
                    />
                  }
                  label={label}
                />
              ))}
            </Box>
          </FormGroup>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleExport}
          disabled={selectedFields.length === 0}
          startIcon={<GetAppIcon />}
        >
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog; 