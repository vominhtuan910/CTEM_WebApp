import { useState, useRef } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  LinearProgress,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  CloudUpload,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { dialogStyles } from "../../../utils/assets/assetStyles";
import toast from "react-hot-toast";

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

  const handleCloseDialog = () => {
    if (!importState.isUploading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: dialogStyles.paper,
      }}
      TransitionProps={{
        style: {
          transitionDuration: "300ms",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        },
      }}
    >
      <DialogTitle sx={dialogStyles.title}>
        <Typography variant="h6" id="import-dialog-title">
          Import Assets
        </Typography>
        <IconButton
          onClick={handleCloseDialog}
          size="small"
          sx={dialogStyles.closeButton}
          aria-label="Close import dialog"
          disabled={importState.isUploading}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={dialogStyles.content}>
        <Box>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv,.json"
            style={{ display: "none" }}
            onChange={handleFileInputChange}
            aria-label="Select CSV or JSON file"
          />

          <Box
            onClick={() =>
              !importState.isUploading &&
              !importState.file &&
              fileInputRef.current?.click()
            }
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            sx={{
              border: "2px dashed",
              borderColor: importState.isDragging
                ? "primary.main"
                : importState.file
                ? "success.main"
                : "divider",
              borderRadius: 2,
              p: 4,
              textAlign: "center",
              cursor:
                importState.isUploading || importState.file
                  ? "default"
                  : "pointer",
              bgcolor: importState.isDragging
                ? alpha(theme.palette.primary.main, 0.05)
                : importState.file
                ? alpha(theme.palette.success.main, 0.05)
                : "transparent",
              transition: "all 0.2s ease-in-out",
              mb: 3,
            }}
          >
            {!importState.file ? (
              <>
                <CloudUpload
                  sx={{
                    fontSize: 48,
                    color: importState.isDragging
                      ? "primary.main"
                      : "text.secondary",
                    mb: 2,
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  {importState.isDragging
                    ? "Drop the file here"
                    : "Drag & Drop"}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Drop your CSV or JSON file here, or click to browse
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Maximum file size: 5MB
                </Typography>
              </>
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <CloudUpload
                    sx={{ fontSize: 32, color: "success.main", mr: 1 }}
                  />
                  <Typography variant="h6" color="success.main">
                    File Selected
                  </Typography>
                </Box>

                <Typography variant="body1" gutterBottom>
                  {importState.file.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {formatFileSize(importState.file.size)}
                </Typography>

                {importState.isUploading ? (
                  <Box sx={{ mt: 3 }}>
                    <LinearProgress
                      variant="determinate"
                      value={importState.progress}
                      sx={{
                        height: 10,
                        borderRadius: 1,
                        mb: 1,
                      }}
                    />
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="caption" color="textSecondary">
                        Uploading...
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {importState.progress}%
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{ mt: 2, display: "flex", justifyContent: "center" }}
                  >
                    <Tooltip title="Remove file">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setImportState((prev) => ({ ...prev, file: null }));
                        }}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </>
            )}
          </Box>

          <Box
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.1),
              p: 2,
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" color="info.main" gutterBottom>
              Format Guidelines
            </Typography>
            <Typography variant="body2">
              • For CSV: Include headers with "hostname", "ip_address",
              "os_name", etc.
            </Typography>
            <Typography variant="body2">
              • For JSON: Use array of objects with properties matching the
              asset format
            </Typography>
            <Button
              size="small"
              sx={{
                mt: 1,
                textTransform: "none",
                color: "info.main",
                "&:hover": {
                  bgcolor: alpha(theme.palette.info.main, 0.2),
                },
              }}
              onClick={() => toast.success("Sample template downloaded")}
            >
              Download Sample Template
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={dialogStyles.actions}>
        {importState.isUploading ? (
          <Button
            variant="outlined"
            color="error"
            onClick={handleCancelUpload}
            startIcon={<CancelIcon />}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel Upload
          </Button>
        ) : (
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!importState.file || importState.isUploading}
          startIcon={<CloudUpload />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            bgcolor: "primary.main",
            "&:hover": {
              bgcolor: "primary.dark",
            },
            "&.Mui-disabled": {
              bgcolor: alpha(theme.palette.primary.main, 0.3),
            },
          }}
        >
          {importState.isUploading ? "Uploading..." : "Upload File"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog;
