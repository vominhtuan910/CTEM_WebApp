import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Tooltip,
  useTheme,
  alpha,
  Paper,
  Button,
} from "@mui/material";
import {
  CloudUpload,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { Asset } from "../../../types/asset.types";

interface ImportSectionProps {
  onImportFile?: (file: File) => void;
  importFile: File | null;
  onSubmit: (data: Partial<Asset>) => void;
  isSubmitting: boolean;
}

const ImportSection: React.FC<ImportSectionProps> = ({
  onImportFile,
  importFile,
  onSubmit,
  isSubmitting,
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
    assetData: Partial<Asset> | null;
  }>({
    file: importFile,
    isDragging: false,
    isUploading: false,
    progress: 0,
    uploadIntervalId: null,
    assetData: null,
  });

  // Update local state when importFile prop changes
  useEffect(() => {
    setImportState((prev) => ({
      ...prev,
      file: importFile,
    }));
  }, [importFile]);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Check file type - only accept JSON files
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".json")) {
      toast.error("Only JSON files are allowed");
      return;
    }

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    setImportState((prev) => ({ ...prev, file }));

    // Notify parent component
    if (onImportFile) {
      onImportFile(file);
    }
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

  const handleProcessFile = () => {
    if (!importState.file) return;

    // Create a new AbortController for this operation
    uploadAbortController.current = new AbortController();
    setImportState((prev) => ({ ...prev, isUploading: true, progress: 0 }));

    // Simulate processing progress
    const interval = window.setInterval(() => {
      setImportState((prev) => {
        if (prev.progress >= 100) {
          clearInterval(prev.uploadIntervalId as number);

          // Simulate parsing the file and creating asset data
          setTimeout(() => {
            // Extract filename without extension to use as hostname
            const fileName = prev.file?.name || "";
            const hostname =
              fileName.substring(0, fileName.lastIndexOf(".")) ||
              "imported-asset";

            // Mock asset data that would be parsed from file
            const assetData: Partial<Asset> = {
              hostname,
              ipAddress: "192.168.1.100",
              status: "active",
              os: {
                name: "Imported OS",
                version: "1.0",
                architecture: "x64",
                buildNumber: "1000",
                lastBootTime: new Date().toISOString(),
              },
              services: [],
              applications: [],
              labels: ["imported"],
            };

            toast.success("File processed successfully");

            setImportState((prevState) => ({
              ...prevState,
              isUploading: false,
              assetData,
            }));

            // Submit the parsed data
            onSubmit(assetData);
          }, 500);

          return prev;
        }
        return { ...prev, progress: prev.progress + 5 };
      });
    }, 100);

    // Store interval ID to clear it later if needed
    setImportState((prev) => ({
      ...prev,
      uploadIntervalId: interval as unknown as number,
    }));
  };

  const handleCancelProcessing = () => {
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
    setImportState((prev) => ({
      ...prev,
      isUploading: false,
      progress: 0,
      uploadIntervalId: null,
    }));

    toast("Processing cancelled");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* File Upload Area */}
      {!importState.file && (
        <Box
          sx={{
            border: "2px dashed",
            borderColor: importState.isDragging ? "primary.main" : "divider",
            borderRadius: 2,
            bgcolor: importState.isDragging
              ? (theme) => alpha(theme.palette.primary.main, 0.05)
              : "background.paper",
            p: 4,
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
            accept=".json"
            onChange={handleFileInputChange}
          />
          <CloudUpload
            sx={{
              fontSize: 64,
              color: importState.isDragging ? "primary.main" : "text.secondary",
              mb: 2,
            }}
          />
          <Typography variant="h5" gutterBottom>
            {importState.isDragging
              ? "Drop file here"
              : "Drag & Drop a JSON file here or click to browse"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supports JSON format only, max 5MB
          </Typography>
        </Box>
      )}

      {/* Selected File Info */}
      {importState.file && (
        <>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle2">
                {importState.file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(importState.file.size)} •{" "}
                {importState.file.type || "Unknown type"}
              </Typography>
            </Box>
            <Box>
              {importState.isUploading ? (
                <Tooltip title="Cancel processing">
                  <IconButton
                    color="error"
                    size="small"
                    onClick={handleCancelProcessing}
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Remove file">
                  <IconButton
                    color="default"
                    size="small"
                    onClick={() => {
                      setImportState((prev) => ({ ...prev, file: null }));
                      if (onImportFile) onImportFile(null as unknown as File);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Paper>

          {/* Process/Import button */}
          {!importState.isUploading && !importState.assetData && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleProcessFile}
              sx={{ mb: 2 }}
            >
              Process File
            </Button>
          )}

          {/* Progress indicator */}
          {importState.isUploading && (
            <Box sx={{ mb: 2 }}>
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

          {/* Results summary - displayed when processing is complete */}
          {importState.assetData && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                bgcolor: alpha(theme.palette.success.main, 0.05),
              }}
            >
              <Typography variant="subtitle2" color="success.main" gutterBottom>
                File processed successfully
              </Typography>
              <Typography variant="body2">
                Asset Name: {importState.assetData.hostname}
              </Typography>
              <Typography variant="body2">
                IP Address: {importState.assetData.ipAddress}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 1 }}
              >
                The asset will be added when you click Save.
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default ImportSection;
