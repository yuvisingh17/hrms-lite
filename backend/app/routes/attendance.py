# from fastapi import APIRouter, HTTPException
# from app.database import attendance_collection, employees_collection
# from app.models import Attendance
# from datetime import date

# router = APIRouter()


# # POST attendance
# @router.post("/attendance")
# def mark_attendance(record: Attendance):

#     # check employee exists
#     employee = employees_collection.find_one({
#         "employeeId": record.employeeId
#     })

#     if not employee:
#         raise HTTPException(404, "Employee not found")

#     # prevent duplicate attendance same day
#     existing = attendance_collection.find_one({
#         "employeeId": record.employeeId,
#         "date": record.date.isoformat()
#     })

#     if existing:
#         raise HTTPException(400, "Attendance already marked for this date")

#     data = {
#         "employeeId": record.employeeId,
#         "date": record.date.isoformat(),
#         "status": record.status
#     }

#     attendance_collection.insert_one(data)

#     return {"message": "Attendance recorded"}


# # GET attendance by employee
# @router.get("/attendance/{employeeId}")
# def get_attendance(employeeId: str):

#     records = list(
#         attendance_collection.find(
#             {"employeeId": employeeId},
#             {"_id": 0}
#         )
#     )

#     return records



from fastapi import APIRouter, HTTPException
from app.database import attendance_collection, employees_collection
from app.models import Attendance

router = APIRouter()


# POST attendance
@router.post("/attendance")
def mark_attendance(record: Attendance):

    # verify employee exists
    employee = employees_collection.find_one({
        "employeeId": record.employeeId
    })

    if not employee:
        raise HTTPException(404, "Employee not found")

    # prevent duplicate attendance
    existing = attendance_collection.find_one({
        "employeeId": record.employeeId,
        "date": record.date.isoformat()
    })

    if existing:
        raise HTTPException(400, "Attendance already marked")

    attendance_collection.insert_one({
        "employeeId": record.employeeId,
        "date": record.date.isoformat(),
        "status": record.status
    })

    return {"message": "Attendance recorded"}


# GET attendance per employee
@router.get("/attendance/{employeeId}")
def get_attendance(employeeId: str):

    records = list(
        attendance_collection.find(
            {"employeeId": employeeId},
            {"_id": 0}
        )
    )

    return records
