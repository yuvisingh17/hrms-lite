/**
 * Attendance page
 * ───────────────
 * GET (init / fetchAll) → PageLoader → InlineError on failure. No toasts.
 * POST (mark)           → toast.success on success, serverError inside modal on failure.
 */
import { useState, useEffect, useCallback } from "react";
import { employeeAPI, attendanceAPI } from "../services/api";
import { useToast } from "../hooks/useToast";
import AttendanceForm from "../components/AttendanceForm";
import Modal from "../components/Modal";
import PageLoader from "../components/PageLoader";
import InlineError from "../components/InlineError";

export default function Attendance() {
  const toast = useToast();

  const [employees,   setEmployees]   = useState([]);
  const [records,     setRecords]     = useState([]);
  const [dateFilter,  setDateFilter]  = useState("");
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState(null);
  const [refreshing,  setRefreshing]  = useState(false);
  const [markLoading, setMarkLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [showModal,   setShowModal]   = useState(false);

  /* ── Fetch attendance for a known employee list (no toast) ── */
  const fetchAll = useCallback(async (empList, silent = false) => {
    if (silent) setRefreshing(true);
    setFetchError(null);
    try {
      const results = await Promise.all(
        empList.map(emp =>
          attendanceAPI.getByEmployee(emp.employee_id)
            .then(d => (d.records || []).map(r => ({ ...r, employee_name: emp.full_name })))
            .catch(() => [])  // individual employee fetch failures silently return []
        )
      );
      setRecords(results.flat().sort((a, b) => b.date.localeCompare(a.date)));
    } catch (e) {
      setFetchError(e.message); // inline only
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* ── Full init: employees first, then attendance (no toasts) ── */
  const init = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const emps = await employeeAPI.getAll();
      setEmployees(emps);
      if (emps.length) {
        await fetchAll(emps, true);
      } else {
        setLoading(false);
      }
    } catch (e) {
      setFetchError(e.message); // inline only — no toast
      setLoading(false);
    }
  }, [fetchAll]);

  useEffect(() => { init(); }, [init]);

  /* ── Mark attendance (user-triggered → toast) ── */
  const handleMark = async (formData) => {
    setMarkLoading(true);
    setServerError(null);
    try {
      const emp = employees.find(e => e.employee_id === formData.employee_id);
      await attendanceAPI.mark(formData);
      setShowModal(false);
      await fetchAll(employees, true);
      toast.success(
        "Attendance recorded!",
        `${emp?.full_name || formData.employee_id} marked ${formData.status} on ${formData.date}.`
      );
      return true;
    } catch (e) {
      setServerError(e.message); // shown inside modal
      return false;
    } finally {
      setMarkLoading(false);
    }
  };

  const displayed     = dateFilter ? records.filter(r => r.date === dateFilter) : records;
  const presentCount  = displayed.filter(r => r.status === "Present").length;
  const absentCount   = displayed.filter(r => r.status === "Absent").length;
  const getEmpName    = (id) => employees.find(e => e.employee_id === id)?.full_name || id;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-sub">Track and record daily employee presence.</p>
        </div>
        <button
          className="btn-green"
          onClick={() => { setServerError(null); setShowModal(true); }}
          disabled={loading}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <path d="M9 16l2 2 4-4"/>
          </svg>
          Mark Attendance
        </button>
      </div>

      {/* ── States ── */}
      {loading ? (
        <PageLoader rows={6} />
      ) : fetchError ? (
        <InlineError
          title="Could not load attendance"
          message={fetchError}
          onRetry={init}
        />
      ) : (
        <>
          {/* Summary pills */}
          {displayed.length > 0 && (
            <div className="att-summary">
              <div className="att-pill att-pill--present">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <strong>{presentCount}</strong> Present
              </div>
              <div className="att-pill att-pill--absent">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                <strong>{absentCount}</strong> Absent
              </div>
              <div className="att-pill att-pill--total">
                <strong>{displayed.length}</strong> Total Records
              </div>
              {dateFilter && (
                <span className="att-pill-date">
                  Filtered: {new Date(dateFilter + "T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                </span>
              )}
            </div>
          )}

          <div className="section-card">
            <div className="table-toolbar">
              <div className="date-picker-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="date-input"
                  aria-label="Filter by date"
                />
                {dateFilter && (
                  <button className="search-clear" onClick={() => setDateFilter("")}
                    title="Clear filter" aria-label="Clear date filter">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                <span className="table-count">{displayed.length} records</span>
                <button
                  className="icon-btn"
                  onClick={() => fetchAll(employees, true)}
                  disabled={refreshing}
                  title="Refresh"
                  aria-label="Refresh records"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.2" strokeLinecap="round"
                    style={{ animation: refreshing ? "spin .7s linear infinite" : "none" }}>
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="section-divider" />

            {displayed.length === 0 ? (
              <div className="table-state table-state--empty">
                <div className="empty-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c8d0e0"
                    strokeWidth="1.4" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <p className="empty-title">
                  {dateFilter ? "No records for this date" : "No attendance records yet"}
                </p>
                <p className="empty-sub">
                  {dateFilter
                    ? "Try a different date or clear the filter."
                    : "Start by marking attendance for your team."}
                </p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr><th>Date</th><th>Employee</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {displayed.map((r) => {
                    const name     = getEmpName(r.employee_id);
                    const initials = name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
                    const colors   = ["#4f46e5","#0891b2","#059669","#d97706","#dc2626","#7c3aed"];
                    const c        = colors[name.charCodeAt(0) % colors.length];
                    return (
                      <tr key={r.id || `${r.employee_id}-${r.date}`}>
                        <td>
                          <div className="date-cell">
                            <span className="date-main">
                              {new Date(r.date + "T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                            </span>
                            <span className="date-day">
                              {new Date(r.date + "T00:00:00").toLocaleDateString("en-US",{weekday:"long"})}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="table-employee-cell">
                            <div className="table-avatar" style={{background:c+"22",color:c}}>{initials}</div>
                            <div>
                              <p className="table-name">{name}</p>
                              <p className="table-id">{r.employee_id}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge status-badge--${r.status.toLowerCase()}`}>
                            {r.status === "Present"
                              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                              : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            }
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title="Mark Attendance" subtitle="Record daily attendance for a team member.">
        <AttendanceForm
          employees={employees}
          onSubmit={handleMark}
          onCancel={() => setShowModal(false)}
          loading={markLoading}
          serverError={serverError}
        />
      </Modal>
    </div>
  );
}
