import { useState } from "react";

function Avatar({ name }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "??";
  const colors = ["#4f46e5","#0891b2","#059669","#d97706","#dc2626","#7c3aed","#db2777"];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div className="table-avatar" style={{ background: colors[idx] + "22", color: colors[idx] }}>
      {initials}
    </div>
  );
}

export default function EmployeeList({ employees, loading, onDelete, deleteLoading }) {
  const [confirm, setConfirm] = useState(null);

  const handleDelete = (id) => {
    if (confirm === id) { onDelete(id); setConfirm(null); }
    else { setConfirm(id); setTimeout(() => setConfirm(null), 3000); }
  };

  if (loading) return (
    <div className="table-state">
      {[1,2,3,4].map(i => <div key={i} className="skeleton-row"><div className="sk sk-avatar"/><div className="sk sk-text"/><div className="sk sk-text sk-sm"/><div className="sk sk-badge"/><div className="sk sk-text sk-xs"/></div>)}
    </div>
  );

  if (!employees.length) return (
    <div className="table-state table-state--empty">
      <div className="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c8d0e0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <p className="empty-title">No employees yet</p>
      <p className="empty-sub">Click "Add Employee" to get started</p>
    </div>
  );

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Email</th>
            <th>Department</th>
            <th>Joined</th>
            <th style={{ width: 80 }}></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.employee_id}>
              <td>
                <div className="table-employee-cell">
                  <Avatar name={emp.full_name} />
                  <div>
                    <p className="table-name">{emp.full_name}</p>
                    <p className="table-id">{emp.employee_id}</p>
                  </div>
                </div>
              </td>
              <td className="table-secondary">{emp.email}</td>
              <td><span className="dept-tag">{emp.department}</span></td>
              <td className="table-secondary">
                {emp.created_at ? new Date(emp.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—"}
              </td>
              <td>
                <button
                  className={`btn-delete ${confirm === emp.employee_id ? "btn-delete--confirm" : ""}`}
                  onClick={() => handleDelete(emp.employee_id)}
                  disabled={deleteLoading === emp.employee_id}
                  title={confirm === emp.employee_id ? "Click again to confirm" : "Delete employee"}
                >
                  {deleteLoading === emp.employee_id ? (
                    <span className="btn-spinner btn-spinner--sm" />
                  ) : confirm === emp.employee_id ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  )}
                  <span>{confirm === emp.employee_id ? "Confirm?" : "Delete"}</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
