from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import employees, attendance

app = FastAPI()

# CORS (important for React frontend)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router)
app.include_router(attendance.router)

@app.get("/")
def root():
    return {"message": "HRMS Lite Backend Running"}
