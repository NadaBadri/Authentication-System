import { createContext } from "react";
import type { ApiUser } from "../lib/api";

export type AuthState = {
  user: ApiUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);

