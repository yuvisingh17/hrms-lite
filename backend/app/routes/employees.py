from fastapi import APIRouter, HTTPException
from app.database import employees_collection
from app.models import Employee
from bson import ObjectId

router = APIRouter()


# helper → generate EMP-001
def generate_employee_id():
    count = employees_collection.count_documents({})
    return f"EMP-{count + 1:03d}"


@router.post("/employees")
def create_employee(emp: Employee):
    data = emp.dict()

    data["employeeId"] = generate_employee_id()

    result = employees_collection.insert_one(data)

    return {
        "mongoId": str(result.inserted_id),  # internal id
        "employeeId": data["employeeId"],    # business id
        "fullName": data["fullName"],
        "email": data["email"],
        "department": data["department"],
    }


@router.get("/employees")
def get_employees():
    employees = []

    for emp in employees_collection.find():
        employees.append({
            "mongoId": str(emp["_id"]),
            "employeeId": emp["employeeId"],
            "fullName": emp["fullName"],
            "email": emp["email"],
            "department": emp["department"],
        })

    return employees



@router.delete("/employees/{id}")
def delete_employee(id: str):

    # try delete by Mongo ID
    try:
        result = employees_collection.delete_one({
            "_id": ObjectId(id)
        })

        if result.deleted_count > 0:
            return {"message": "Deleted by mongoId"}

    except:
        pass

    # fallback → delete by employeeId
    result = employees_collection.delete_one({
        "employeeId": id
    })

    if result.deleted_count == 0:
        raise HTTPException(404, "Employee not found")

    return {"message": "Deleted by employeeId"}

