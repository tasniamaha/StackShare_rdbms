// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import BorrowerDashboard from "./components/dashboards/BorrowerDashboard";
import OwnerDashboard from "./components/dashboards/OwnerDashboard";

import "./components/styles/main.css"; // global styles

// Utility to get logged-in user
import { getAuthUser } from "./components/utils/authStorage";

function App() {
  const user = getAuthUser(); // returns stored user object or null

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route
        path="/borrower/dashboard"
        element={
          user && user.role !== "owner" ? (
            <BorrowerDashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/owner/dashboard"
        element={
          user && user.role === "owner" ? (
            <OwnerDashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Redirect root to dashboard if logged in */}
      <Route
        path="/"
        element={
          user ? (
            user.role === "owner" ? (
              <Navigate to="/owner/dashboard" />
            ) : (
              <Navigate to="/borrower/dashboard" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;
