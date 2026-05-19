import { AUTH_TOKEN_KEY } from "../constants/authStorage";

/** Merge Authorization header for admin API calls when a JWT is stored. */
export function withAuthHeaders(config = {}) {
  const next = { ...config };
  next.headers = { ...(config.headers || {}) };
  if (typeof localStorage !== "undefined") {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) next.headers.Authorization = `Bearer ${token}`;
  }
  return next;
}

/** Backend host in dev when not using REACT_APP_API_BASE_URL (must match backend PORT, default 5000). */
function devBackendOrigin() {
  const port = process.env.REACT_APP_BACKEND_PORT || "5000";
  if (typeof window !== "undefined" && window.location?.hostname) {
    return `http://${window.location.hostname}:${port}`;
  }
  return `http://127.0.0.1:${port}`;
}

function runtimeApiBase() {
  if (typeof window === "undefined") return null;
  const cfg = window.__APP_CONFIG__ || {};
  const raw =
    (typeof cfg.API_BASE_URL === "string" && cfg.API_BASE_URL) ||
    (typeof cfg.REACT_APP_API_BASE_URL === "string" && cfg.REACT_APP_API_BASE_URL) ||
    (typeof window.__API_BASE_URL__ === "string" && window.__API_BASE_URL__);
  if (!raw) return null;
  const trimmed = String(raw).trim();
  return trimmed ? trimmed : null;
}

/**
 * Resolves the admin API base for axios/fetch (absolute URL or path ending with `/api`).
 * In development without REACT_APP_API_BASE_URL, uses same-origin `/api` so CRA setupProxy.js
 * forwards to the real Express server — avoids calling localhost:PORT in the browser when another
 * app (not this backend) is bound to that port.
 */
export function getAdminApiBase() {
  let base = runtimeApiBase() || process.env.REACT_APP_API_BASE_URL;
  if (!base) {
    if (process.env.NODE_ENV === "development") {
      base = "/api";
    } else {
      base = "https://mankathaspi.octosofttechnologies.in/api";
    }
  }
  base = base.replace(/\/$/, "");
  if (/^https?:\/\/[^/]+$/i.test(base)) {
    base = `${base}/api`;
  }
  /** Relative bases must start with `/` or axios resolves under the current path (e.g. /adminpanel/…). */
  if (!/^https?:\/\//i.test(base) && base.charAt(0) !== "/") {
    base = `/${base}`;
  }
  return base;
}

/** Origin for `/uploads/...` and other non-proxied static paths from the Express server. */
export function getBackendOrigin() {
  const raw = runtimeApiBase() || process.env.REACT_APP_API_BASE_URL;
  if (raw && /^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw.replace(/\/$/, ""));
      const path = u.pathname.replace(/\/$/, "") || "/";
      if (path === "/api" || path.endsWith("/api")) {
        u.pathname = "";
        return u.origin;
      }
      return u.origin;
    } catch {
      return "https://mankathaspi.octosofttechnologies.in";
    }
  }
  if (process.env.NODE_ENV === "development") return devBackendOrigin();
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}
