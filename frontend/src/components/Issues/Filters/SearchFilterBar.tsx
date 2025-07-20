import { Card, Box, TextField, InputAdornment, Button } from "@mui/material";
import { SearchOutlined, TuneOutlined } from "@mui/icons-material";
import DateRangeFilter from "./DateRangeFilter";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  onDateRangeChange,
}) => {
  const cardStyles = {
    borderRadius: 2,
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
    border: "1px solid",
    borderColor: "divider",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
      transform: "translateY(-2px)",
    },
  };

  return (
    <Card sx={{ ...cardStyles, mb: 4, p: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          alignItems: { xs: "stretch", md: "center" },
        }}
      >
        <TextField
          id="issues-search"
          placeholder="Search issues by name, CVE, severity..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            ),
            sx: { borderRadius: 2 },
          }}
        />

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            width: { xs: "100%", md: "auto" },
          }}
        >
          <DateRangeFilter onDateRangeChange={onDateRangeChange} />

          <Button
            variant="outlined"
            startIcon={<TuneOutlined />}
            sx={{ borderRadius: 2 }}
          >
            Advanced
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default SearchFilterBar;
