"""FastAPI backend layer for the employee scheduler.

Exposes the existing Excel import and CP-SAT scheduling logic over HTTP so
the React frontend (frontend/) can call it directly. MongoDB remains the
backend's internal working store; Excel uploads are now processed on
demand via POST /upload, rather than only being read from the fixed
data/preset_data.xlsx preset file.
"""

import io

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from db.connection import get_db
from db.excel_import import import_stores_and_employees
from scheduler.generate_schedule import generate_weekly_schedule
from scheduler.peak_hours import detect_peak_window, is_peak_hour
from scheduler.staffing_rules import (
    get_eligible_employees,
    get_required_staffing,
    get_weekly_budget_range,
)

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

app = FastAPI(title="Employee Scheduler API")

# Permissive for local dev only, so a React dev server on a different port
# (e.g. Vite's 5173) can call this API. Tighten before any real deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _hour_label(hour):
    """Format a 24-hour value like 14 as a label like "2pm"."""
    if hour == 12:
        return "12pm"
    if hour > 12:
        return f"{hour - 12}pm"
    return f"{hour}am"


def _insert_into_mongo(stores, employees):
    db = get_db()
    db.stores.delete_many({})
    db.employees.delete_many({})
    db.stores.insert_many(stores)
    db.employees.insert_many(employees)


@app.post("/upload")
async def upload_excel(file: UploadFile = File(...)):
    """Import an uploaded Excel workbook (Stores/Employees/Hourly_Sales
    sheets) and load it into MongoDB, replacing any previous data."""
    contents = await file.read()

    try:
        stores, employees = import_stores_and_employees(io.BytesIO(contents))
    except Exception as exc:
        return JSONResponse(
            status_code=400,
            content={
                "stores_imported": 0,
                "employees_imported": 0,
                "errors": [str(exc)],
            },
        )

    _insert_into_mongo(stores, employees)

    return {
        "stores_imported": len(stores),
        "employees_imported": len(employees),
        "errors": [],
    }


@app.get("/stores")
def list_stores():
    """Return stores currently in MongoDB, for a store-selector dropdown."""
    db = get_db()
    stores = db.stores.find(
        {}, {"_id": 0, "store_id": 1, "brand": 1, "branch": 1, "size_tier": 1}
    )
    return list(stores)


@app.get("/schedule/{store_id}")
def get_schedule(store_id: str):
    """Run the weekly CP-SAT schedule for one store and return it as JSON."""
    db = get_db()
    store = db.stores.find_one({"store_id": store_id}, {"_id": 0})
    if store is None:
        raise HTTPException(status_code=404, detail=f"Store {store_id!r} not found")

    employees = list(db.employees.find({}, {"_id": 0}))
    eligible_employees = get_eligible_employees(employees, store["branch"])

    try:
        result = generate_weekly_schedule(store, eligible_employees)
        peak_window = detect_peak_window(store["hourly_sales"])
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Store {store_id!r} has no hourly sales data - check that "
                "Store_Code matches between the Stores and Hourly_Sales "
                "sheets in your upload."
            ),
        ) from exc

    budget_min, budget_max = get_weekly_budget_range(store)

    response = {
        "store_id": store_id,
        "status": result["status"],
        "peak_window": {
            "start_hour": peak_window["start_hour"],
            "end_hour": peak_window["end_hour"],
            "hours": peak_window["hours"],
            "start_label": _hour_label(peak_window["start_hour"]),
            "end_label": _hour_label(peak_window["end_hour"] + 1),
        },
        "weekly_budget_range": {"min": budget_min, "max": budget_max},
    }

    if result["status"] != "FEASIBLE":
        response["message"] = (
            "No feasible schedule could be found for this store with its "
            "current eligible employees."
        )
        return response

    response["required_staffing_per_hour"] = [
        {
            "hour": hour,
            "label": _hour_label(hour),
            "is_peak": is_peak_hour(hour, peak_window),
            "required_staffing": get_required_staffing(
                store, is_peak_hour(hour, peak_window)
            ),
        }
        for hour in result["hours"]
    ]
    response["total_weekly_hours"] = result["total_weekly_hours"]

    schedule_by_day = {}
    for day_index, day_name in enumerate(DAY_NAMES):
        assignments = result["schedule"][day_index]
        schedule_by_day[day_name] = [
            {
                "employee_id": employee_id,
                "name": info["name"],
                "employment_type": info["employment_type"],
                "hours": info["hours"],
                "start_label": _hour_label(info["hours"][0]),
                "end_label": _hour_label(info["hours"][-1] + 1),
            }
            for employee_id, info in assignments.items()
        ]
    response["schedule"] = schedule_by_day

    return response
