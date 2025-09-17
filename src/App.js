import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CafesPage from './components/CafesPage';
import EmployeesPage from './components/EmployeesPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<CafesPage />} />
        <Route path="/cafes" element={<CafesPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
