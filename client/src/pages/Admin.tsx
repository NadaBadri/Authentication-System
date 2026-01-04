import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type ApiUser } from "../lib/api";
import { getApiErrorMessage } from "../lib/errors";

type Tab = "events" | "bookings" | "users";

type AdminUser = ApiUser & { createdAt?: string; updatedAt?: string };

type AdminEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  startAt: string;
  endAt: string;
  capacity: number;
  requiresApproval: boolean;
  isActive: boolean;
};

type AdminBooking = {
  id: string;
  status: "pending" | "approved" | "cancelled";
  createdAt: string;
  user: { id: string; email: string; name: string; role: "user" | "admin" } | null;
  event: { id: string; title: string; location: string; startAt: string; endAt: string } | null;
};

export function AdminPage() {
  const [tab, setTab] = useState<Tab>("events");
  const [error, setError] = useState<string | null>(null);

  // Events
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "",
    startAt: "",
    endAt: "",
    capacity: 0,
    requiresApproval: false,
    isActive: true
  });
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);

  // Bookings
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingStatusDrafts, setBookingStatusDrafts] = useState<Record<string, AdminBooking["status"]>>({});
  const [savingBookingId, setSavingBookingId] = useState<string | null>(null);

  // Users
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, AdminUser["role"]>>({});

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ events: AdminEvent[] }>("/api/admin/events");
      setEvents(res.data.events);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load events"));
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ bookings: AdminBooking[] }>("/api/admin/bookings");
      setBookings(res.data.bookings);
      setBookingStatusDrafts(Object.fromEntries(res.data.bookings.map((b) => [b.id, b.status])));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load bookings"));
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setError(null);
    try {
      const res = await api.get<{ users: AdminUser[] }>("/api/admin/users");
      setUsers(res.data.users);
      setRoleDrafts(Object.fromEntries(res.data.users.map((u) => [u.id, u.role])));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load users"));
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial load for default tab
    void loadEvents();
  }, [loadEvents]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [events]);

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings]);

  const sortedUsers = useMemo(() => [...users].sort((a, b) => a.email.localeCompare(b.email)), [users]);

  const createEvent = async () => {
    setCreating(true);
    setError(null);
    try {
      await api.post("/api/admin/events", {
        ...newEvent,
        capacity: Number(newEvent.capacity || 0)
      });
      setNewEvent({
        title: "",
        description: "",
        location: "",
        startAt: "",
        endAt: "",
        capacity: 0,
        requiresApproval: false,
        isActive: true
      });
      await loadEvents();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to create event"));
    } finally {
      setCreating(false);
    }
  };

  const updateEvent = async (eventId: string, patch: Partial<AdminEvent>) => {
    setUpdatingEventId(eventId);
    setError(null);
    try {
      await api.patch(`/api/admin/events/${eventId}`, patch);
      await loadEvents();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to update event"));
    } finally {
      setUpdatingEventId(null);
    }
  };

  const saveBookingStatus = async (bookingId: string) => {
    const status = bookingStatusDrafts[bookingId];
    if (!status) return;
    setSavingBookingId(bookingId);
    setError(null);
    try {
      await api.patch(`/api/admin/bookings/${bookingId}/status`, { status });
      await loadBookings();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to update booking"));
    } finally {
      setSavingBookingId(null);
    }
  };

  const saveUserRole = async (userId: string) => {
    const role = roleDrafts[userId];
    if (!role) return;
    setSavingUserId(userId);
    setError(null);
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role });
      await loadUsers();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to update role"));
    } finally {
      setSavingUserId(null);
    }
  };

  const switchTab = async (next: Tab) => {
    setTab(next);
    if (next === "events") await loadEvents();
    if (next === "bookings") await loadBookings();
    if (next === "users") await loadUsers();
  };

  return (
    <div className="container">
      <div className="card">
        <div className="row space">
          <div>
            <h1>Admin Panel</h1>
            <p className="muted">Manage events, bookings, and users.</p>
          </div>
          <div className="row" style={{ marginTop: 0 }}>
            <button className={tab === "events" ? "" : "secondary"} onClick={() => void switchTab("events")}>
              Events
            </button>
            <button className={tab === "bookings" ? "" : "secondary"} onClick={() => void switchTab("bookings")}>
              Bookings
            </button>
            <button className={tab === "users" ? "" : "secondary"} onClick={() => void switchTab("users")}>
              Users
            </button>
          </div>
        </div>

        {error ? <div className="error">{error}</div> : null}

        {tab === "events" ? (
          <div className="section">
            <h1 style={{ fontSize: 18, marginBottom: 10 }}>Create event</h1>
            <div className="form">
              <label>
                <span>Title</span>
                <input value={newEvent.title} onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))} />
              </label>
              <label>
                <span>Description</span>
                <input
                  value={newEvent.description}
                  onChange={(e) => setNewEvent((p) => ({ ...p, description: e.target.value }))}
                />
              </label>
              <label>
                <span>Location</span>
                <input
                  value={newEvent.location}
                  onChange={(e) => setNewEvent((p) => ({ ...p, location: e.target.value }))}
                />
              </label>
              <label>
                <span>Start (ISO datetime)</span>
                <input
                  placeholder="2026-01-04T18:00:00.000Z"
                  value={newEvent.startAt}
                  onChange={(e) => setNewEvent((p) => ({ ...p, startAt: e.target.value }))}
                />
              </label>
              <label>
                <span>End (ISO datetime)</span>
                <input
                  placeholder="2026-01-04T19:00:00.000Z"
                  value={newEvent.endAt}
                  onChange={(e) => setNewEvent((p) => ({ ...p, endAt: e.target.value }))}
                />
              </label>
              <label>
                <span>Capacity (0 = unlimited)</span>
                <input
                  type="number"
                  value={newEvent.capacity}
                  onChange={(e) => setNewEvent((p) => ({ ...p, capacity: Number(e.target.value) }))}
                />
              </label>
              <label>
                <span>Requires approval</span>
                <select
                  value={newEvent.requiresApproval ? "yes" : "no"}
                  onChange={(e) => setNewEvent((p) => ({ ...p, requiresApproval: e.target.value === "yes" }))}
                >
                  <option value="no">No (instant)</option>
                  <option value="yes">Yes (pending)</option>
                </select>
              </label>
              <label>
                <span>Active</span>
                <select
                  value={newEvent.isActive ? "yes" : "no"}
                  onChange={(e) => setNewEvent((p) => ({ ...p, isActive: e.target.value === "yes" }))}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
              <button disabled={creating} onClick={() => void createEvent()}>
                {creating ? "Creating…" : "Create event"}
              </button>
            </div>

            <div className="section">
              <div className="row space">
                <h1 style={{ fontSize: 18, marginBottom: 0 }}>All events</h1>
                <button className="secondary" onClick={() => void loadEvents()}>
                  Refresh
                </button>
              </div>

              {eventsLoading ? (
                <div className="muted">Loading…</div>
              ) : (
                <div className="table">
                  <div className="thead">
                    <div>Event</div>
                    <div>When</div>
                    <div>Settings</div>
                    <div />
                  </div>
                  {sortedEvents.map((e) => (
                    <div className="trow" key={e.id}>
                      <div>
                        <div style={{ fontWeight: 750 }}>{e.title}</div>
                        <div className="muted" style={{ margin: "4px 0 0" }}>
                          {e.location || "Online / TBA"}
                        </div>
                        <div className="muted" style={{ margin: "6px 0 0" }}>
                          {e.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                      <div className="mono">
                        <div>{new Date(e.startAt).toLocaleString()}</div>
                        <div className="muted">{new Date(e.endAt).toLocaleString()}</div>
                      </div>
                      <div className="mono">
                        <div>{e.requiresApproval ? "Approval" : "Instant"}</div>
                        <div className="muted">{e.capacity > 0 ? `Cap ${e.capacity}` : "Unlimited"}</div>
                      </div>
                      <div className="right">
                        <button
                          className="secondary"
                          disabled={updatingEventId === e.id}
                          onClick={() => void updateEvent(e.id, { isActive: !e.isActive })}
                        >
                          {updatingEventId === e.id ? "Saving…" : e.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {tab === "bookings" ? (
          <div className="section">
            <div className="row space">
              <div>
                <h1 style={{ fontSize: 18, marginBottom: 6 }}>All bookings</h1>
                <p className="muted">Approve or cancel reservations.</p>
              </div>
              <button className="secondary" onClick={() => void loadBookings()}>
                Refresh
              </button>
            </div>

            {bookingsLoading ? (
              <div className="muted">Loading…</div>
            ) : (
              <div className="table">
                <div className="thead">
                  <div>User</div>
                  <div>Event</div>
                  <div>Status</div>
                  <div />
                </div>
                {sortedBookings.map((b) => (
                  <div className="trow" key={b.id}>
                    <div>
                      <div className="mono">{b.user?.email ?? "—"}</div>
                      <div className="muted" style={{ margin: "4px 0 0" }}>
                        {b.user?.name ?? ""}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{b.event?.title ?? "—"}</div>
                      <div className="muted" style={{ margin: "4px 0 0" }}>
                        {b.event ? new Date(b.event.startAt).toLocaleString() : ""}
                      </div>
                    </div>
                    <div>
                      <select
                        value={bookingStatusDrafts[b.id] ?? b.status}
                        onChange={(e) =>
                          setBookingStatusDrafts((p) => ({ ...p, [b.id]: e.target.value as AdminBooking["status"] }))
                        }
                      >
                        <option value="pending">pending</option>
                        <option value="approved">approved</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </div>
                    <div className="right">
                      <button
                        className="secondary"
                        disabled={savingBookingId === b.id || (bookingStatusDrafts[b.id] ?? b.status) === b.status}
                        onClick={() => void saveBookingStatus(b.id)}
                      >
                        {savingBookingId === b.id ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {tab === "users" ? (
          <div className="section">
            <div className="row space">
              <div>
                <h1 style={{ fontSize: 18, marginBottom: 6 }}>Users</h1>
                <p className="muted">Manage roles.</p>
              </div>
              <button className="secondary" onClick={() => void loadUsers()}>
                Refresh
              </button>
            </div>

            {usersLoading ? (
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
                        disabled={savingUserId === u.id || (roleDrafts[u.id] ?? u.role) === u.role}
                        onClick={() => void saveUserRole(u.id)}
                      >
                        {savingUserId === u.id ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

