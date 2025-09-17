import React from 'react';
import { Container, Typography } from '@mui/material';
import CafesGrid from './CafesGrid';

export default function CafesPage() {
  return (
    <Container style={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>
      </Typography>

      {/* Render the Cafes Grid */}
      <CafesGrid />
    </Container>
  );
}
