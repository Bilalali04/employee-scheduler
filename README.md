# Employee Scheduler

A backend-first employee scheduling system. v1 is scoped to the backend plus a
simplified Streamlit frontend that proves the backend works end to end. Excel
export and the full ADP-style data schema are deferred to a later version.

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

- Python
- MongoDB (via pymongo)
- Streamlit (v1 frontend)
- Synthetic seed data generated with Faker and random, not hand-written
  fixtures

## Project structure

```
employee-scheduler/
├── .env                        # local only, not checked in
├── config/settings.py          # domain constants
├── db/connection.py             # MongoDB connection (reads .env)
├── db/seed_data.py              # synthetic data (Faker + random)
├── models/employee.py
├── models/store.py
├── scheduler/peak_hours.py
├── scheduler/staffing_rules.py
├── scheduler/generate_schedule.py
├── app.py                      # Streamlit frontend
└── tests/test_scheduler.py
```

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
2. Create a `.env` file in the project root with your MongoDB credentials:
   ```
   MONGO_URI=<your connection string>
   MONGO_DB_NAME=<your database name>
   ```
3. Run the tests:
   ```
   pytest
   ```
4. Run the frontend:
   ```
   streamlit run app.py
   ```

## Status

Project skeleton only. Scheduling logic, seed data generation, and the
Streamlit UI are not yet implemented.
