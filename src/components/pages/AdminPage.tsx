// src/pages/AdminPage.tsx
import React from 'react';
import { Typography, Button, Box, Container } from '@mui/material';

const AdminPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ marginTop: 4 }}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h3" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>

        <Typography variant="h6" component="p" gutterBottom>
          Welcome to the Admin Page! Here you can manage resources and users.
        </Typography>

        {/* You can add more functionality here, like buttons for different actions */}
        <Box mt={2}>
          <Button variant="contained" color="primary" size="large">
            Manage Users
          </Button>
        </Box>

        <Box mt={2}>
          <Button variant="contained" color="secondary" size="large">
            View Logs
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminPage;
