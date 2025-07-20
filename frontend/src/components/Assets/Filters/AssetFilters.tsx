import { useState } from "react";
import {
  TextField,
  IconButton,
  Button,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Chip,
  Box,
} from "@mui/material";
import { FilterList, Close } from "@mui/icons-material";
import { AssetFilter, AssetStatus } from "../../../types/asset.types";

interface AssetFiltersProps {
  filters: AssetFilter;
  onFilterChange: (filters: AssetFilter) => void;
  availableOsTypes: string[];
}

const AssetFilters: React.FC<AssetFiltersProps> = ({
  filters,
  onFilterChange,
  availableOsTypes,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleFilterChange = (key: keyof AssetFilter, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleStatusToggle = (status: AssetStatus) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    handleFilterChange("status", newStatuses);
  };

  const handleOsTypeToggle = (osType: string) => {
    const newOsTypes = filters.osType.includes(osType)
      ? filters.osType.filter((t) => t !== osType)
      : [...filters.osType, osType];
    handleFilterChange("osType", newOsTypes);
  };

  return (
    <div>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search assets..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          sx={{
            flexGrow: 1,
            maxWidth: "400px",
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
            },
          }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ height: 40 }}
        >
          Filters
        </Button>
      </Box>

      {/* Active Filters */}
      {(filters.status.length > 0 || filters.osType.length > 0) && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {filters.status.map((status) => (
            <Chip
              key={status}
              label={`Status: ${status}`}
              onDelete={() => handleStatusToggle(status)}
              size="small"
            />
          ))}
          {filters.osType.map((osType) => (
            <Chip
              key={osType}
              label={`OS: ${osType}`}
              onDelete={() => handleOsTypeToggle(osType)}
              size="small"
            />
          ))}
        </Box>
      )}

      {/* Filter Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: { width: 320 },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Filters</Typography>
            <IconButton size="small" onClick={() => setAnchorEl(null)}>
              <Close />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Status Filters */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Status
              </Typography>
              <FormGroup>
                {["active", "inactive"].map((status) => (
                  <FormControlLabel
                    key={status}
                    control={
                      <Checkbox
                        checked={filters.status.includes(status as AssetStatus)}
                        onChange={() =>
                          handleStatusToggle(status as AssetStatus)
                        }
                        size="small"
                      />
                    }
                    label={status}
                  />
                ))}
              </FormGroup>
            </Box>

            <Divider />

            {/* OS Type Filters */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Operating System
              </Typography>
              <FormGroup>
                {availableOsTypes.map((osType) => (
                  <FormControlLabel
                    key={osType}
                    control={
                      <Checkbox
                        checked={filters.osType.includes(osType)}
                        onChange={() => handleOsTypeToggle(osType)}
                        size="small"
                      />
                    }
                    label={osType}
                  />
                ))}
              </FormGroup>
            </Box>
          </Box>
        </Box>
      </Popover>
    </div>
  );
};

export default AssetFilters;
