import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { getApiErrorMessage } from "../lib/errors";

type Booking = {
  id: string;
  status: "pending" | "approved" | "cancelled";
  createdAt: string;
  event: {
    id: string;
    title: string;
    location: string;
    startAt: string;
    endAt: string;
    requiresApproval: boolean;
    isActive: boolean;
  } | null;
};

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ bookings: Booking[] }>("/api/bookings/me");
      setBookings(res.data.bookings);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load bookings"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const active = useMemo(() => bookings.filter((b) => b.status !== "cancelled"), [bookings]);

  const cancel = async (bookingId: string) => {
    setCancellingId(bookingId);
    setError(null);
    try {
      await api.post(`/api/bookings/${bookingId}/cancel`);
      await load();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Cancel failed"));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="row space">
          <div>
            <h1>My bookings</h1>
            <p className="muted">Your reservations and their status.</p>
          </div>
          <Link to="/events">Browse events →</Link>
        </div>

        {error ? <div className="error">{error}</div> : null}

        {loading ? (
          <div className="muted">Loading…</div>
        ) : active.length === 0 ? (
          <div className="muted">No bookings yet.</div>
        ) : (
          <div className="table">
            <div className="thead">
              <div>Event</div>
              <div>When</div>
              <div>Status</div>
              <div />
            </div>
            {active.map((b) => (
              <div className="trow" key={b.id}>
                <div>
                  <div style={{ fontWeight: 700 }}>{b.event?.title ?? "Event deleted"}</div>
                  <div className="muted" style={{ margin: "4px 0 0" }}>
                    {b.event?.location || "Online / TBA"}
                  </div>
                </div>
                <div className="mono">
                  <div>{b.event ? new Date(b.event.startAt).toLocaleString() : "—"}</div>
                  <div className="muted">{b.event ? new Date(b.event.endAt).toLocaleString() : "—"}</div>
                </div>
                <div className="mono">{b.status}</div>
                <div className="right">
                  <button
                    className="secondary"
                    disabled={cancellingId === b.id || b.status === "cancelled"}
                    onClick={() => void cancel(b.id)}
                  >
                    {cancellingId === b.id ? "Cancelling…" : "Cancel"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="section">
          <button className="secondary" onClick={() => void load()}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

