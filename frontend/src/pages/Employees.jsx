import { useEffect, useState } from "react";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeList from "../components/EmployeeList";
import { api } from "../api";



export default function Employees() {
    const [employees, setEmployees] = useState([]);
    console.log(employees);

  
    const loadEmployees = async () => {
      const res = await api.get("/employees");
      setEmployees(res.data);
    };
  
    useEffect(() => {
      loadEmployees();
    }, []);
  
    const deleteEmployee = async (id) => {
      await api.delete(`/employees/${id}`);
      loadEmployees();
    };
  
    return (
      <div className="container">
        <h1>Employee Management</h1>
  
        <EmployeeForm onCreated={loadEmployees} />
  
        <EmployeeList
          employees={employees}
          onDelete={deleteEmployee}
        />
      </div>
    );
  }
  