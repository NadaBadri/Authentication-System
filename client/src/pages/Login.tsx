import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getApiErrorMessage } from "../lib/errors";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Login failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Sign in</h1>
        <p className="muted">Use your account credentials.</p>

        <form onSubmit={onSubmit} className="form">
          <label>
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>

          <label>
            <span>Password</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </label>

          {error ? <div className="error">{error}</div> : null}

          <button disabled={submitting} type="submit">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="row">
          <span className="muted">No account?</span> <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}

