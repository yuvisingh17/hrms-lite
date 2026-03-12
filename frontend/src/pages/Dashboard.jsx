/**
 * Dashboard
 * ─────────
 * GET errors  → inline states inside cards / table section. No toasts.
 * No mutations on this page, so no toasts needed at all.
 */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { dashboardAPI } from "../services/api";
import InlineError from "../components/InlineError";

/* ── Sparkline ──────────────────────────────────────────────── */
function Sparkline({ bars, color }) {
  return (
    <div className="sparkline">
      {bars.map((h, i) => (
        <div key={i} className="spark-bar"
          style={{ height: `${h}%`, background: color, animationDelay: `${i * 55}ms` }}
        />
      ))}
    </div>
  );
}

/* ── Card configs ────────────────────────────────────────────── */
const CARD_CONFIGS = [
  {
    key: "total_employees", label: "TOTAL EMPLOYEES", badge: "↑ Active",
    gradient: "linear-gradient(140deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    glowColor: "rgba(99,102,241,0.55)", sparkBars: [30,55,42,78,51,88,67,95,58,82],
    sparkColor: "rgba(165,180,252,0.7)",
    bottomGrad: "linear-gradient(90deg, #818cf8, #c7d2fe, #818cf8)",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    key: "present_today", label: "PRESENT TODAY", badge: "● Live",
    gradient: "linear-gradient(140deg, #0a2e1e 0%, #064e3b 50%, #065f46 100%)",
    glowColor: "rgba(16,185,129,0.55)", sparkBars: [45,60,38,72,55,84,62,91,70,88],
    sparkColor: "rgba(110,231,183,0.7)",
    bottomGrad: "linear-gradient(90deg, #34d399, #a7f3d0, #34d399)",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  {
    key: "total_attendance_records", label: "TOTAL RECORDS", badge: "All Time",
    gradient: "linear-gradient(140deg, #2d0845 0%, #5b21b6 50%, #7c3aed 100%)",
    glowColor: "rgba(168,85,247,0.55)", sparkBars: [35,58,44,80,53,86,64,90,60,78],
    sparkColor: "rgba(216,180,254,0.7)",
    bottomGrad: "linear-gradient(90deg, #c084fc, #f0abfc, #c084fc)",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
      </svg>
    ),
  },
];

/* ── Stat card — shows skeleton OR error dash OR real value ─── */
function StatCard({ config, value, loading, hasError }) {
  return (
    <div className="sc" style={{ background: config.gradient }}>
      <div className="sc-glow-tr" style={{ background: `radial-gradient(circle at center, ${config.glowColor}, transparent 65%)` }} />
      <div className="sc-glow-bl" style={{ background: `radial-gradient(circle at center, ${config.glowColor.replace("0.55","0.3")}, transparent 65%)` }} />
      <div className="sc-noise" />
      <div className="sc-top">
        <div className="sc-icon-box"><span className="sc-icon-inner">{config.icon}</span></div>
        <span className="sc-badge">{config.badge}</span>
      </div>
      <div className="sc-number">
        {loading   ? <span className="sc-skel" /> :
         hasError  ? <span className="sc-dash">—</span> :
                     (value ?? 0)}
      </div>
      <p className="sc-lbl">{config.label}</p>
      {!hasError && <Sparkline bars={config.sparkBars} color={config.sparkColor} />}
      <div className="sc-bottom-bar" style={{ background: config.bottomGrad }} />
    </div>
  );
}

/* ── Quick action tile ─────────────────────────────────────── */
function QuickAction({ to, icon, label, sub, accentColor }) {
  return (
    <Link to={to} className="qa-card" style={{ "--ac": accentColor }}>
      <div className="qa-icon-box" style={{ background: accentColor + "18", color: accentColor }}>{icon}</div>
      <div className="qa-body"><p className="qa-title">{label}</p><p className="qa-sub">{sub}</p></div>
      <div className="qa-chevron" style={{ color: accentColor }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </Link>
  );
}

/* ── Dashboard ─────────────────────────────────────────────── */
export default function Dashboard() {
  const [stats, setStats]         = useState(null);
  const [recent, setRecent]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statsError, setStatsError] = useState(false);
  const [recentError, setRecentError] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    // Reset errors on each attempt
    setStatsError(false);
    setRecentError(false);

    // Fetch both independently so one failure doesn't blank the other
    const [statsResult, recentResult] = await Promise.allSettled([
      dashboardAPI.getStats(),
      dashboardAPI.getRecentEmployees(),
    ]);

    if (statsResult.status === "fulfilled") {
      setStats(statsResult.value);
    } else {
      setStatsError(true);
    }

    if (recentResult.status === "fulfilled") {
      setRecent(recentResult.value);
    } else {
      setRecentError(true);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="page">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <p className="page-greeting">{greeting}, Admin 👋</p>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-sub">Here's what's happening with your team today.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
          <button
            className="icon-btn"
            onClick={() => loadData(true)}
            disabled={refreshing}
            title="Refresh dashboard"
            aria-label="Refresh dashboard"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round"
              style={{ animation: refreshing ? "spin .7s linear infinite" : "none" }}>
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
          <div className="header-date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" })}
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="stat-grid">
        {CARD_CONFIGS.map(cfg => (
          <StatCard
            key={cfg.key}
            config={cfg}
            value={stats?.[cfg.key]}
            loading={loading}
            hasError={statsError}
          />
        ))}
      </div>

      {/* Single inline error under cards if stats failed */}
      {statsError && !loading && (
        <InlineError
          title="Dashboard stats unavailable"
          onRetry={() => loadData(true)}
        />
      )}

      {/* ── Quick actions ── */}
      <div className="qa-row">
        <QuickAction to="/employees" accentColor="#6366f1"
          label="Manage Employees" sub="Add, view or remove team members"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>}
        />
        <QuickAction to="/attendance" accentColor="#059669"
          label="Mark Attendance" sub="Record today's team presence"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>}
        />
        <QuickAction to="/attendance" accentColor="#d97706"
          label="View Reports" sub="Browse attendance history"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
        />
      </div>

      {/* ── Recently Added Employees ── */}
      <div className="section-card">
        <div className="section-card-header">
          <div>
            <h2 className="section-title">Recently Added Employees</h2>
            <p className="section-sub">Latest team members added to the system</p>
          </div>
          <Link to="/employees" className="btn-outline-sm">
            View all
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
        <div className="section-divider" />

        {loading ? (
          <div className="p-6">
            {[1,2,3].map(i => (
              <div key={i} className="skeleton-row mb-3">
                <div className="sk sk-avatar"/><div className="sk sk-text"/><div className="sk sk-badge"/>
              </div>
            ))}
          </div>
        ) : recentError ? (
          <div className="p-6">
            <InlineError
              title="Couldn't load recent employees"
              onRetry={() => loadData(true)}
            />
          </div>
        ) : recent.length === 0 ? (
          <div className="table-state table-state--empty" style={{ padding: "3rem" }}>
            <p className="empty-sub">No employees have been added yet.</p>
          </div>
        ) : (
          <table className="table">
            <thead><tr><th>Employee</th><th>Email</th><th>Department</th><th>Joined</th></tr></thead>
            <tbody>
              {recent.map((emp) => {
                const initials = emp.full_name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
                const colors = ["#4f46e5","#0891b2","#059669","#d97706","#dc2626","#7c3aed"];
                const c = colors[emp.full_name?.charCodeAt(0) % colors.length];
                return (
                  <tr key={emp.employee_id}>
                    <td>
                      <div className="table-employee-cell">
                        <div className="table-avatar" style={{background:c+"22",color:c}}>{initials}</div>
                        <div><p className="table-name">{emp.full_name}</p><p className="table-id">{emp.employee_id}</p></div>
                      </div>
                    </td>
                    <td className="table-secondary">{emp.email}</td>
                    <td><span className="dept-tag">{emp.department}</span></td>
                    <td className="table-secondary">
                      {emp.created_at ? new Date(emp.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
