import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <div className="card">
        <div className="row space">
          <div>
            <h1>Dashboard</h1>
            <p className="muted">You are signed in.</p>
          </div>
          <button onClick={() => void logout()} className="secondary">
            Sign out
          </button>
        </div>

        <div className="section">
          <div className="kv">
            <div className="k">Name</div>
            <div className="v">{user?.name}</div>
          </div>
          <div className="kv">
            <div className="k">Email</div>
            <div className="v">{user?.email}</div>
          </div>
          <div className="kv">
            <div className="k">Role</div>
            <div className="v">{user?.role}</div>
          </div>
        </div>

        {user?.role === "admin" ? (
          <div className="section">
            <Link to="/admin">Go to Admin Panel →</Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

