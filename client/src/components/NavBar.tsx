import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function NavBar() {
  const { user, logout } = useAuth();

  return (
    <div className="nav">
      <div className="nav-inner">
        <div className="nav-left">
          <Link to="/events" className="brand">
            Bookings
          </Link>
          <Link to="/events">Events</Link>
          {user ? <Link to="/bookings">My bookings</Link> : null}
          {user ? <Link to="/dashboard">Account</Link> : null}
          {user?.role === "admin" ? <Link to="/admin">Admin</Link> : null}
        </div>
        <div className="nav-right">
          {user ? (
            <button className="secondary" onClick={() => void logout()}>
              Sign out
            </button>
          ) : (
            <div className="nav-auth">
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create account</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

