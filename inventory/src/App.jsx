import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavbarComponent from "./components/Navbar";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import ItemDetails from "./components/ItemDetails";
import OrderPage from "./components/OrderPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import OrderDetailsByID from "./components/OrderDetailsByID";
function App() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // Redirect to login page on logout
  };
  return (
    <Router>
      <NavbarComponent onLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/order/:id" element={<OrderDetailsByID />} />
        <Route path="/orders" element={<ProtectedRoute element={<OrderPage />} />}/>
      </Routes>
    </Router>
  );
}

export default App;
