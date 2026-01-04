import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import { AdminRoute, ProtectedRoute } from "./components/ProtectedRoute";
import { AdminPage } from "./pages/Admin";
import { DashboardPage } from "./pages/Dashboard";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import "./index.css";

function App() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          loading ? (
            <div className="container">Loading…</div>
          ) : user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
