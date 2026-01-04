import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, type ApiUser } from "../lib/api";
import { getApiErrorMessage } from "../lib/errors";

type AdminUser = ApiUser & { createdAt?: string; updatedAt?: string };

export function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, AdminUser["role"]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ users: AdminUser[] }>("/api/admin/users");
      setUsers(res.data.users);
      setRoleDrafts(Object.fromEntries(res.data.users.map((u) => [u.id, u.role])));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.email.localeCompare(b.email));
  }, [users]);

  const saveRole = async (userId: string) => {
    const role = roleDrafts[userId];
    if (!role) return;
    setSavingId(userId);
    setError(null);
    try {
      const res = await api.patch<{ user: ApiUser }>(`/api/admin/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: res.data.user.role } : u)));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to update role"));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="row space">
          <div>
            <h1>Admin Panel</h1>
            <p className="muted">Manage users and roles.</p>
          </div>
          <Link to="/dashboard">← Back</Link>
        </div>

        {error ? <div className="error">{error}</div> : null}

        {loading ? (
          <div className="muted">Loading…</div>
        ) : (
          <div className="table">
            <div className="thead">
              <div>Email</div>
              <div>Name</div>
              <div>Role</div>
              <div />
            </div>
            {sortedUsers.map((u) => (
              <div className="trow" key={u.id}>
                <div className="mono">{u.email}</div>
                <div>{u.name}</div>
                <div>
                  <select
                    value={roleDrafts[u.id] ?? u.role}
                    onChange={(e) =>
                      setRoleDrafts((prev) => ({ ...prev, [u.id]: e.target.value as ApiUser["role"] }))
                    }
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div className="right">
                  <button
                    className="secondary"
                    disabled={savingId === u.id || (roleDrafts[u.id] ?? u.role) === u.role}
                    onClick={() => void saveRole(u.id)}
                  >
                    {savingId === u.id ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="section">
          <button onClick={() => void load()} className="secondary">
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

