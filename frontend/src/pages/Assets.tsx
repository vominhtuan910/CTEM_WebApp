import { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, ToggleButton, ToggleButtonGroup,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
    Container, IconButton, FormControlLabel, Checkbox, FormGroup, Divider,
    useTheme, useMediaQuery, alpha, Card
} from '@mui/material';
import { 
    GridView, List, Add, CloudUpload, FileDownload,
    Close as CloseIcon
} from '@mui/icons-material';
import AssetCard from '../components/Assets/AssetCard';
import AssetFilters from '../components/Assets/AssetFilters';
import AssetForm from '../components/Assets/AssetForm';
import AssetDetails from '../components/Assets/AssetDetails';
import ImportDialog from '../components/Assets/ImportDialog';
import { Asset, AssetFilter } from '../types/asset.types';
import { mockAssets } from '../data/mockAssets';
import toast from 'react-hot-toast';

// Common dialog styles
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
    },
    sectionCard: {
        mb: 2,
        borderRadius: 2,
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'white',
        overflow: 'hidden'
    },
    sectionTitle: {
        p: 2,
        bgcolor: (theme: any) => alpha(theme.palette.primary.main, 0.05),
        borderBottom: '1px solid',
        borderColor: 'divider',
        fontWeight: 500
    },
    sectionContent: {
        p: 3
    }
};

const Assets = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [openDialog, setOpenDialog] = useState<'add' | 'import' | 'view' | 'edit' | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [filters, setFilters] = useState<AssetFilter>({
        search: '',
        status: [],
        osType: []
    });

    const [exportDialog, setExportDialog] = useState<{
        open: boolean;
        asset: Asset | null;
        options: {
            services: boolean;
            applications: boolean;
        };
    }>({
        open: false,
        asset: null,
        options: {
            services: true,
            applications: true
        }
    });

    // Available filter options (would come from API in real app)
    const availableOsTypes = ['Windows', 'Ubuntu', 'macOS'];

    useEffect(() => {
        // Simulate API call with mock data
        setLoading(true);
        setTimeout(() => {
            setAssets(mockAssets);
            setLoading(false);
        }, 1000); // Simulate network delay
    }, []);

    const handleAssetAction = async (action: 'view' | 'edit' | 'delete', asset: Asset) => {
        switch (action) {
            case 'view':
                setSelectedAsset(asset);
                setOpenDialog('view');
                break;
            case 'edit':
                setSelectedAsset(asset);
                setOpenDialog('edit');
                break;
            case 'delete':
                // Simulate API call
                setAssets(prevAssets => prevAssets.filter(a => a.id !== asset.id));
                toast.success('Asset deleted successfully');
                break;
        }
    };

    const handleExport = (asset: Asset) => {
        setExportDialog({
            open: true,
            asset,
            options: {
                services: true,
                applications: true
            }
        });
    };

    const handleExportData = () => {
        if (!exportDialog.asset) return;

        const asset = exportDialog.asset;
        const { services, applications } = exportDialog.options;
        
        let exportData: any = {
            hostname: asset.hostname,
            ipAddress: asset.ipAddress,
            exportDate: new Date().toISOString()
        };

        if (services) {
            exportData.services = asset.services.map(service => ({
                name: service.name,
                status: service.status,
                port: service.port
            }));
        }

        if (applications) {
            exportData.applications = asset.applications.map(app => ({
                name: app.name,
                version: app.version,
                installDate: app.installDate
            }));
        }

        // Convert to CSV or JSON
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${asset.hostname}_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setExportDialog(prev => ({ ...prev, open: false }));
        toast.success('Export completed successfully');
    };

    const handleImportComplete = (data: any) => {
        // Handle the imported data
        console.log('Import completed with data:', data);
        toast.success(`Successfully imported ${data.importedCount} assets`);
        
        // In a real app, you would refresh the assets list or add the imported assets
        // For now, we'll just simulate adding new assets
        if (data.importedCount > 0) {
            // Simulate adding new assets
            const newAssets: Asset[] = Array.from({ length: data.importedCount }, (_, i) => ({
                ...mockAssets[0], // Clone the first mock asset
                id: `imported-${Date.now()}-${i}`,
                hostname: `imported-asset-${i + 1}`,
                ipAddress: `192.168.1.${100 + i}`,
                lastScan: new Date().toISOString()
            }));
            
            setAssets(prev => [...prev, ...newAssets]);
        }
    };

    const handleAddAsset = async (assetData: Partial<Asset>) => {
        try {
            setSubmitting(true);
            // Simulate API call
            const newAsset: Asset = {
                ...assetData as Asset,
                id: (assets.length + 1).toString(),
                lastScan: new Date().toISOString()
            };
            
            setAssets(prevAssets => [...prevAssets, newAsset]);
            toast.success('Asset added successfully');
            setOpenDialog(null);
        } catch (error) {
            toast.error('Failed to add asset');
            console.error('Error adding asset:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditAsset = async (assetData: Partial<Asset>) => {
        if (!selectedAsset) return;
        
        try {
            setSubmitting(true);
            // Simulate API call
            const updatedAsset: Asset = {
                ...selectedAsset,
                ...assetData,
                lastScan: new Date().toISOString()
            };
            
            setAssets(prevAssets => 
                prevAssets.map(asset => 
                    asset.id === selectedAsset.id ? updatedAsset : asset
                )
            );
            
            toast.success('Asset updated successfully');
            setOpenDialog(null);
            setSelectedAsset(null);
        } catch (error) {
            toast.error('Failed to update asset');
            console.error('Error updating asset:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = !filters.search || 
            asset.hostname.toLowerCase().includes(filters.search.toLowerCase()) ||
            asset.ipAddress.toLowerCase().includes(filters.search.toLowerCase());

        const matchesStatus = filters.status.length === 0 || filters.status.includes(asset.status);
        const matchesOsType = filters.osType.length === 0 || filters.osType.includes(asset.os.name);

        return matchesSearch && matchesStatus && matchesOsType;
    });

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4
            }}>
                <Typography 
                    variant="h4" 
                    sx={{ 
                        color: 'primary.main',
                        fontWeight: 600
                    }}
                >
                    Assets
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownload />}
                        onClick={() => toast.success('Export feature coming soon')}
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            '&:hover': { backgroundColor: 'action.hover' }
                        }}
                    >
                        Export
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        onClick={() => setOpenDialog('import')}
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            '&:hover': { backgroundColor: 'action.hover' }
                        }}
                    >
                        Import
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenDialog('add')}
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: 2,
                            '&:hover': { boxShadow: 4 }
                        }}
                    >
                        Add Asset
                    </Button>
                </Box>
            </Box>

            {/* Filters and View Toggle */}
            <Paper 
                elevation={0}
                sx={{ 
                    p: 3, 
                    mb: 4, 
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 3,
                    flexWrap: { xs: 'wrap', md: 'nowrap' }
                }}>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <AssetFilters
                            filters={filters}
                            onFilterChange={setFilters}
                            availableOsTypes={availableOsTypes}
                        />
                    </Box>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_, newMode) => newMode && setViewMode(newMode)}
                        size="small"
                        sx={{ 
                            height: 40,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            '& .MuiToggleButton-root': {
                                border: 'none',
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark'
                                    }
                                }
                            }
                        }}
                    >
                        <ToggleButton value="grid">
                            <GridView />
                        </ToggleButton>
                        <ToggleButton value="list">
                            <List />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Paper>

            {/* Asset Grid/List */}
            {loading ? (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: 400 
                }}>
                    <CircularProgress />
                </Box>
            ) : filteredAssets.length === 0 ? (
                <Paper 
                    sx={{ 
                        textAlign: 'center', 
                        py: 8,
                        px: 3,
                        borderRadius: 3,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        No assets found
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Try adjusting your filters or adding new assets.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenDialog('add')}
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: 2,
                            '&:hover': { boxShadow: 4 }
                        }}
                    >
                        Add Asset
                    </Button>
                </Paper>
            ) : (
                <Box sx={{ 
                    ...(viewMode === 'grid' ? {
                        display: 'grid',
                        gap: 3,
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            lg: 'repeat(3, 1fr)',
                            xl: 'repeat(4, 1fr)'
                        }
                    } : {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    })
                }}>
                    {filteredAssets.map(asset => (
                        <AssetCard
                            key={asset.id}
                            asset={asset}
                            onView={(asset) => handleAssetAction('view', asset)}
                            onEdit={(asset) => handleAssetAction('edit', asset)}
                            onDelete={(asset) => handleAssetAction('delete', asset)}
                            onExport={handleExport}
                            viewMode={viewMode}
                        />
                    ))}
                </Box>
            )}

            {/* Add Asset Dialog */}
            <Dialog
                open={openDialog === 'add'}
                onClose={() => !submitting && setOpenDialog(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: dialogStyles.paper
                }}
                TransitionProps={{
                    style: { 
                        transitionDuration: '300ms',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }
                }}
            >
                <DialogTitle sx={dialogStyles.title}>
                    <Typography variant="h6">Add New Asset</Typography>
                    <IconButton
                        onClick={() => !submitting && setOpenDialog(null)}
                        size="small"
                        sx={dialogStyles.closeButton}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={dialogStyles.content}>
                    <Box>
                        <AssetForm
                            onSubmit={handleAddAsset}
                            onCancel={() => setOpenDialog(null)}
                            isSubmitting={submitting}
                        />
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Edit Asset Dialog */}
            <Dialog
                open={openDialog === 'edit' && selectedAsset !== null}
                onClose={() => !submitting && (setOpenDialog(null), setSelectedAsset(null))}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: dialogStyles.paper
                }}
                TransitionProps={{
                    style: { 
                        transitionDuration: '300ms',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }
                }}
            >
                <DialogTitle sx={dialogStyles.title}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">Edit Asset</Typography>
                        <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 500 }}>
                            {selectedAsset?.hostname}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => !submitting && (setOpenDialog(null), setSelectedAsset(null))}
                        size="small"
                        sx={dialogStyles.closeButton}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={dialogStyles.content}>
                    <Box>
                        {selectedAsset && (
                            <>
                                <Card sx={dialogStyles.sectionCard}>
                                    <Typography variant="subtitle1" sx={dialogStyles.sectionTitle}>
                                        Basic Information
                                    </Typography>
                                    <Box sx={dialogStyles.sectionContent}>
                                        <AssetForm
                                            asset={selectedAsset}
                                            onSubmit={handleEditAsset}
                                            onCancel={() => { setOpenDialog(null); setSelectedAsset(null); }}
                                            isSubmitting={submitting}
                                        />
                                    </Box>
                                </Card>
                            </>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>

            {/* View Asset Dialog */}
            <Dialog
                open={openDialog === 'view' && selectedAsset !== null}
                onClose={() => (setOpenDialog(null), setSelectedAsset(null))}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: dialogStyles.paper
                }}
                TransitionProps={{
                    style: { 
                        transitionDuration: '300ms',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }
                }}
            >
                <DialogTitle sx={dialogStyles.title}>
                    <Typography variant="h6">Asset Details</Typography>
                    <IconButton
                        onClick={() => (setOpenDialog(null), setSelectedAsset(null))}
                        size="small"
                        sx={dialogStyles.closeButton}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={dialogStyles.content}>
                    <Box>
                        {selectedAsset && (
                            <AssetDetails
                                asset={selectedAsset}
                                onClose={() => { setOpenDialog(null); setSelectedAsset(null); }}
                                onExport={handleExport}
                            />
                        )}
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Export Dialog */}
            <Dialog
                open={exportDialog.open}
                onClose={() => setExportDialog(prev => ({ ...prev, open: false }))}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: dialogStyles.paper
                }}
                TransitionProps={{
                    style: { 
                        transitionDuration: '300ms',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }
                }}
            >
                <DialogTitle sx={dialogStyles.title}>
                    <Typography variant="h6">Export Host Data</Typography>
                    <IconButton
                        onClick={() => setExportDialog(prev => ({ ...prev, open: false }))}
                        size="small"
                        sx={dialogStyles.closeButton}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={dialogStyles.content}>
                    <Box>
                        <Card sx={dialogStyles.sectionCard}>
                            <Typography variant="subtitle1" sx={dialogStyles.sectionTitle}>
                                Select Export Options
                            </Typography>
                            <Box sx={dialogStyles.sectionContent}>
                                <Typography variant="body1" gutterBottom>
                                    Select the data you want to export from{' '}
                                    <Typography component="span" fontWeight="bold" color="primary.main">
                                        {exportDialog.asset?.hostname}
                                    </Typography>:
                                </Typography>
                                <FormGroup sx={{ mt: 3 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={exportDialog.options.services}
                                                onChange={(e) => setExportDialog(prev => ({
                                                    ...prev,
                                                    options: {
                                                        ...prev.options,
                                                        services: e.target.checked
                                                    }
                                                }))}
                                                sx={{ 
                                                    color: 'secondary.main',
                                                    '&.Mui-checked': {
                                                        color: 'secondary.main',
                                                    }
                                                }}
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography variant="body1" fontWeight={500}>Services</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Export list of services and their status
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={exportDialog.options.applications}
                                                onChange={(e) => setExportDialog(prev => ({
                                                    ...prev,
                                                    options: {
                                                        ...prev.options,
                                                        applications: e.target.checked
                                                    }
                                                }))}
                                                sx={{ 
                                                    color: 'secondary.main',
                                                    '&.Mui-checked': {
                                                        color: 'secondary.main',
                                                    }
                                                }}
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography variant="body1" fontWeight={500}>Applications</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Export list of installed applications and versions
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </FormGroup>
                            </Box>
                        </Card>
                    </Box>
                </DialogContent>
                <DialogActions sx={dialogStyles.actions}>
                    <Button 
                        onClick={() => setExportDialog(prev => ({ ...prev, open: false }))}
                        variant="outlined"
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleExportData}
                        disabled={!exportDialog.options.services && !exportDialog.options.applications}
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            bgcolor: 'success.main',
                            '&:hover': { 
                                bgcolor: 'success.dark' 
                            },
                            '&.Mui-disabled': {
                                bgcolor: alpha(theme.palette.success.main, 0.3)
                            }
                        }}
                    >
                        Export
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Import Dialog Component */}
            <ImportDialog 
                open={openDialog === 'import'}
                onClose={() => setOpenDialog(null)}
                onImportComplete={handleImportComplete}
            />
        </Container>
    );
};

export default Assets;