import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import LoginPage from "./components/LoginPage";
import ManageUsers from "./components/ManageUsers";
import InventoryDashboard from "./components/InventoryDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar, { SIDEBAR_WIDTH } from "./components/Sidebar";
import { AuthProvider } from "./components/AuthContext";
import BillingPanel from "./components/BillingPanel";
import createAppTheme from "./theme";
import { LiveWeightProvider } from "./components/LiveWeightContext";
import Profile from "./components/Profile";
import DashboardPage from "./components/DashboardPage";
import LocationsPage from "./components/LocationsPage";
import NotificationsPanel from "./components/NotificationsPanel";

/* ─── Sidebar-based layout (replaces top Navbar) ──────────────── */
const AppLayout = () => (
  <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
    <Sidebar />
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        ml: `${SIDEBAR_WIDTH}px`,
        minHeight: '100vh',
        overflow: 'auto',
      }}
    >
      <Outlet />
    </Box>
  </Box>
);

const ALL_ROLES = ['admin', 'manager', 'worker', 'owner'];

function App() {
  const theme = createAppTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <LiveWeightProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute allowedRoles={ALL_ROLES}>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute allowedRoles={ALL_ROLES}>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="inventory"
                  element={
                    <ProtectedRoute allowedRoles={ALL_ROLES}>
                      <InventoryDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="billing"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'manager']}>
                      <BillingPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="locations"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'owner']}>
                      <LocationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="manage-users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="notifications"
                  element={
                    <ProtectedRoute allowedRoles={ALL_ROLES}>
                      <NotificationsPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute allowedRoles={ALL_ROLES}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </LiveWeightProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
