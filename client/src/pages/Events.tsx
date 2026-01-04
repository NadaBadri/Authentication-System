import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { api } from "../lib/api";
import { getApiErrorMessage } from "../lib/errors";

type ApiEvent = {
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

export function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingEventId, setBookingEventId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ events: ApiEvent[] }>("/api/events");
      setEvents(res.data.events);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load events"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upcoming = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [events]);

  const book = async (eventId: string) => {
    setBookingEventId(eventId);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post<{ booking: { id: string; status: string } }>("/api/bookings", { eventId });
      setSuccess(`Booked! Status: ${res.data.booking.status}`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Booking failed"));
    } finally {
      setBookingEventId(null);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="row space">
          <div>
            <h1>Upcoming events</h1>
            <p className="muted">Browse events and reserve your spot.</p>
          </div>
          <button className="secondary" onClick={() => void load()}>
            Refresh
          </button>
        </div>

        {error ? <div className="error">{error}</div> : null}
        {success ? (
          <div className="section">
            <div className="muted">{success}</div>
            {user ? (
              <div className="row">
                <Link to="/bookings">View my bookings →</Link>
              </div>
            ) : null}
          </div>
        ) : null}

        {loading ? (
          <div className="muted">Loading…</div>
        ) : upcoming.length === 0 ? (
          <div className="muted">No upcoming events.</div>
        ) : (
          <div className="section">
            <div className="table">
              <div className="thead">
                <div>Event</div>
                <div>When</div>
                <div>Policy</div>
                <div />
              </div>
              {upcoming.map((e) => (
                <div className="trow" key={e.id}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{e.title}</div>
                    <div className="muted" style={{ margin: "4px 0 0" }}>
                      {e.location || "Online / TBA"}
                    </div>
                    {e.description ? (
                      <div className="muted" style={{ margin: "6px 0 0" }}>
                        {e.description}
                      </div>
                    ) : null}
                  </div>
                  <div className="mono">
                    <div>{new Date(e.startAt).toLocaleString()}</div>
                    <div className="muted">{new Date(e.endAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="mono">{e.requiresApproval ? "Approval required" : "Instant"}</div>
                    <div className="muted">{e.capacity > 0 ? `Capacity: ${e.capacity}` : "No capacity limit"}</div>
                  </div>
                  <div className="right">
                    {user ? (
                      <button disabled={bookingEventId === e.id} onClick={() => void book(e.id)}>
                        {bookingEventId === e.id ? "Booking…" : "Book"}
                      </button>
                    ) : (
                      <Link to="/login">Sign in to book</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

