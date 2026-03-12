# HRMS Lite — Human Resource Management System

A production-quality, full-stack HRMS application built with FastAPI, React (Vite), and MongoDB Atlas.

---

Live Demo

# Frontend (Vercel)

https://hrms-lite-git-main-yuvisingh17s-projects.vercel.app

# Backend API (Render)

https://hrms-lite-q0ay.onrender.com

# API Documentation

https://hrms-lite-q0ay.onrender.com/docs

# Important Note

The backend is deployed on Render's free tier, which automatically spins down inactive services.

Because of this, the first request may take ~30–50 seconds while the server wakes up.
The frontend includes loading indicators and graceful error handling to manage this delay smoothly.

Subsequent requests will respond normally once the server is active.

## Overview

HRMS Lite provides essential HR functionality: employee management and attendance tracking, with a clean dashboard summary. Designed for clarity, modularity, and reliability.

Employee management

Attendance tracking

Dashboard analytics

Clean and responsive UI

The project follows a layered architecture separating routing, services, and database logic for maintainability and scalability.

---

## Tech Stack

| Layer      | Technology                             |
| ---------- | -------------------------------------- |
| Frontend   | React 18, Vite, React Router, Axios    |
| Backend    | Python 3.11+, FastAPI, Pydantic v2     |
| Database   | MongoDB Atlas (via Motor async driver) |
| Deployment | Vercel (frontend), Render (backend)    |

---

## Architecture

```
hrms-lite/
├── backend/
│   └── app/
│       ├── main.py              # FastAPI app + lifespan + dashboard route
│       ├── database.py          # MongoDB connection (Motor async)
│       ├── models/              # MongoDB document → Python dict transformers
│       │   ├── employee_model.py
│       │   └── attendance_model.py
│       ├── schemas/             # Pydantic request/response models
│       │   ├── employee_schema.py
│       │   └── attendance_schema.py
│       ├── routes/              # FastAPI routers
│       │   ├── employee_routes.py
│       │   └── attendance_routes.py
│       ├── services/            # Business logic layer
│       │   ├── employee_service.py
│       │   └── attendance_service.py
│       └── utils/
│           └── validators.py
└── frontend/
    └── src/
        ├── components/          # Reusable UI components
        │   ├── Navbar.jsx
        │   ├── EmployeeForm.jsx
        │   ├── EmployeeList.jsx
        │   ├── AttendanceForm.jsx
        │   └── AttendanceList.jsx
        ├── pages/               # Route-level page components
        │   ├── Dashboard.jsx
        │   ├── Employees.jsx
        │   └── Attendance.jsx
        ├── services/
        │   └── api.js           # Axios instance + all API calls
        ├── App.jsx
        ├── main.jsx
        └── index.css            # Global design system
```

---

## API Endpoints

| Method | Endpoint                    | Description                       |
| ------ | --------------------------- | --------------------------------- |
| GET    | `/`                         | Health check                      |
| GET    | `/dashboard`                | Summary stats                     |
| POST   | `/employees`                | Create employee                   |
| GET    | `/employees`                | List all employees                |
| DELETE | `/employees/{employee_id}`  | Delete employee                   |
| POST   | `/attendance`               | Mark attendance                   |
| GET    | `/attendance/{employee_id}` | Get attendance (with date filter) |

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB Atlas connection string

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
echo "MONGODB_URI=your_connection_string" > .env
echo "DATABASE_NAME=hrms_lite" >> .env

uvicorn app.main:app --reload
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

npm run dev
# App available at http://localhost:5173
```

---

## Deployment

### Backend → Render

1. Push `backend/` folder to GitHub
2. Create a new **Web Service** on Render
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   - `MONGODB_URI` = your Atlas connection string
   - `DATABASE_NAME` = `hrms_lite`

### Frontend → Vercel

1. Push `frontend/` folder to GitHub
2. Import project on Vercel
3. Framework preset: **Vite**
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g. `https://hrms-lite-api.onrender.com`)
5. Deploy — `vercel.json` handles SPA routing automatically

---

## Assumptions

- Authentication/authorization is out of scope (admin-only system assumed)
- `employee_id` is uppercase-normalized on input
- Deleting an employee also removes their attendance records (cascade)
- Duplicate attendance (same employee + same date) is rejected
- All dates use `YYYY-MM-DD` ISO format

# Possible Future Improvements

Authentication (JWT / OAuth)

Role-based access control

Employee leave management

Export reports (CSV / PDF)

WebSocket real-time updates
