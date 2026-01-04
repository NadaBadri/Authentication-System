import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type ApiUser } from "../lib/api";
import { AuthContext, type AuthState } from "./context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<{ user: ApiUser }>("/api/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ user: ApiUser }>("/api/auth/login", { email, password });
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post<{ user: ApiUser }>("/api/auth/register", { name, email, password });
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    await api.post("/api/auth/logout");
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, refresh, login, register, logout }),
    [user, loading, refresh, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

