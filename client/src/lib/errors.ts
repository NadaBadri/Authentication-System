import axios from "axios";

export function getApiErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data: unknown = err.response?.data;
    if (data && typeof data === "object" && "error" in data) {
      const msg = (data as Record<string, unknown>).error;
      if (typeof msg === "string" && msg.trim()) return msg;
    }
  }
  return fallback;
}

