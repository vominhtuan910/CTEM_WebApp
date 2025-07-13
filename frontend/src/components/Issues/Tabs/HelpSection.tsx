import { Box, Typography, Button, alpha, useTheme } from "@mui/material";
import { HelpOutlineOutlined } from "@mui/icons-material";

interface LinkProps {
  children: React.ReactNode;
  [key: string]: any;
}

const Link: React.FC<LinkProps> = ({ children, ...props }) => (
  <Typography component="span" {...props}>
    {children}
  </Typography>
);

const HelpSection: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
        borderRadius: 2,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.info.main, 0.2),
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
      }}
    >
      <HelpOutlineOutlined color="info" sx={{ fontSize: 24 }} />
      <Box>
        <Typography variant="subtitle1" fontWeight="medium">
          Need help managing security issues?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Check our{" "}
          <Link
            component="span"
            sx={{ cursor: "pointer", color: "primary.main" }}
          >
            security best practices guide
          </Link>{" "}
          or{" "}
          <Link
            component="span"
            sx={{ cursor: "pointer", color: "primary.main" }}
          >
            contact our support team
          </Link>
          .
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="info"
        disableElevation
        sx={{ ml: { xs: 0, sm: "auto" }, mt: { xs: 2, sm: 0 } }}
      >
        View Documentation
      </Button>
    </Box>
  );
};

export default HelpSection;
