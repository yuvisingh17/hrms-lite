from pydantic import BaseModel, EmailStr
from datetime import date

class Employee(BaseModel):
    fullName: str
    email: EmailStr
    department: str


class Attendance(BaseModel):
    employeeId: str
    date: date
    status: str

