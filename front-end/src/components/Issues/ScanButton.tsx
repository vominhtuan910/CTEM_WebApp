import React, { useState } from 'react';
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import SecurityScannerIcon from '@mui/icons-material/Security';

interface ScanButtonProps {
    onScanComplete?: (success: boolean, data?: any) => void;
}

const ScanButton: React.FC<ScanButtonProps> = ({ onScanComplete }) => {
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'completed' | 'failed'>('idle');
    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info';
    }>({
        open: false,
        message: '',
        severity: 'info',
    });

    const startScan = async () => {
        try {
            setScanStatus('scanning');
            
            // Mock API call - replace with actual API call to your scanning service
            const response = await new Promise<{ success: boolean; data?: any }>((resolve) => {
                setTimeout(() => {
                    // Simulating successful scan
                    resolve({ 
                        success: true, 
                        data: { 
                            scanId: 'scan-' + Date.now(),
                            timestamp: new Date().toISOString(),
                        } 
                    });
                }, 3000); // Simulate 3 second scan
            });

            if (response.success) {
                setScanStatus('completed');
                setNotification({
                    open: true,
                    message: 'Vulnerability scan completed successfully',
                    severity: 'success',
                });
                
                if (onScanComplete) {
                    onScanComplete(true, response.data);
                }
            } else {
                throw new Error('Scan failed');
            }
        } catch (error) {
            setScanStatus('failed');
            setNotification({
                open: true,
                message: 'Vulnerability scan failed',
                severity: 'error',
            });
            
            if (onScanComplete) {
                onScanComplete(false);
            }
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    return (
        <div className="mb-6">
            <Button
                variant="contained"
                color={scanStatus === 'failed' ? 'error' : 'primary'}
                startIcon={scanStatus === 'scanning' ? <CircularProgress size={20} color="inherit" /> : <SecurityScannerIcon />}
                onClick={startScan}
                disabled={scanStatus === 'scanning'}
                className="px-4 py-2 shadow-md"
            >
                {scanStatus === 'idle' && 'Start Vulnerability Scan'}
                {scanStatus === 'scanning' && 'Scanning...'}
                {scanStatus === 'completed' && 'Scan Completed'}
                {scanStatus === 'failed' && 'Scan Failed - Retry'}
            </Button>
            
            <Snackbar 
                open={notification.open} 
                autoHideDuration={6000} 
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseNotification} 
                    severity={notification.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ScanButton;