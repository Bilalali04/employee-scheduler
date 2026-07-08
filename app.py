"""Streamlit frontend (v1, simplified): prove the scheduling backend works end to end.

Loads seeded stores/employees from MongoDB, lets the user pick a store, runs
the CP-SAT weekly schedule for it, and displays the result plus debug info
(peak window, required staffing per hour, weekly budget usage, solver status).
"""

import streamlit as st

from db.connection import get_db
from scheduler.generate_schedule import generate_weekly_schedule
from scheduler.peak_hours import detect_peak_window, is_peak_hour
from scheduler.staffing_rules import (
    get_eligible_employees,
    get_required_staffing,
    get_weekly_budget_range,
)

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _hour_label(hour):
    """Format a 24-hour value like 14 as a label like "2pm"."""
    if hour == 12:
        return "12pm"
    if hour > 12:
        return f"{hour - 12}pm"
    return f"{hour}am"


def _load_data():
    db = get_db()
    stores = sorted(db.stores.find({}, {"_id": 0}), key=lambda store: store["store_id"])
    employees = list(db.employees.find({}, {"_id": 0}))
    return stores, employees


def _store_label(store):
    return f"{store['store_id']} — {store['brand']}/{store['branch']} ({store['size_tier']})"


def _employee_column(employee):
    return f"{employee['name']} ({employee['employee_id'][-4:]})"


st.set_page_config(page_title="Employee Scheduler", layout="wide")
st.title("Employee Scheduler")
st.caption("v1 backend demo: MongoDB-seeded stores/employees -> CP-SAT weekly schedule.")

stores, employees = _load_data()

if not stores:
    st.warning("No stores found in MongoDB. Run `python -m db.seed_data` to seed data first.")
    st.stop()

selected_label = st.selectbox("Select a store", [_store_label(store) for store in stores])
store = next(s for s in stores if _store_label(s) == selected_label)
eligible_employees = get_eligible_employees(employees, store["branch"])

st.subheader(f"{store['store_id']} ({store['brand']}/{store['branch']}, {store['size_tier']})")
st.write(f"Eligible employees: {len(eligible_employees)}")

with st.spinner("Solving weekly schedule..."):
    result = generate_weekly_schedule(store, eligible_employees)

if result["status"] != "FEASIBLE":
    st.error(
        "No feasible schedule could be found for this store with its current "
        "eligible employees. Try a different store, or reseed the data with "
        "`python -m db.seed_data` for a different random roster."
    )
else:
    st.success("Feasible weekly schedule found.")

    st.write("### Weekly schedule (day x employee)")
    schedule_rows = []
    for day_index, day_name in enumerate(DAY_NAMES):
        assignments = result["schedule"][day_index]
        row = {"Day": day_name}
        for employee in eligible_employees:
            info = assignments.get(employee["employee_id"])
            if info:
                hours = info["hours"]
                row[_employee_column(employee)] = (
                    f"{_hour_label(hours[0])}-{_hour_label(hours[-1] + 1)}"
                )
            else:
                row[_employee_column(employee)] = ""
        schedule_rows.append(row)
    st.dataframe(schedule_rows, use_container_width=True)

    st.write("---")
    st.write("## Debug info")

    peak_window = detect_peak_window(store["hourly_sales"])
    st.write(
        "**Detected peak window:** "
        f"{_hour_label(peak_window['start_hour'])}-{_hour_label(peak_window['end_hour'] + 1)}"
    )

    required_rows = [
        {
            "Hour": _hour_label(hour),
            "Peak?": "Yes" if is_peak_hour(hour, peak_window) else "No",
            "Required staffing": get_required_staffing(store, is_peak_hour(hour, peak_window)),
        }
        for hour in result["hours"]
    ]
    st.write("**Required staffing per hour:**")
    st.dataframe(required_rows, use_container_width=True)

    budget_min, budget_max = get_weekly_budget_range(store)
    st.write(
        f"**Weekly budget range:** {budget_min}-{budget_max}h "
        f"&nbsp;&nbsp;**Total scheduled:** {result['total_weekly_hours']}h",
        unsafe_allow_html=True,
    )
    st.write(f"**Solver status:** {result['status']}")
