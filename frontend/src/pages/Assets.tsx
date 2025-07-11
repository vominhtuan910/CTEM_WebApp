import { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, ToggleButton, ToggleButtonGroup,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
    Container, IconButton, FormControlLabel, Checkbox, FormGroup
} from '@mui/material';
import { 
    GridView, List, Add, CloudUpload, FileDownload,
    Close as CloseIcon 
} from '@mui/icons-material';
import AssetCard from '../components/Assets/AssetCard';
import AssetFilters from '../components/Assets/AssetFilters';
import AssetForm from '../components/Assets/AssetForm';
import AssetDetails from '../components/Assets/AssetDetails';
import { Asset, AssetFilter } from '../types/asset.types';
import { mockAssets } from '../data/mockAssets';
import toast from 'react-hot-toast';

const Assets = () => {
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
                    Assets Management
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
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle 
                    sx={{ 
                        pb: 1,
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    Add New Asset
                    <IconButton
                        onClick={() => !submitting && setOpenDialog(null)}
                        size="small"
                        sx={{
                            color: 'text.secondary',
                            '&:hover': {
                                color: 'error.main',
                                backgroundColor: (theme) => theme.palette.error.light + '20'
                            }
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
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
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle 
                    sx={{ 
                        pb: 1,
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    Edit Asset
                    <IconButton
                        onClick={() => !submitting && (setOpenDialog(null), setSelectedAsset(null))}
                        size="small"
                        sx={{
                            color: 'text.secondary',
                            '&:hover': {
                                color: 'error.main',
                                backgroundColor: (theme) => theme.palette.error.light + '20'
                            }
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {selectedAsset && (
                            <AssetForm
                                asset={selectedAsset}
                                onSubmit={handleEditAsset}
                                onCancel={() => { setOpenDialog(null); setSelectedAsset(null); }}
                                isSubmitting={submitting}
                            />
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
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle 
                    sx={{ 
                        pb: 1,
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    Asset Details
                    <IconButton
                        onClick={() => (setOpenDialog(null), setSelectedAsset(null))}
                        size="small"
                        sx={{
                            color: 'text.secondary',
                            '&:hover': {
                                color: 'error.main',
                                backgroundColor: (theme) => theme.palette.error.light + '20'
                            }
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
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

            {/* Import Assets Dialog */}
            <Dialog
                open={openDialog === 'import'}
                onClose={() => setOpenDialog(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle 
                    sx={{ 
                        pb: 1,
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    Import Assets
                    <IconButton
                        onClick={() => setOpenDialog(null)}
                        size="small"
                        sx={{
                            color: 'text.secondary',
                            '&:hover': {
                                color: 'error.main',
                                backgroundColor: (theme) => theme.palette.error.light + '20'
                            }
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography>Import feature coming soon...</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Export Dialog */}
            <Dialog
                open={exportDialog.open}
                onClose={() => setExportDialog(prev => ({ ...prev, open: false }))}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle 
                    sx={{ 
                        pb: 1,
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    Export Host Data
                    <IconButton
                        onClick={() => setExportDialog(prev => ({ ...prev, open: false }))}
                        size="small"
                        sx={{
                            color: 'text.secondary',
                            '&:hover': {
                                color: 'error.main',
                                backgroundColor: (theme) => theme.palette.error.light + '20'
                            }
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" gutterBottom>
                            Select the data you want to export from{' '}
                            <strong>{exportDialog.asset?.hostname}</strong>:
                        </Typography>
                        <FormGroup sx={{ mt: 2 }}>
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
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1">Services</Typography>
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
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1">Applications</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Export list of installed applications and versions
                                        </Typography>
                                    </Box>
                                }
                            />
                        </FormGroup>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                        onClick={() => setExportDialog(prev => ({ ...prev, open: false }))}
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
                            boxShadow: 2,
                            '&:hover': { boxShadow: 4 }
                        }}
                    >
                        Export
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Assets;