import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="container">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="container">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

