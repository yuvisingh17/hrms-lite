import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false, message: "" };

  static getDerivedStateFromError(err) {
    return { hasError: true, message: err?.message || "Something went wrong." };
  }

  componentDidCatch(err, info) {
    console.error("[ErrorBoundary]", err, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="error-boundary">
        <div className="eb-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e57373" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="eb-title">Something went wrong</h2>
        <p className="eb-msg">{this.state.message}</p>
        <button className="btn-primary" onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}>
          Reload page
        </button>
      </div>
    );
  }
}
