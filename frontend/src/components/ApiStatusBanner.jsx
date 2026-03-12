/**
 * ApiStatusBanner
 * ───────────────
 * Listens to the Axios response interceptor for network-level failures
 * (no response object → server is truly unreachable).
 *
 * Shows a single, calm top banner. Auto-hides when a successful response
 * comes back (backend recovered). Never fires a toast.
 */
import { useState, useEffect } from "react";
import api from "../services/api";

export default function ApiStatusBanner() {
  const [offline, setOffline]     = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => {
        // A successful response means the server is back → clear banner
        setOffline(false);
        setDismissed(false);
        return res;
      },
      (err) => {
        // Only flag as offline when there is NO http response at all
        // (network error, CORS block, server not running)
        if (!err.response) setOffline(true);
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, []);

  if (!offline || dismissed) return null;

  return (
    <div className="api-banner" role="alert" aria-live="assertive">
      <div className="api-banner-inner">
        <div className="api-banner-dot" />
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>
          We're having trouble connecting to the server.
          Please check if the backend service is running on{" "}
          <code>https://hrms-lite-q0ay.onrender.com</code>.
        </span>
      </div>
      <button className="api-banner-close" onClick={() => setDismissed(true)} aria-label="Dismiss">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
