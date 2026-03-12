/**
 * InlineError
 * ───────────
 * Calm, non-intrusive error state shown inside the page when a
 * background GET request fails. No toasts. Just a friendly message
 * and a Retry button.
 */

const MESSAGES = {
  network: "We're having trouble connecting to the server. Please check if the backend service is running.",
  default: "Unable to load data right now. Please try again later.",
};

function isNetworkError(msg = "") {
  return (
    msg.toLowerCase().includes("network") ||
    msg.toLowerCase().includes("timeout") ||
    msg.toLowerCase().includes("econnrefused") ||
    msg.toLowerCase().includes("failed to fetch") ||
    msg === "Network Error"
  );
}

export default function InlineError({ message, onRetry, title }) {
  const friendly = isNetworkError(message) ? MESSAGES.network : MESSAGES.default;

  return (
    <div className="inline-error" role="alert">
      <div className="ie-icon-wrap">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div className="ie-body">
        <p className="ie-title">{title || "Something went wrong"}</p>
        <p className="ie-msg">{friendly}</p>
      </div>
      {onRetry && (
        <button className="ie-retry" onClick={onRetry}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Try again
        </button>
      )}
    </div>
  );
}
