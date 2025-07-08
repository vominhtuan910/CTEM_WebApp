import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";

import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const AppLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader />
      <Container component="main" sx={{ flexGrow: 1, mt: 2 }}>
        <Outlet />
      </Container>
      <AppFooter />
    </Box>
  );
};

export default AppLayout;