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
        <h2>Dashboard</h2>
        </Container>
    </div>
  );
};

export default Dashboard;
