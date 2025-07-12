import { Asset } from '../../types/asset.types';
import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Tooltip,
    Box,
    Divider,
    alpha
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Computer as ComputerIcon,
    Apps as AppsIcon,
    Settings as ServicesIcon,
    Circle as StatusIcon,
    FileDownload as ExportIcon
} from '@mui/icons-material';

interface AssetCardProps {
    asset: Asset;
    onView: (asset: Asset) => void;
    onEdit: (asset: Asset) => void;
    onDelete: (asset: Asset) => void;
    onExport: (asset: Asset) => void;
    viewMode: 'grid' | 'list';
}

const AssetCard: React.FC<AssetCardProps> = ({ 
    asset, 
    onView, 
    onEdit, 
    onDelete,
    onExport,
    viewMode 
}) => {
    const runningServices = asset.services.filter(s => s.status === 'running').length;
    const totalServices = asset.services.length;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'error';
            case 'maintenance':
                return 'warning';
            default:
                return 'default';
        }
    };

    if (viewMode === 'list') {
    return (
            <Card 
                sx={{ 
                    position: 'relative',
                    transition: 'all 0.3s ease-in-out',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                        boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                        '& .asset-actions': {
                            opacity: 1,
                        }
                    }
                }}
            >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Icon and Basic Info */}
                        <Box 
                            sx={{ 
                                p: 1,
                                borderRadius: 1,
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1)
                            }}
                        >
                            <ComputerIcon 
                                sx={{ 
                                    color: 'primary.main',
                                    fontSize: 20
                                }} 
                            />
                        </Box>
                        
                        {/* Hostname and IP */}
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                    fontWeight: 600,
                                    color: 'text.primary'
                                }}
                            >
                                {asset.hostname}
                            </Typography>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: 'text.secondary',
                                    fontFamily: 'monospace'
                                }}
                            >
                                {asset.ipAddress}
                            </Typography>
                        </Box>

                        {/* OS Info */}
                        <Box sx={{ minWidth: 200 }}>
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                {asset.os.name} {asset.os.version}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {asset.os.architecture}
                            </Typography>
                        </Box>

                        {/* Services & Apps */}
                        <Box sx={{ minWidth: 150 }}>
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                {runningServices} of {totalServices} services
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {asset.applications.length} applications
                            </Typography>
                        </Box>

                        {/* Status */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
                            <StatusIcon 
                                sx={{ 
                                    fontSize: 12,
                                    color: `${getStatusColor(asset.status)}.main`
                                }} 
                            />
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: `${getStatusColor(asset.status)}.main`,
                                    fontWeight: 500,
                                    textTransform: 'capitalize'
                                }}
                            >
                                {asset.status}
                            </Typography>
                        </Box>

                        {/* Actions */}
                        <Box 
                            className="asset-actions"
                            sx={{ 
                                display: 'flex',
                                gap: 1,
                                opacity: 0.4,
                                transition: 'opacity 0.2s ease-in-out'
                            }}
                        >
                            <Tooltip title="Export Data">
                                <IconButton 
                                    onClick={() => onExport(asset)}
                                    size="small"
                                    sx={{ 
                                        color: 'success.main',
                                        '&:hover': { 
                                            backgroundColor: (theme) => alpha(theme.palette.success.main, 0.1)
                                        }
                                    }}
                                >
                                    <ExportIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="View Details">
                                <IconButton 
                                    onClick={() => onView(asset)}
                                    size="small"
                                    sx={{ 
                                        color: 'primary.main',
                                        '&:hover': { 
                                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1)
                                        }
                                    }}
                                >
                                    <ViewIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                                <IconButton 
                                    onClick={() => onEdit(asset)}
                                    size="small"
                                    sx={{ 
                                        color: 'info.main',
                                        '&:hover': { 
                                            backgroundColor: (theme) => alpha(theme.palette.info.main, 0.1)
                                        }
                                    }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton 
                                    onClick={() => onDelete(asset)}
                        size="small"
                                    sx={{ 
                                        color: 'error.main',
                                        '&:hover': { 
                                            backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1)
                                        }
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    // Grid view (existing card design)
    return (
        <Card 
            sx={{ 
                position: 'relative',
                transition: 'all 0.3s ease-in-out',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                    '& .asset-actions': {
                        opacity: 1,
                        transform: 'translateY(0)',
                    }
                }
            }}
        >
            <CardContent sx={{ p: 3 }}>
                {/* Status Indicator */}
                <Box 
                    sx={{ 
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <StatusIcon 
                        sx={{ 
                            fontSize: 12,
                            color: `${getStatusColor(asset.status)}.main`
                        }} 
                    />
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            color: `${getStatusColor(asset.status)}.main`,
                            fontWeight: 500,
                            textTransform: 'capitalize'
                        }}
                    >
                        {asset.status}
                    </Typography>
                </Box>

                {/* Header */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box 
                        sx={{ 
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1)
                        }}
                    >
                        <ComputerIcon 
                            sx={{ 
                                color: 'primary.main',
                                fontSize: 24
                            }} 
                        />
                    </Box>
                    <Box>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontWeight: 600,
                                mb: 0.5,
                                color: 'text.primary'
                            }}
                        >
                            {asset.hostname}
                        </Typography>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: 'text.secondary',
                                fontFamily: 'monospace'
                            }}
                        >
                            {asset.ipAddress}
                        </Typography>
                    </Box>
                </Box>

                {/* OS Info */}
                <Box sx={{ mb: 3 }}>
                    <Typography 
                        variant="subtitle2" 
                        sx={{ 
                            color: 'text.secondary',
                            mb: 1,
                            fontWeight: 500
                        }}
                    >
                        Operating System
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'text.primary',
                            fontWeight: 500,
                            mb: 0.5
                        }}
                    >
                        {asset.os.name} {asset.os.version}
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'text.secondary'
                        }}
                    >
                        {asset.os.architecture} • Build {asset.os.buildNumber}
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Services & Apps Summary */}
                <Box 
                    sx={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 2,
                        mb: 2
                    }}
                >
                    <Box>
                        <Box 
                            sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 1
                            }}
                        >
                            <Box 
                                sx={{ 
                                    p: 0.5,
                                    borderRadius: 1,
                                    backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.1)
                                }}
                            >
                                <ServicesIcon 
                                    fontSize="small" 
                                    sx={{ color: 'secondary.main' }} 
                                />
                            </Box>
                            <Typography 
                                variant="subtitle2"
                                sx={{ fontWeight: 500 }}
                            >
                                Services
                            </Typography>
                        </Box>
                        <Typography 
                            variant="body2"
                            sx={{ color: 'text.secondary' }}
                        >
                            {runningServices} of {totalServices} running
                        </Typography>
                    </Box>
                    <Box>
                        <Box 
                            sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 1
                            }}
                        >
                            <Box 
                                sx={{ 
                                    p: 0.5,
                                    borderRadius: 1,
                                    backgroundColor: (theme) => alpha(theme.palette.success.main, 0.1)
                                }}
                            >
                                <AppsIcon 
                                    fontSize="small" 
                                    sx={{ color: 'success.main' }} 
                                />
                            </Box>
                            <Typography 
                                variant="subtitle2"
                                sx={{ fontWeight: 500 }}
                            >
                                Applications
                            </Typography>
                        </Box>
                        <Typography 
                            variant="body2"
                            sx={{ color: 'text.secondary' }}
                        >
                            {asset.applications.length} installed
                        </Typography>
                    </Box>
                </Box>

                {/* Last Scan */}
                <Typography 
                    variant="caption" 
                    sx={{ 
                        color: 'text.secondary',
                        display: 'block',
                        mt: 2
                    }}
                >
                    Last scanned: {new Date(asset.lastScan).toLocaleString()}
                </Typography>

                {/* Actions */}
                <Box 
                    className="asset-actions"
                    sx={{ 
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 1,
                        p: 2,
                        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(4px)',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        opacity: 0,
                        transform: 'translateY(100%)',
                        transition: 'all 0.3s ease-in-out'
                    }}
                >
                    <Tooltip title="Export Data">
                        <IconButton 
                            onClick={() => onExport(asset)}
                            sx={{ 
                                color: 'success.main',
                                '&:hover': { 
                                    backgroundColor: (theme) => alpha(theme.palette.success.main, 0.1)
                                }
                            }}
                        >
                            <ExportIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                        <IconButton 
                            onClick={() => onView(asset)}
                            sx={{ 
                                color: 'primary.main',
                                '&:hover': { 
                                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1)
                                }
                            }}
                        >
                            <ViewIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton 
                            onClick={() => onEdit(asset)}
                            sx={{ 
                                color: 'info.main',
                                '&:hover': { 
                                    backgroundColor: (theme) => alpha(theme.palette.info.main, 0.1)
                                }
                            }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton 
                            onClick={() => onDelete(asset)}
                            sx={{ 
                                color: 'error.main',
                                '&:hover': { 
                                    backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1)
                                }
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </CardContent>
        </Card>
    );
};

export default AssetCard; 