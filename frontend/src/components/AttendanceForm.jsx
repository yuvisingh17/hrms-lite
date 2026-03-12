import { useState } from "react";

const today = () => new Date().toISOString().split("T")[0];

export default function AttendanceForm({ employees, onSubmit, onCancel, loading, serverError }) {
  const [form, setForm] = useState({ employee_id: "", date: today(), status: "Present" });
  const [errs, setErrs] = useState({});

  const validate = () => {
    const e = {};
    if (!form.employee_id) e.employee_id = "Please select an employee";
    if (!form.date) e.date = "Date is required";
    return e;
  };

  const change = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrs((p) => ({ ...p, [name]: "" }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrs(v); return; }
    const ok = await onSubmit(form);
    if (ok) { setForm({ employee_id: "", date: today(), status: "Present" }); setErrs({}); }
  };

  return (
    <form onSubmit={submit} noValidate>
      {serverError && (
        <div className="form-server-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {serverError}
        </div>
      )}

      {/* Employee selector */}
      <div className="field">
        <label className="field-label">
          Employee <span className="req">*</span>
        </label>
        <div className="select-wrap">
          <select
            name="employee_id"
            value={form.employee_id}
            onChange={change}
            className={errs.employee_id ? "field-input field-input--err" : "field-input"}
          >
            <option value="">Select an employee…</option>
            {employees.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.full_name} — {emp.employee_id}
              </option>
            ))}
          </select>
          <svg className="select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        {errs.employee_id && <span className="field-err">{errs.employee_id}</span>}
        {!employees.length && (
          <span className="field-hint">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            No employees found. Add employees first.
          </span>
        )}
      </div>

      {/* Date + Status side by side */}
      <div className="form-grid-2">
        <div className="field">
          <label className="field-label">Date <span className="req">*</span></label>
          <div className="input-icon-wrap">
            <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={change}
              className={errs.date ? "field-input field-input--icon field-input--err" : "field-input field-input--icon"}
            />
          </div>
          {errs.date && <span className="field-err">{errs.date}</span>}
        </div>

        <div className="field">
          <label className="field-label">Status <span className="req">*</span></label>
          <div className="status-toggle">
            {["Present", "Absent"].map((s) => (
              <label key={s} className={`status-opt status-opt--${s.toLowerCase()} ${form.status === s ? "status-opt--active" : ""}`}>
                <input type="radio" name="status" value={s} checked={form.status === s} onChange={change} />
                <span className="status-dot" />
                {s}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn-ghost" onClick={() => { setForm({ employee_id: "", date: today(), status: "Present" }); setErrs({}); onCancel(); }}>
          Cancel
        </button>
        <button type="submit" className="btn-green" disabled={loading || !employees.length}>
          {loading ? <span className="btn-spinner" /> : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>
              Save Record
            </>
          )}
        </button>
      </div>
    </form>
  );
}
