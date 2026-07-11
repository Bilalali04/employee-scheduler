# Employee Scheduler

A backend-first employee scheduling system. The backend is a FastAPI service
(`api/main.py`) with a React frontend (`frontend/`) that calls it directly.
Excel export (generating downloadable deliverables) and the full ADP-style
data schema are deferred to a later version.

## Domain rules (v1)

- Two independent brands, each with three branches: S (S1, S2, S3) and M (M1,
  M2, M3). Employees can only transfer between branches of the same brand.
- Store size tiers (independent of brand): small stores require a minimum of
  1 worker on the floor (MFC), big stores require a minimum of 2.
- During peak hours (the window of consecutive hours where most sales occur),
  minimum staffing is 2 employees regardless of the MFC baseline.
- Store hours are fixed at 10am-6pm for v1.
- Employees are hourly, full-time (6-8 hr shifts) or part-time (3-7 hr shifts).
- Weekly budget hours: small stores 80-100 hrs/week, big stores 120-170
  hrs/week.
- Lunch hour scheduling, Excel export, and the full ADP-style employee schema
  are explicitly out of scope for v1.

## Tech stack

- Python (backend), JavaScript/React (frontend)
- FastAPI (`api/main.py`), served via uvicorn
- React + Vite + Tailwind CSS (`frontend/`) - the primary UI
- MongoDB (via pymongo)
- Google OR-Tools CP-SAT solver (schedule generation)
- Excel (via pandas/openpyxl) - preset seed data or a user-uploaded workbook
- Synthetic seed data generated with Faker and random, not hand-written
  fixtures

## Project structure

```
employee-scheduler/
├── .env                          # local only, not checked in
├── config/settings.py            # domain constants (brands, MFC minimums,
│                                  # shift ranges, weekly budgets, store hours)
├── data/preset_data.xlsx          # source-of-truth preset seed data
├── data/generate_preset_data.py   # one-time generator that produced it
├── db/connection.py               # MongoDB connection (reads .env)
├── db/excel_import.py             # reads a workbook into store/employee docs
├── db/seed_data.py                # seeds MongoDB from Excel (default) or
│                                  # from freshly-generated random data (demo)
├── models/employee.py             # employee document schema + validation
├── models/store.py                # store document schema + validation
├── scheduler/peak_hours.py        # detects a store's peak hour window from
│                                  # its hourly sales data
├── scheduler/staffing_rules.py    # required staffing, brand-block eligible
│                                  # employees, weekly budget range
├── scheduler/generate_schedule.py # CP-SAT schedule generation (daily,
│                                  # weekly, all-store)
├── api/main.py                    # FastAPI app: upload, stores, schedule
├── frontend/                      # React + Vite + Tailwind UI
└── tests/test_scheduler.py        # placeholder, not yet implemented
```

## Setup

1. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate        # on Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the project root with your MongoDB credentials:
   ```
   MONGO_URI=<your connection string>
   MONGO_DB_NAME=<your database name>
   ```
4. Seed the database with synthetic stores, employees, and hourly sales data:
   ```
   python -m db.seed_data
   ```
   This also pings MongoDB first to confirm the connection works, then
   (re)populates the `stores` and `employees` collections.
5. Run the FastAPI backend:
   ```
   uvicorn api.main:app --port 8000
   ```
6. In a separate terminal, install and run the React frontend:
   ```
   cd frontend
   npm install
   npm run dev
   ```
   Open the printed local URL (e.g. `http://localhost:5173`). Upload an Excel
   workbook (or rely on data already seeded via `db.seed_data`), pick a store
   from the dropdown, and view its weekly schedule as a day x employee grid,
   with a collapsible debug panel (detected peak window, required staffing
   per hour, weekly budget usage, and solver status).

## Scheduling approach

`scheduler/generate_schedule.py` builds a CP-SAT (constraint satisfaction)
model with Google OR-Tools - a feasibility model only, with no optimization
objective yet. For a given store and its brand-eligible employees, it creates
one boolean decision variable per employee per hour (per day, for the weekly
model) and enforces:

- **Coverage**: enough employees working each hour to meet the store's MFC
  minimum, bumped to 2 during the detected peak window
  (`scheduler/peak_hours.py`).
- **Shift length**: each employee's daily hours are either 0 (not working
  that day) or within their FT (6-8h) / PT (3-7h) range.
- **Contiguity**: an employee's working hours in a day form a single
  unbroken block, not scattered hours.
- **Weekly budget** (weekly model only): total hours across all employees
  and all 7 days fall within the store's weekly budget range (80-100h for
  small stores, 120-170h for big stores).

The solver returns a structured schedule (or a clear `INFEASIBLE` result) -
`generate_daily_schedule` for one store/one day, `generate_weekly_schedule`
for one store/one week, and `generate_full_schedule` for every seeded store.

## Status

Backend is functional end-to-end: domain models, Excel-based seed data (with
a random-generation demo mode), peak-hour detection, staffing rules, and
CP-SAT-based schedule generation (daily, weekly, and across all stores) are
all implemented, exposed over a FastAPI backend and consumed by a React
frontend (upload a roster, pick a store, view its weekly schedule). Not yet
implemented: an optimization objective for schedule generation (currently
feasibility only), automated tests, lunch hour scheduling, Excel export, and
the full ADP-style employee schema (the last three are explicitly deferred
to a later version per the domain rules above).
