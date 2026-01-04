import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getApiErrorMessage } from "../lib/errors";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Create account</h1>
        <p className="muted">Password must be at least 8 characters.</p>

        <form onSubmit={onSubmit} className="form">
          <label>
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

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
            {submitting ? "Creating…" : "Create account"}
          </button>
        </form>

        <div className="row">
          <span className="muted">Already have an account?</span> <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

