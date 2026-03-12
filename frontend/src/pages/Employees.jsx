/**
 * Employees page
 * ──────────────
 * GET (fetchEmployees)  → PageLoader skeleton → InlineError on failure. No toasts.
 * POST (create)         → toast.success on success, serverError inside modal on failure.
 * DELETE                → toast.success on success, toast.error on failure (user-triggered).
 */
import { useState, useEffect, useCallback } from "react";
import { employeeAPI } from "../services/api";
import { useToast } from "../hooks/useToast";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeList from "../components/EmployeeList";
import Modal from "../components/Modal";
import PageLoader from "../components/PageLoader";
import InlineError from "../components/InlineError";

export default function Employees() {
  const toast = useToast();

  const [employees, setEmployees]         = useState([]);
  const [filtered,  setFiltered]          = useState([]);
  const [search,    setSearch]            = useState("");
  const [listLoading, setListLoading]     = useState(true);
  const [fetchError,  setFetchError]      = useState(null);
  const [formLoading, setFormLoading]     = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [serverError, setServerError]     = useState(null);
  const [showModal,   setShowModal]       = useState(false);
  const [refreshing,  setRefreshing]      = useState(false);

  /* ── Fetch (no toast on error) ── */
  const fetchEmployees = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else        setListLoading(true);
    setFetchError(null);
    try {
      const data = await employeeAPI.getAll();
      setEmployees(data);
      setFiltered(data);
    } catch (e) {
      // Store error for inline display — do NOT fire a toast
      setFetchError(e.message);
    } finally {
      setListLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  /* ── Search filter ── */
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      employees.filter(e =>
        e.full_name?.toLowerCase().includes(q) ||
        e.employee_id?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q)
      )
    );
  }, [search, employees]);

  /* ── Create (user-triggered → toast on success, inline error on failure) ── */
  const handleCreate = async (formData) => {
    setFormLoading(true);
    setServerError(null);
    try {
      await employeeAPI.create(formData);
      await fetchEmployees(true);
      setShowModal(false);
      toast.success("Employee added!", `${formData.full_name} has been added successfully.`);
      return true;
    } catch (e) {
      setServerError(e.message); // shown inside modal form
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  /* ── Delete (user-triggered → toast for both outcomes) ── */
  const handleDelete = async (employeeId) => {
    setDeleteLoading(employeeId);
    try {
      const emp = employees.find(e => e.employee_id === employeeId);
      await employeeAPI.delete(employeeId);
      setEmployees(prev => prev.filter(e => e.employee_id !== employeeId));
      toast.success("Employee removed", `${emp?.full_name || employeeId} has been deleted.`);
    } catch (e) {
      toast.error("Delete failed", e.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-sub">Manage your team members and their information.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setServerError(null); setShowModal(true); }}
          disabled={listLoading}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Employee
        </button>
      </div>

      {/* ── States: loading → error → data ── */}
      {listLoading ? (
        <PageLoader rows={5} />
      ) : fetchError ? (
        <InlineError
          title="Could not load employees"
          message={fetchError}
          onRetry={fetchEmployees}
        />
      ) : (
        <div className="section-card">
          <div className="table-toolbar">
            <div className="search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="search-input"
                placeholder="Search by name, ID, department, email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search employees"
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch("")} aria-label="Clear search">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
              <span className="table-count">
                {filtered.length} {filtered.length === 1 ? "employee" : "employees"}
              </span>
              <button
                className="icon-btn"
                onClick={() => fetchEmployees(true)}
                disabled={refreshing}
                title="Refresh"
                aria-label="Refresh employees"
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
          <EmployeeList
            employees={filtered}
            loading={false}
            onDelete={handleDelete}
            deleteLoading={deleteLoading}
          />
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Employee"
        subtitle="Fill in the details below to create a new employee profile."
      >
        <EmployeeForm
          onSubmit={handleCreate}
          onCancel={() => setShowModal(false)}
          loading={formLoading}
          serverError={serverError}
        />
      </Modal>
    </div>
  );
}
