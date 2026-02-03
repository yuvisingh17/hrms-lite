import { useEffect, useState } from "react";
import { api } from "../api";
import StatusBadge from "../components/StatusBadge";

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);

  const [form, setForm] = useState({
    employeeId: "",
    date: "",
    status: "Present"
  });

  const [loading, setLoading] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // load employees once
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await api.get("/employees");
        setEmployees(res.data);
      } catch {
        setError("Failed to load employees");
      }
    };

    loadEmployees();
  }, []);

  // selected employee object
  const selectedEmployee = employees.find(
    (e) => e.employeeId === form.employeeId
  );

  // load attendance
  const loadAttendance = async (id) => {
    if (!id) return;

    try {
      setLoadingRecords(true);

      const res = await api.get(`/attendance/${id}`);

      const sorted = res.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setRecords(sorted);
    } catch {
      setError("Failed to load attendance");
    } finally {
      setLoadingRecords(false);
    }
  };

  // submit attendance
  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.post("/attendance", form);

      setSuccess("Attendance recorded!");
      loadAttendance(form.employeeId);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to record attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Attendance</h2>

      {/* FORM */}
      <form onSubmit={submit}>
        <select
          value={form.employeeId}
          onChange={(e) => {
            const id = e.target.value;
            setForm({ ...form, employeeId: id });
            loadAttendance(id);
          }}
          required
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp.employeeId} value={emp.employeeId}>
              {emp.employeeId} — {emp.fullName}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
          required
        />

        <select
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value })
          }
        >
          <option>Present</option>
          <option>Absent</option>
        </select>

        <button disabled={loading}>
          {loading ? "Saving..." : "Mark Attendance"}
        </button>
      </form>

      {error && <div className="error-box">{error}</div>}
      {success && <div className="success-box">{success}</div>}

      <h3>Attendance Records</h3>

      {loadingRecords ? (
        <p className="loading">Loading records...</p>
      ) : records.length === 0 ? (
        <p className="empty">No records</p>
      ) : (
        <>
          {/* Employee summary card */}
          {selectedEmployee && (
            <div className="employee-summary">
              <div>
                <strong>{selectedEmployee.fullName}</strong>
                <p className="sub-id">
                  {selectedEmployee.employeeId}
                </p>
              </div>

              <div className="summary-stats">
                {records.length} records
              </div>
            </div>
          )}

          {/* Attendance table */}
          <table className="employee-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Employee</th>
              </tr>
            </thead>

            <tbody>
              {records.map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td>

                  <td>
                    <StatusBadge status={r.status} />
                  </td>

                  <td>
                    {selectedEmployee?.fullName}
                    <div className="sub-id">
                      {selectedEmployee?.employeeId}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
