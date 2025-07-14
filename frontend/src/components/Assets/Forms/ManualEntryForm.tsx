import { useState } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Button,
  Grid,
  OutlinedInput,
  Stack,
} from "@mui/material";

interface ManualEntryFormProps {
  onAssetAdded?: () => void;
  onSubmit: (data: {
    name: string;
    ip: string;
    os: string;
    services: string[];
    description: string;
    value: number;
  }) => void;
}

const osOptions = ["Windows", "Linux", "macOS", "Unix", "Other"];
const serviceOptions = ["HTTP", "HTTPS", "SSH", "FTP", "SMTP", "DNS", "Other"];

const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [os, setOs] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [value, setValue] = useState<number | "">("");

  const handleServiceChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setServices(e.target.value as string[]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && ip && os && value !== "") {
      onSubmit({ name, ip, os, services, description, value: Number(value) });
      setName("");
      setIp("");
      setOs("");
      setServices([]);
      setDescription("");
      setValue("");
    }
  };

  return (
    <Box sx={{ maxWidth: "md", mx: "auto", p: 2, bgcolor: "background.paper" }}>
      <Typography variant="h6" align="center" gutterBottom>
        Add Asset
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Host/Device Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="IP Address"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              required
              fullWidth
              size="small"
              placeholder="e.g. 192.168.1.1"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Operating System</InputLabel>
              <Select
                value={os}
                onChange={(e) => setOs(e.target.value)}
                required
                label="Operating System"
              >
                <MenuItem value="">
                  <em>Select OS</em>
                </MenuItem>
                {osOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Value"
              type="number"
              value={value}
              onChange={(e) =>
                setValue(e.target.value === "" ? "" : Number(e.target.value))
              }
              required
              fullWidth
              size="small"
              InputProps={{
                inputProps: { min: 0, step: "any" },
              }}
            />
          </Grid>
        </Grid>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Services</InputLabel>
            <Select
              multiple
              value={services}
              onChange={handleServiceChange as any}
              input={<OutlinedInput label="Services" />}
              renderValue={(selected) => (selected as string[]).join(", ")}
            >
              {serviceOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Additional info"
            size="small"
          />
        </Stack>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            py: 1,
            bgcolor: "primary.main",
            color: "white",
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "primary.dark",
            },
          }}
        >
          Save
        </Button>
      </form>
    </Box>
  );
};

export default ManualEntryForm;
