import React, { useEffect } from 'react';
import { Menu, MenuItem,Container, Grid, Paper  } from '@mui/material';
import AppBar from '../components/AppBar'
import AdminLogin from '../components/Login';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
    const location = useLocation();

    const data = location.state;

    // useEffect(() => {
    //     setIsAuthenticated()
    // },[])

    // if (!data.isAuthenticated) {
    //     return <AdminLogin onLogin={() => setIsAuthenticated(false)} />;
    // }
  

  return (
    <div>
        <Container sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>Messages: 123</Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>Customers: 13</Paper>
            </Grid>
     
          </Grid>
        </Container>
    </div>
  );
};

export default Dashboard;
