import { useEffect, useState } from "react";
import { api } from "../api";

export default function EmployeeList({ employees, onDelete }) {

  if (employees.length === 0) {
    return <p className="empty">No employees added yet</p>;
  }

  return (
    <table className="employee-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Department</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {employees.map((e) => (
          <tr key={e.employeeId}>
            <td>{e.employeeId}</td>
            <td>{e.fullName}</td>
            <td>{e.email}</td>
            <td>{e.department}</td>
            <td>
              <button
                className="delete-btn"
                onClick={() => onDelete(e.employeeId)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
