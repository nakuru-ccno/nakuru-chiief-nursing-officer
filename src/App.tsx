import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/MainLayout";

// Pages
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import ReportsPage from "@/pages/ReportsPage";
import ActivitiesPage from "@/pages/ActivitiesPage";
import CalendarPage from "@/pages/CalendarPage";
import AdminPage from "@/pages/AdminPage"; // Optional, if used

function App() {
  return (
    <Router>
      <Routes>
        {/* Public pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected pages using layout with navbar */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/admin" element={<AdminPage />} /> {/* Optional */}
        </Route>

        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
