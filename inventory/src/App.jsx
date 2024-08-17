import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavbarComponent from './components/Navbar';
import LoginPage from './components/LoginPage';

import Dashboard from './components/Dashboard';
import ItemDetails from './components/ItemDetails';
import OrderPage from './components/OrderPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'; // Redirect to login page on logout
  };
  return (
    <Router>
      <NavbarComponent onLogout={handleLogout} />
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />

        {/* <Route path="/" element={<Dashboard />} /> */}
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/order/:id" element={<OrderPage />} />
      </Routes>
    </Router>
  );
}

export default App;
