import React from 'react';
import { Box, Container, Typography, Link, Stack } from '@mui/material';

const AppFooter: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Box component="footer" sx={{ py: 3, bgcolor: 'primary.main', color: 'white', mt: 'auto' }}>
            <Container maxWidth="lg">
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                        © {currentYear} CTEM. All rights reserved.
                    </Typography>
                    <Stack direction="row" spacing={3}>
                        <Link href="/about" color="inherit" underline="hover">
                            About
                        </Link>
                        <Link href="/privacy" color="inherit" underline="hover">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" color="inherit" underline="hover">
                            Terms of Use
                        </Link>
                        <Link href="/contact" color="inherit" underline="hover">
                            Contact
                        </Link>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
};

export default AppFooter;