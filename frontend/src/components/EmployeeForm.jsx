import { useState } from "react";

const DEPARTMENTS = [
  "Engineering","Product","Design","Marketing",
  "Sales","Finance","HR","Operations","Legal",
];
const INIT = { employee_id: "", full_name: "", email: "", department: "" };

export default function EmployeeForm({ onSubmit, onCancel, loading, serverError }) {
  const [form, setForm] = useState(INIT);
  const [errs, setErrs] = useState({});

  const validate = () => {
    const e = {};
    if (!form.employee_id.trim()) e.employee_id = "Employee ID is required";
    else if (!/^[A-Za-z0-9_-]+$/.test(form.employee_id.trim())) e.employee_id = "Only letters, digits, hyphens, underscores";
    if (!form.full_name.trim() || form.full_name.trim().length < 2) e.full_name = "Full name is required (min 2 chars)";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.department) e.department = "Please select a department";
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
    if (ok) { setForm(INIT); setErrs({}); }
  };

  return (
    <form onSubmit={submit} noValidate>
      {serverError && (
        <div className="form-server-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {serverError}
        </div>
      )}

      <div className="form-grid-2">
        <div className="field">
          <label className="field-label">Employee ID <span className="req">*</span></label>
          <input name="employee_id" value={form.employee_id} onChange={change}
            placeholder="e.g. EMP-001" className={errs.employee_id ? "field-input field-input--err" : "field-input"} />
          {errs.employee_id && <span className="field-err">{errs.employee_id}</span>}
        </div>
        <div className="field">
          <label className="field-label">Full Name <span className="req">*</span></label>
          <input name="full_name" value={form.full_name} onChange={change}
            placeholder="e.g. Jane Doe" className={errs.full_name ? "field-input field-input--err" : "field-input"} />
          {errs.full_name && <span className="field-err">{errs.full_name}</span>}
        </div>
      </div>

      <div className="form-grid-2">
        <div className="field">
          <label className="field-label">Email Address <span className="req">*</span></label>
          <input name="email" type="email" value={form.email} onChange={change}
            placeholder="jane@company.com" className={errs.email ? "field-input field-input--err" : "field-input"} />
          {errs.email && <span className="field-err">{errs.email}</span>}
        </div>
        <div className="field">
          <label className="field-label">Department <span className="req">*</span></label>
          <div className="select-wrap">
            <select name="department" value={form.department} onChange={change}
              className={errs.department ? "field-input field-input--err" : "field-input"}>
              <option value="">Select department…</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <svg className="select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {errs.department && <span className="field-err">{errs.department}</span>}
        </div>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn-ghost" onClick={() => { setForm(INIT); setErrs({}); onCancel(); }}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <span className="btn-spinner" /> : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save Employee
            </>
          )}
        </button>
      </div>
    </form>
  );
}
