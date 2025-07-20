import { useState, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Tooltip,
  useTheme,
  alpha,
  Paper,
} from "@mui/material";
import {
  CloudUpload,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import BaseDialog from "../../common/BaseDialog";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: (data: any) => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onClose,
  onImportComplete,
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAbortController = useRef<AbortController | null>(null);

  const [importState, setImportState] = useState<{
    file: File | null;
    isDragging: boolean;
    isUploading: boolean;
    progress: number;
    uploadIntervalId: number | null;
  }>({
    file: null,
    isDragging: false,
    isUploading: false,
    progress: 0,
    uploadIntervalId: null,
  });

  // Handle dialog close
  const handleCancel = () => {
    if (!importState.isUploading) {
      onClose();
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Check file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".csv") && !fileName.endsWith(".json")) {
      toast.error("Only CSV or JSON files are allowed");
      return;
    }

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    setImportState((prev) => ({ ...prev, file }));
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setImportState((prev) => ({ ...prev, isDragging: false }));

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setImportState((prev) => ({ ...prev, isDragging: true }));
  };

  const handleDragLeave = () => {
    setImportState((prev) => ({ ...prev, isDragging: false }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!importState.file) return;

    // Create a new AbortController for this upload
    uploadAbortController.current = new AbortController();

    setImportState((prev) => ({ ...prev, isUploading: true, progress: 0 }));

    // Simulate upload progress
    const interval = window.setInterval(() => {
      setImportState((prev) => {
        if (prev.progress >= 100) {
          clearInterval(prev.uploadIntervalId as number);

          // Simulate API call completion
          setTimeout(() => {
            // Mock data that would come from the server
            const mockImportedData = {
              success: true,
              importedCount: 15,
              timestamp: new Date().toISOString(),
            };

            toast.success("File uploaded successfully");
            onImportComplete(mockImportedData);

            setImportState({
              file: null,
              isDragging: false,
              isUploading: false,
              progress: 0,
              uploadIntervalId: null,
            });
            uploadAbortController.current = null;
            onClose();
          }, 500);

          return prev;
        }
        return { ...prev, progress: prev.progress + 5 };
      });
    }, 300);

    // Store interval ID to clear it later if needed
    setImportState((prev) => ({
      ...prev,
      uploadIntervalId: interval as unknown as number,
    }));
  };

  const handleCancelUpload = () => {
    // Clear the progress update interval
    if (importState.uploadIntervalId) {
      clearInterval(importState.uploadIntervalId);
    }

    // Abort the actual upload request if it exists
    if (uploadAbortController.current) {
      uploadAbortController.current.abort();
      uploadAbortController.current = null;
    }

    // Reset the import state
    setImportState({
      file: importState.file, // Keep the file selected
      isDragging: false,
      isUploading: false,
      progress: 0,
      uploadIntervalId: null,
    });

    toast("Upload cancelled");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Create main dialog content - file upload area
  const uploadContent = (
    <Box sx={{ mt: 2 }}>
      {/* File Upload Area */}
      <Box
        sx={{
          border: "2px dashed",
          borderColor: importState.isDragging ? "primary.main" : "divider",
          borderRadius: 2,
          bgcolor: importState.isDragging
            ? (theme) => alpha(theme.palette.primary.main, 0.05)
            : "background.paper",
          p: 3,
          textAlign: "center",
          transition: "all 0.2s ease-in-out",
          cursor: "pointer",
          "&:hover": {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
            borderColor: "primary.main",
          },
        }}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".csv,.json"
          onChange={handleFileInputChange}
        />
        <CloudUpload
          sx={{
            fontSize: 48,
            color: importState.isDragging ? "primary.main" : "text.secondary",
            mb: 2,
          }}
        />
        <Typography variant="h6" gutterBottom>
          {importState.isDragging
            ? "Drop file here"
            : "Drag & Drop a file here or click to browse"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supports CSV and JSON formats, max 5MB
        </Typography>
      </Box>

      {/* Selected File Info */}
      {importState.file && (
        <Paper
          variant="outlined"
          sx={{
            mt: 2,
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="subtitle2">{importState.file.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(importState.file.size)} •{" "}
              {importState.file.type || "Unknown type"}
            </Typography>
          </Box>
          <Box>
            {importState.isUploading ? (
              <Tooltip title="Cancel upload">
                <IconButton
                  color="error"
                  size="small"
                  onClick={handleCancelUpload}
                >
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Remove file">
                <IconButton
                  color="default"
                  size="small"
                  onClick={() =>
                    setImportState((prev) => ({ ...prev, file: null }))
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Paper>
      )}

      {/* Upload Progress */}
      {importState.isUploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={importState.progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            align="right"
            sx={{ display: "block", mt: 0.5 }}
          >
            {importState.progress}% Complete
          </Typography>
        </Box>
      )}
    </Box>
  );

  // Impact points for the dialog
  const impactPoints = [
    "Imported assets will be added to your inventory",
    "Duplicates will be identified based on hostname and IP",
    "CSV files should include headers: hostname, ip, os, status",
  ];

  return (
    <BaseDialog
      isOpen={open}
      title="Import Assets"
      body="Upload a file containing assets to import into the system."
      impactPoints={impactPoints}
      primaryLabel={importState.file ? "Import" : "Select File"}
      secondaryLabel="Cancel"
      onPrimary={
        importState.file ? handleUpload : () => fileInputRef.current?.click()
      }
      onCancel={handleCancel}
      closeOnBackdropClick={!importState.isUploading}
      closeOnEsc={!importState.isUploading}
      preLabel="Data Import"
    >
      {uploadContent}
    </BaseDialog>
  );
};

export default ImportDialog;
