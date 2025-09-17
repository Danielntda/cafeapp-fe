import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          style={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          Daniel Ng Cafe Management System
        </Typography>

        <Button color="inherit" component={Link} to="/cafes">
          Cafes
        </Button>
        <Button color="inherit" component={Link} to="/employees">
          Employees
        </Button>
      </Toolbar>
    </AppBar>
  );
}
