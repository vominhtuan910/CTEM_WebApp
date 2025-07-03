import React, { useState } from 'react';
import { Button, Dialog, DialogContent, DialogTitle, CircularProgress, Alert, IconButton } from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CloseIcon from '@mui/icons-material/Close';

interface AutoScanProps {
    onScanComplete?: (result: string) => void;
    scanResults?: any[];
    setScanResults?: React.Dispatch<React.SetStateAction<any[]>>;
    scanStatus?: "idle" | "scanning" | "completed" | "failed";
    setScanStatus?: React.Dispatch<React.SetStateAction<"idle" | "scanning" | "completed" | "failed">>;
    onSave?: () => void;
}

const AutoScan: React.FC<AutoScanProps> = ({ onScanComplete }) => {
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleScan = async () => {
        setScanning(true);
        setError(null);
        setScanResult(null);
        try {
            // Simulate API call for scanning assets
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const result = 'Scan completed successfully. 5 new assets found.';
            setScanResult(result);
            if (onScanComplete) onScanComplete(result);
        } catch (e) {
            setError('Scan failed. Please try again.');
        } finally {
            setScanning(false);
        }
    };

    const handleClose = () => {
        if (!scanning) {
            setScanResult(null);
            setError(null);
        }
    };

    return (
        <>
            <Button
                startIcon={<AutorenewIcon />}
                onClick={handleScan}
                variant="contained"
                color="primary"
                disabled={scanning}
            >
                Auto Scan Assets
            </Button>
            <Dialog
                open={scanning || !!scanResult || !!error}
                onClose={handleClose}
                disableEscapeKeyDown={scanning}
                aria-labelledby="auto-scan-dialog-title"
            >
                <DialogTitle id="auto-scan-dialog-title" sx={{ m: 0, p: 2 }}>
                    {scanning ? 'Scanning Assets' : scanResult ? 'Scan Result' : error ? 'Error' : ''}
                    {!scanning && (
                        <IconButton
                            aria-label="close"
                            onClick={handleClose}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    )}
                </DialogTitle>
                <DialogContent dividers>
                    {scanning && (
                        <div style={{ textAlign: 'center', padding: 24 }}>
                            <CircularProgress />
                            <div style={{ marginTop: 16 }}>Scanning assets...</div>
                        </div>
                    )}
                    {scanResult && (
                        <Alert severity="success">{scanResult}</Alert>
                    )}
                    {error && (
                        <Alert severity="error">{error}</Alert>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AutoScan;