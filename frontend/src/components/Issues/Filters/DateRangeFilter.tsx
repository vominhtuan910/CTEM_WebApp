import { useState } from "react";
import { Button, Tooltip, Badge, Menu, Typography, Box } from "@mui/material";
import { CalendarTodayOutlined } from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

interface DateRangeFilterProps {
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  onDateRangeChange,
}) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const applyDateRange = () => {
    onDateRangeChange({ start: startDate, end: endDate });
    handleClose();
  };

  const clearDateRange = () => {
    setStartDate(null);
    setEndDate(null);
    onDateRangeChange({ start: null, end: null });
    handleClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Tooltip title="Filter by date range">
        <Badge color="primary" variant="dot" invisible={!startDate && !endDate}>
          <Button
            onClick={handleClick}
            variant="outlined"
            startIcon={<CalendarTodayOutlined />}
            sx={{ borderRadius: 2 }}
          >
            {startDate && endDate
              ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
              : "Date Range"}
          </Button>
        </Badge>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 320, p: 2 },
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Filter by Date Range
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue: Date | null) => setStartDate(newValue)}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue: Date | null) => setEndDate(newValue)}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
              minDate={startDate || undefined}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button size="small" onClick={clearDateRange}>
            Clear
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={applyDateRange}
            disabled={!startDate || !endDate}
          >
            Apply
          </Button>
        </Box>
      </Menu>
    </LocalizationProvider>
  );
};

export default DateRangeFilter;
