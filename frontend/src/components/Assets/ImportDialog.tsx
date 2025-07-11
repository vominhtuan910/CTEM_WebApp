import { useState, useRef } from 'react';
import { 
    Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, IconButton, LinearProgress, Tooltip,
    useTheme, useMediaQuery, alpha
} from '@mui/material';
import { 
    CloudUpload, 
    Close as CloseIcon, 
    Delete as DeleteIcon, 
    Cancel as CancelIcon 
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    onImportComplete: (data: any) => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose, onImportComplete }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        uploadIntervalId: null
    });

    const handleFileSelect = (file: File | null) => {
        if (!file) return;
        
        // Check file type
        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.csv') && !fileName.endsWith('.json')) {
            toast.error('Only CSV or JSON files are allowed');
            return;
        }
        
        // Check file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size exceeds 5MB limit');
            return;
        }
        
        setImportState(prev => ({ ...prev, file }));
    };

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setImportState(prev => ({ ...prev, isDragging: false }));
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setImportState(prev => ({ ...prev, isDragging: true }));
    };

    const handleDragLeave = () => {
        setImportState(prev => ({ ...prev, isDragging: false }));
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
        
        setImportState(prev => ({ ...prev, isUploading: true, progress: 0 }));
        
        // Simulate upload progress
        const interval = window.setInterval(() => {
            setImportState(prev => {
                if (prev.progress >= 100) {
                    clearInterval(prev.uploadIntervalId as number);
                    
                    // Simulate API call completion
                    setTimeout(() => {
                        // Mock data that would come from the server
                        const mockImportedData = {
                            success: true,
                            importedCount: 15,
                            timestamp: new Date().toISOString()
                        };
                        
                        toast.success('File uploaded successfully');
                        onImportComplete(mockImportedData);
                        
                        setImportState({
                            file: null,
                            isDragging: false,
                            isUploading: false,
                            progress: 0,
                            uploadIntervalId: null
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
        setImportState(prev => ({ ...prev, uploadIntervalId: interval as unknown as number }));
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
            uploadIntervalId: null
        });
        
        toast('Upload cancelled');
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' bytes';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Dialog styles
    const dialogStyles = {
        paper: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            overflow: 'hidden',
            background: '#f8f9fa',
            border: 'none'
        },
        title: { 
            pb: 2,
            pt: 2,
            px: 3,
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 'none',
            bgcolor: 'white'
        },
        content: {
            p: 0,
            bgcolor: '#f8f9fa',
            '& .MuiBox-root': {
                p: 3
            }
        },
        actions: {
            p: 3,
            pt: 2,
            borderTop: 'none',
            bgcolor: 'white'
        },
        closeButton: {
            color: 'text.secondary',
            '&:hover': {
                color: 'error.main',
                backgroundColor: (theme: any) => alpha(theme.palette.error.main, 0.1)
            },
            transition: 'all 0.2s ease-in-out'
        }
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
                sx: {
                    ...dialogStyles.paper,
                    width: isMobile ? '100%' : undefined,
                    height: isMobile ? '100%' : undefined,
                    margin: isMobile ? 0 : undefined,
                    maxHeight: isMobile ? '100%' : undefined,
                    borderRadius: isMobile ? 0 : dialogStyles.paper.borderRadius
                }
            }}
            TransitionProps={{
                style: { 
                    transitionDuration: '300ms',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }
            }}
        >
            <DialogTitle sx={dialogStyles.title}>
                <Typography variant="h6" id="import-dialog-title">Import Assets</Typography>
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
                        style={{ display: 'none' }}
                        onChange={handleFileInputChange}
                        aria-label="Select CSV or JSON file"
                    />
                    
                    <Box 
                        onClick={() => !importState.isUploading && !importState.file && fileInputRef.current?.click()}
                        onDrop={handleFileDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        sx={{ 
                            border: '2px dashed',
                            borderColor: importState.isDragging ? 'primary.main' : 'divider',
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                            bgcolor: importState.isDragging 
                                ? alpha(theme.palette.primary.main, 0.05)
                                : alpha(theme.palette.background.default, 0.5),
                            transition: 'all 0.2s ease-in-out',
                            cursor: importState.isUploading || importState.file ? 'default' : 'pointer',
                            '&:hover': {
                                borderColor: importState.isUploading || importState.file ? 'divider' : 'primary.main',
                                bgcolor: importState.isUploading || importState.file 
                                    ? alpha(theme.palette.background.default, 0.5)
                                    : alpha(theme.palette.primary.main, 0.05)
                            },
                            minHeight: 200,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            outline: 'none',
                            '&:focus': {
                                boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
                                outline: 'none'
                            }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label="Drop CSV or JSON file here or click to browse"
                    >
                        {!importState.file ? (
                            <>
                                <CloudUpload sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Drop CSV or JSON here or click to browse
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    CSV or JSON only, max 5 MB
                                </Typography>
                            </>
                        ) : (
                            <Box sx={{ width: '100%' }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    mb: 2
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ 
                                            p: 1, 
                                            borderRadius: 1, 
                                            bgcolor: alpha(theme.palette.primary.main, 0.1) 
                                        }}>
                                            <CloudUpload sx={{ color: 'primary.main' }} />
                                        </Box>
                                        <Box sx={{ textAlign: 'left' }}>
                                            <Typography variant="body1" fontWeight={500}>
                                                {importState.file.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatFileSize(importState.file.size)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {!importState.isUploading ? (
                                        <IconButton 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setImportState(prev => ({ ...prev, file: null }));
                                            }}
                                            size="small"
                                            color="error"
                                            aria-label="Remove selected file"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    ) : (
                                        <Tooltip title="Cancel upload">
                                            <IconButton 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCancelUpload();
                                                }}
                                                size="small"
                                                color="error"
                                                aria-label="Cancel upload"
                                            >
                                                <CancelIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                                
                                {importState.isUploading && (
                                    <Box sx={{ width: '100%', mt: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary"
                                            >
                                                Uploading...
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                fontWeight={500}
                                            >
                                                {importState.progress}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={importState.progress} 
                                            sx={{ 
                                                height: 8, 
                                                borderRadius: 4,
                                                bgcolor: alpha(theme.palette.primary.main, 0.1)
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={dialogStyles.actions}>
                {importState.isUploading ? (
                    <Button 
                        onClick={handleCancelUpload}
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            minWidth: 120,
                            minHeight: 44
                        }}
                    >
                        Cancel Upload
                    </Button>
                ) : (
                    <>
                        <Button 
                            onClick={onClose}
                            variant="outlined"
                            sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                minWidth: 100,
                                minHeight: 44
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={!importState.file}
                            sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                bgcolor: 'primary.main',
                                '&:hover': { 
                                    bgcolor: 'primary.dark' 
                                },
                                minWidth: 100,
                                minHeight: 44
                            }}
                        >
                            Upload
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ImportDialog; 