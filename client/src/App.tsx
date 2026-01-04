import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import { NavBar } from "./components/NavBar";
import { AdminRoute, ProtectedRoute } from "./components/ProtectedRoute";
import { AdminPage } from "./pages/Admin";
import { DashboardPage } from "./pages/Dashboard";
import { EventsPage } from "./pages/Events";
import { LoginPage } from "./pages/Login";
import { MyBookingsPage } from "./pages/MyBookings";
import { RegisterPage } from "./pages/Register";
import "./index.css";

function App() {
  const { loading } = useAuth();

  return (
    <>
      <NavBar />
      <Routes>
        <Route
          path="/"
          element={loading ? <div className="container">Loading…</div> : <Navigate to="/events" replace />}
        />

        <Route path="/events" element={<EventsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
