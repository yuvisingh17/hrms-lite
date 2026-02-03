import { useState } from "react";
import { api } from "../api";

export default function EmployeeForm({ onCreated }) {
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        department: ""
      });
      
      const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

const submit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);
    setError("");
    setSuccess("");

    await api.post("/employees", form);

    setForm({
      employeeId: "",
      fullName: "",
      email: "",
      department: ""
    });

    setSuccess("Employee added!");
    onCreated();

  } catch (err) {
    if (err.response?.data?.detail) {
      setError(err.response.data.detail[0].msg);
    } else {
      setError("Failed to add employee");
    }
  } finally {
    setLoading(false);
  }
};


 
  return (
    <form onSubmit={submit}>
    <input
      placeholder="Full Name"
      value={form.fullName}
      onChange={(e) =>
        setForm({ ...form, fullName: e.target.value })
      }
    />
    <input
      placeholder="Email"
      value={form.email}
      onChange={(e) =>
        setForm({ ...form, email: e.target.value })
      }
    />
    <input
      placeholder="Department"
      value={form.department}
      onChange={(e) =>
        setForm({ ...form, department: e.target.value })
      }
    />
    <button>Add Employee</button>
    {loading && <p className="loading">Saving...</p>}
{error && <div className="error-box">{error}</div>}
{success && <div className="success-box">{success}</div>}

  </form>
  
  );
}
