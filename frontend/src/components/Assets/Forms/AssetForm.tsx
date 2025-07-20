import { useState } from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Slider,
  Box,
  Stack,
} from "@mui/material";
import { Asset, AssetFormState } from "../../../types/asset.types";

interface AssetFormProps {
  asset?: Partial<Asset>;
  onSubmit: (data: Partial<Asset>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const AssetForm: React.FC<AssetFormProps> = ({
  asset,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<AssetFormState>({
    hostname: "",
    ipAddress: "",
    status: "active",
    type: "workstation",
    ipAddresses: [""],
    operatingSystem: "",
    version: "",
    department: "",
    location: "",
    owner: "",
    labels: [],
    priority: {
      confidentiality: 1,
      integrity: 1,
      availability: 1,
    },
    ...(asset as any), // Type assertion to avoid property mismatch errors
  });

  const [newLabel, setNewLabel] = useState("");
  const [newIp, setNewIp] = useState("");

  const handleChange = (field: keyof AssetFormState, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePriorityChange = (
    type: keyof AssetFormState["priority"],
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      priority: {
        ...prev.priority,
        [type]: value,
      },
    }));
  };

  const addLabel = () => {
    if (newLabel && !formData.labels.includes(newLabel)) {
      setFormData((prev) => ({
        ...prev,
        labels: [...prev.labels, newLabel],
      }));
      setNewLabel("");
    }
  };

  const removeLabel = (label: string) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.filter((l: string) => l !== label),
    }));
  };

  const addIpAddress = () => {
    if (newIp && !formData.ipAddresses.includes(newIp)) {
      setFormData((prev) => ({
        ...prev,
        ipAddresses: [...prev.ipAddresses, newIp],
      }));
      setNewIp("");
    }
  };

  const removeIpAddress = (ip: string) => {
    setFormData((prev) => ({
      ...prev,
      ipAddresses: prev.ipAddresses.filter((i: string) => i !== ip),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Asset Name"
                value={formData.hostname}
                onChange={(e) => handleChange("hostname", e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Asset Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Asset Type"
                  onChange={(e) => handleChange("type", e.target.value)}
                  required
                >
                  {[
                    "server",
                    "workstation",
                    "mobile",
                    "network",
                    "cloud",
                    "other",
                  ].map((type) => (
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
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" gutterBottom>
            System Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Operating System"
                value={formData.operatingSystem}
                onChange={(e) =>
                  handleChange("operatingSystem", e.target.value)
                }
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Version"
                value={formData.version}
                onChange={(e) => handleChange("version", e.target.value)}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* IP Addresses */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" gutterBottom>
            IP Addresses
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              placeholder="Enter IP address"
              size="small"
            />
            <Button variant="outlined" onClick={addIpAddress}>
              Add
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {formData.ipAddresses.map((ip: string, idx: number) => (
              <Chip
                key={idx}
                label={ip}
                onDelete={() => removeIpAddress(ip)}
                size="small"
              />
            ))}
          </Box>
        </Grid>

        {/* Organization Information */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" gutterBottom>
            Organization Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => handleChange("department", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Owner"
                value={formData.owner}
                onChange={(e) => handleChange("owner", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  {["active", "inactive", "maintenance", "decommissioned"].map(
                    (status) => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>

        {/* Labels/Tags */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" gutterBottom>
            Tags/Labels
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Enter label/tag"
              size="small"
            />
            <Button variant="outlined" onClick={addLabel}>
              Add
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {formData.labels.map((label: string, idx: number) => (
              <Chip
                key={idx}
                label={label}
                onDelete={() => removeLabel(label)}
                size="small"
                color="primary"
              />
            ))}
          </Box>
        </Grid>

        {/* Priority Settings */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" gutterBottom>
            Priority Settings (CIA)
          </Typography>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Box>
              <Typography id="confidentiality-slider" gutterBottom>
                Confidentiality: {formData.priority.confidentiality}
              </Typography>
              <Slider
                value={formData.priority.confidentiality}
                onChange={(_, value) =>
                  handlePriorityChange("confidentiality", value as number)
                }
                step={1}
                marks
                min={1}
                max={5}
                valueLabelDisplay="auto"
                aria-labelledby="confidentiality-slider"
              />
            </Box>

            <Box>
              <Typography id="integrity-slider" gutterBottom>
                Integrity: {formData.priority.integrity}
              </Typography>
              <Slider
                value={formData.priority.integrity}
                onChange={(_, value) =>
                  handlePriorityChange("integrity", value as number)
                }
                step={1}
                marks
                min={1}
                max={5}
                valueLabelDisplay="auto"
                aria-labelledby="integrity-slider"
              />
            </Box>

            <Box>
              <Typography id="availability-slider" gutterBottom>
                Availability: {formData.priority.availability}
              </Typography>
              <Slider
                value={formData.priority.availability}
                onChange={(_, value) =>
                  handlePriorityChange("availability", value as number)
                }
                step={1}
                marks
                min={1}
                max={5}
                valueLabelDisplay="auto"
                aria-labelledby="availability-slider"
              />
            </Box>
          </Stack>
        </Grid>

        {/* Submit Buttons */}
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 3,
            }}
          >
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isSubmitting}
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                boxShadow: 2,
                "&:hover": { boxShadow: 4 },
              }}
            >
              {isSubmitting
                ? "Saving..."
                : asset
                ? "Update Asset"
                : "Add Asset"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default AssetForm;
