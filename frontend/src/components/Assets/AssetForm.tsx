import { useState } from 'react';
import { 
    Grid as MuiGrid, TextField, MenuItem, Chip, Button,
    FormControl, InputLabel, Select, Typography,
    Slider
} from '@mui/material';
import { Asset } from '../../types/asset.types';

// Create a type-safe Grid component
const Grid = MuiGrid as typeof MuiGrid & { item?: boolean };

interface AssetFormProps {
    asset?: Partial<Asset>;
    onSubmit: (data: Partial<Asset>) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

interface AssetFormState extends Partial<Asset> {
    priority: {
        confidentiality: number;
        integrity: number;
        availability: number;
    };
}

const AssetForm: React.FC<AssetFormProps> = ({ 
    asset, 
    onSubmit, 
    onCancel,
    isSubmitting = false 
}) => {
    const [formData, setFormData] = useState<AssetFormState>({
        name: '',
        type: 'workstation',
        ipAddresses: [''],
        operatingSystem: '',
        version: '',
        status: 'active',
        department: '',
        location: '',
        owner: '',
        labels: [],
        priority: {
            confidentiality: 1,
            integrity: 1,
            availability: 1
        },
        ...asset
    });

    const [newLabel, setNewLabel] = useState('');
    const [newIp, setNewIp] = useState('');

    const handleChange = (field: keyof AssetFormState, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePriorityChange = (type: keyof AssetFormState['priority'], value: number) => {
        setFormData(prev => ({
            ...prev,
            priority: {
                ...prev.priority,
                [type]: value
            }
        }));
    };

    const addLabel = () => {
        if (newLabel && !formData.labels?.includes(newLabel)) {
            setFormData(prev => ({
                ...prev,
                labels: [...(prev.labels || []), newLabel]
            }));
            setNewLabel('');
        }
    };

    const removeLabel = (label: string) => {
        setFormData(prev => ({
            ...prev,
            labels: prev.labels?.filter(l => l !== label)
        }));
    };

    const addIpAddress = () => {
        if (newIp && !formData.ipAddresses?.includes(newIp)) {
            setFormData(prev => ({
                ...prev,
                ipAddresses: [...(prev.ipAddresses || []), newIp]
            }));
            setNewIp('');
        }
    };

    const removeIpAddress = (ip: string) => {
        setFormData(prev => ({
            ...prev,
            ipAddresses: prev.ipAddresses?.filter(i => i !== ip)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Basic Information</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Asset Name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Asset Type</InputLabel>
                                <Select
                                    value={formData.type}
                                    label="Asset Type"
                                    onChange={(e) => handleChange('type', e.target.value)}
                                    required
                                >
                                    {['server', 'workstation', 'mobile', 'network', 'cloud', 'other'].map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>

                {/* System Information */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>System Information</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Operating System"
                                value={formData.operatingSystem}
                                onChange={(e) => handleChange('operatingSystem', e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Version"
                                value={formData.version}
                                onChange={(e) => handleChange('version', e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                {/* IP Addresses */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>IP Addresses</Typography>
                    <div className="flex gap-2 mb-2">
                        <TextField
                            value={newIp}
                            onChange={(e) => setNewIp(e.target.value)}
                            placeholder="Enter IP address"
                            size="small"
                        />
                        <Button variant="outlined" onClick={addIpAddress}>
                            Add
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {formData.ipAddresses?.map((ip, idx) => (
                            <Chip
                                key={idx}
                                label={ip}
                                onDelete={() => removeIpAddress(ip)}
                                size="small"
                            />
                        ))}
                    </div>
                </Grid>

                {/* Organization Information */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Organization Information</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Department"
                                value={formData.department}
                                onChange={(e) => handleChange('department', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Location"
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Owner"
                                value={formData.owner}
                                onChange={(e) => handleChange('owner', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={formData.status}
                                    label="Status"
                                    onChange={(e) => handleChange('status', e.target.value)}
                                >
                                    {['active', 'inactive', 'maintenance', 'decommissioned'].map((status) => (
                                        <MenuItem key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Security Priority */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Security Priority (CIA)</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography gutterBottom>Confidentiality</Typography>
                            <Slider
                                value={formData.priority.confidentiality}
                                onChange={(_, value) => handlePriorityChange('confidentiality', value as number)}
                                step={1}
                                marks
                                min={1}
                                max={5}
                                valueLabelDisplay="auto"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography gutterBottom>Integrity</Typography>
                            <Slider
                                value={formData.priority.integrity}
                                onChange={(_, value) => handlePriorityChange('integrity', value as number)}
                                step={1}
                                marks
                                min={1}
                                max={5}
                                valueLabelDisplay="auto"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography gutterBottom>Availability</Typography>
                            <Slider
                                value={formData.priority.availability}
                                onChange={(_, value) => handlePriorityChange('availability', value as number)}
                                step={1}
                                marks
                                min={1}
                                max={5}
                                valueLabelDisplay="auto"
                            />
                        </Grid>
                    </Grid>
                </Grid>

                {/* Labels */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Labels</Typography>
                    <div className="flex gap-2 mb-2">
                        <TextField
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            placeholder="Enter label"
                            size="small"
                        />
                        <Button variant="outlined" onClick={addLabel}>
                            Add
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {formData.labels?.map((label, idx) => (
                            <Chip
                                key={idx}
                                label={label}
                                onDelete={() => removeLabel(label)}
                                size="small"
                            />
                        ))}
                    </div>
                </Grid>
            </Grid>

            {/* Form Actions */}
            <Grid item xs={12}>
                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding Asset...' : 'Add Asset'}
                    </Button>
                </div>
            </Grid>
        </form>
    );
};

export default AssetForm; 