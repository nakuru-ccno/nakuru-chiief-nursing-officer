import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import Dashboard from "@/pages/Dashboard";
import ActivitiesPage from "@/pages/ActivitiesPage";
import ReportsPage from "@/pages/ReportsPage";
import CalendarPage from "@/pages/CalendarPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminDashboard from "@/pages/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import { useAuthGuard } from "@/hooks/useAuthGuard";

function App() {
  const isAuthenticated = useAuthGuard();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes with Layout */}
        {isAuthenticated && (
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
          </Route>
        )}

        {/* Redirect all other paths */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
