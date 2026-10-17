// @ts-nocheck

import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SuperAdminProvider, useSuperAdmin } from "./context/SuperAdminContext";

import AppLayout from "./layout/AppLayout";
import Careers from "./pages/public/Careers";
import Landing from "./pages/public/Landing";
import Login from "./pages/public/Login";
import ForgotPassword from "./pages/public/ForgotPassword";
import ResetPassword from "./pages/public/ResetPassword";
import AppRoutes from "./routes/AppRoutes";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import { getDashboardPathByRole } from "./utils/authRoutes";

// SuperAdmin pages
import SuperAdminLogin from "./pages/superadmin/SuperAdminLogin";
import SuperAdminLayout from "./pages/superadmin/SuperAdminLayout";
import Analytics from "./pages/superadmin/Analytics";
import Organizations from "./pages/superadmin/Organizations";
import SubscriptionPlans from "./pages/superadmin/SubscriptionPlans";
import PaymentHistory from "./pages/superadmin/PaymentHistory";
import SupportTickets from "./pages/superadmin/SupportTickets";

// ─────────────────────────────────────────────────────────────
// App Shell (shown after login)
// ─────────────────────────────────────────────────────────────
function AppShell() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AppRoutes activeTab={activeTab} setActiveTab={setActiveTab} />
    </AppLayout>
  );
}

// ─────────────────────────────────────────────────────────────
// SuperAdmin Shell — protected, separate layout
// ─────────────────────────────────────────────────────────────
function SuperAdminShell() {
  const { isLoggedIn, loading } = useSuperAdmin();
  const [activeTab, setActiveTab] = useState("analytics");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/superadmin/login" replace />;

  const PAGE = {
    analytics: <Analytics />,
    organizations: <Organizations />,
    plans: <SubscriptionPlans />,
    "payment-history": <PaymentHistory />,
    support: <SupportTickets />,
  };

  return (
    <SuperAdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {PAGE[activeTab] || <Analytics />}
    </SuperAdminLayout>
  );
}

// ─────────────────────────────────────────────────────────────
// Root App — shows Login if not logged in, AppShell if logged in
// ─────────────────────────────────────────────────────────────
function DashboardGate() {
  const { user } = useAuth();

  return <Navigate to={getDashboardPathByRole(user)} replace />;
}

export default function App() {
  return (
    <SuperAdminProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* Public careers page — no login required */}
          <Route path="/careers" element={<Careers />} />

          <Route
            path="/login"
            element={(
              <PublicRoute>
                <Login />
              </PublicRoute>
            )}
          />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />

          {/* Forgot / Reset Password — public, no auth required */}
          <Route
            path="/forgot-password"
            element={(
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            )}
          />
          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />

          {/* Dashboard — redirects to role-specific shell */}
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <DashboardGate />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin/dashboard"
            element={(
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppShell />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/employee/dashboard"
            element={(
              <ProtectedRoute allowedRoles={["employee"]}>
                <AppShell />
              </ProtectedRoute>
            )}
          />

          {/* SuperAdmin routes — fully isolated */}
          <Route path="/superadmin/login" element={<SuperAdminLogin />} />
          <Route path="/superadmin/dashboard" element={<SuperAdminShell />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: "12px", fontSize: "14px", fontWeight: 600 },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
    </SuperAdminProvider>
  );
}