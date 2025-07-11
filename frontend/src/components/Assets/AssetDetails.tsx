import { Asset } from '../../types/asset.types';
import { 
    Paper, Typography, Box,
    Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Button, Chip,
    IconButton, Tooltip
} from '@mui/material';
import { 
    Computer,
    FileDownload as ExportIcon
} from '@mui/icons-material';

interface AssetDetailsProps {
    asset: Asset;
    onClose: () => void;
    onExport: (asset: Asset) => void;
}

const AssetDetails: React.FC<AssetDetailsProps> = ({ asset, onClose, onExport }) => {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Computer className="text-blue-600" />
                    <div>
                        <Typography variant="h4">{asset.hostname}</Typography>
                        <Typography variant="body2" color="textSecondary">
                            Last scan: {new Date(asset.lastScan).toLocaleString()}
                        </Typography>
                    </div>
                </div>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Tooltip title="Export Asset Data">
                        <IconButton
                            onClick={() => onExport(asset)}
                            sx={{ 
                                color: 'success.main',
                                '&:hover': {
                                    backgroundColor: 'success.light'
                                }
                            }}
                        >
                            <ExportIcon />
                        </IconButton>
                    </Tooltip>
                    <Chip 
                        label={asset.status} 
                        color={asset.status === 'active' ? 'success' : 'default'}
                        size="small"
                    />
                </Box>
            </div>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* OS Information */}
                <Paper className="p-4">
                    <Typography variant="h6" gutterBottom>Operating System</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                            <Typography>{asset.os.name}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">Version</Typography>
                            <Typography>{asset.os.version}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">Architecture</Typography>
                            <Typography>{asset.os.architecture}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">Build Number</Typography>
                            <Typography>{asset.os.buildNumber}</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">Last Boot Time</Typography>
                        <Typography>{new Date(asset.os.lastBootTime).toLocaleString()}</Typography>
                    </Box>
                </Paper>

                {/* Services */}
                <Paper className="p-4">
                    <Typography variant="h6" gutterBottom>Services</Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Display Name</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Start Type</TableCell>
                                    <TableCell>PID</TableCell>
                                    <TableCell>Port</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {asset.services.map((service, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{service.name}</TableCell>
                                        <TableCell>{service.displayName}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={service.status}
                                                color={service.status === 'running' ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{service.startType}</TableCell>
                                        <TableCell>{service.pid || '-'}</TableCell>
                                        <TableCell>{service.port || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* Applications */}
                <Paper className="p-4">
                    <Typography variant="h6" gutterBottom>Installed Applications</Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Version</TableCell>
                                    <TableCell>Publisher</TableCell>
                                    <TableCell>Install Date</TableCell>
                                    <TableCell>Size</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {asset.applications.map((app, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{app.name}</TableCell>
                                        <TableCell>{app.version}</TableCell>
                                        <TableCell>{app.publisher}</TableCell>
                                        <TableCell>{new Date(app.installDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{app.size || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                    variant="contained" 
                    onClick={onClose}
                    sx={{ 
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                            bgcolor: 'primary.dark',
                        }
                    }}
                >
                    Close
                </Button>
                <Button
                    variant="contained"
                    startIcon={<ExportIcon />}
                    onClick={() => onExport(asset)}
                    sx={{ 
                        bgcolor: 'success.main',
                        color: 'white',
                        '&:hover': {
                            bgcolor: 'success.dark',
                        }
                    }}
                >
                    Export Data
                </Button>
            </Box>
        </div>
    );
};

export default AssetDetails; 