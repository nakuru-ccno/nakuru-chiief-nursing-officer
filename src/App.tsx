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

<<<<<<< HEAD
function App() {
  const isAuthenticated = useAuthGuard();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
=======
// Layout
import MainLayout from "@/components/MainLayout";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import LiveAdmin from "./pages/LiveAdmin";
import AdminSettings from "./pages/AdminSettings";
import Activities from "./pages/Activities";
import Reports from "./pages/Reports";
import LoginCallback from "./pages/LoginCallback";
import CalendarPage from "./pages/CalendarPage";
import Profile from "./pages/Profile";

// 🔐 Protected Route Logic
function ProtectedRoute() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
>>>>>>> d83079456f9ea38e027e736a3da72e992abb055c

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

<<<<<<< HEAD
=======
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <div className="App">
            <Routes>
              {/* 🌐 Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login/callback" element={<LoginCallback />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* 🔒 Protected Routes with Main Layout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/live-admin" element={<LiveAdmin />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/user-management" element={<Admin />} />
                </Route>
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

>>>>>>> d83079456f9ea38e027e736a3da72e992abb055c
export default App;
