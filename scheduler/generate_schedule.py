"""Schedule generation (v1 scope: single store, single day, feasibility only).

Uses Google OR-Tools' CP-SAT solver to find any valid assignment of
employees to hours for one store's fixed operating hours. No optimization
objective yet - this only proves a feasible schedule exists (or reports
infeasibility). Multi-day / multi-store scheduling is deferred.

Pure logic only, no MongoDB access here - callers pass in a store document
and its eligible employees (e.g. from db/connection.py + staffing_rules.py).
"""

from itertools import combinations

from ortools.sat.python import cp_model

from config.settings import SHIFT_LENGTH_HOURS, STORE_CLOSE_HOUR, STORE_OPEN_HOUR
from scheduler.peak_hours import detect_peak_window, is_peak_hour
from scheduler.staffing_rules import get_required_staffing


def generate_daily_schedule(store, eligible_employees):
    """Solve for a feasible single-day schedule for one store.

    Args:
        store: store document with mfc_minimum, size_tier, hourly_sales.
        eligible_employees: employee documents allowed to work this store
            (e.g. from staffing_rules.get_eligible_employees).

    Returns:
        dict with "status" ("FEASIBLE" or "INFEASIBLE") and, when feasible,
        "hours" (the store's operating hours), "peak_hours" (hours flagged
        as peak), and "assignments" (employee_id -> {"name",
        "employment_type", "hours": [worked hours]}) for employees who were
        scheduled to work.
    """
    hours = list(range(STORE_OPEN_HOUR, STORE_CLOSE_HOUR))
    peak_window = detect_peak_window(store["hourly_sales"])
    peak_hours = [hour for hour in hours if is_peak_hour(hour, peak_window)]
    required_staffing = {
        hour: get_required_staffing(store, is_peak_hour(hour, peak_window))
        for hour in hours
    }

    model = cp_model.CpModel()

    # work[employee_id][hour] = 1 if that employee is scheduled that hour.
    work = {
        employee["employee_id"]: {
            hour: model.NewBoolVar(f"work_{employee['employee_id']}_{hour}")
            for hour in hours
        }
        for employee in eligible_employees
    }

    # Coverage: enough employees working each hour, more during peak hours.
    for hour in hours:
        model.Add(
            sum(work[employee["employee_id"]][hour] for employee in eligible_employees)
            >= required_staffing[hour]
        )

    for employee in eligible_employees:
        employee_id = employee["employee_id"]
        min_hours, max_hours = SHIFT_LENGTH_HOURS[employee["employment_type"]]

        total_hours = model.NewIntVar(0, len(hours), f"total_hours_{employee_id}")
        model.Add(total_hours == sum(work[employee_id][hour] for hour in hours))

        # Either the employee doesn't work at all, or their total falls
        # within their FT/PT shift-length range.
        works_today = model.NewBoolVar(f"works_today_{employee_id}")
        model.Add(total_hours == 0).OnlyEnforceIf(works_today.Not())
        model.Add(total_hours >= min_hours).OnlyEnforceIf(works_today)
        model.Add(total_hours <= max_hours).OnlyEnforceIf(works_today)

        # Contiguity: forbid any 1-0-1 pattern across three hours, which
        # rules out more than one block of working hours in the day.
        for hour_a, hour_b, hour_c in combinations(hours, 3):
            model.AddBoolOr(
                [
                    work[employee_id][hour_a].Not(),
                    work[employee_id][hour_b],
                    work[employee_id][hour_c].Not(),
                ]
            )

    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status not in (cp_model.FEASIBLE, cp_model.OPTIMAL):
        return {"status": "INFEASIBLE"}

    assignments = {}
    for employee in eligible_employees:
        employee_id = employee["employee_id"]
        worked_hours = [
            hour for hour in hours if solver.Value(work[employee_id][hour]) == 1
        ]
        if worked_hours:
            assignments[employee_id] = {
                "name": employee["name"],
                "employment_type": employee["employment_type"],
                "hours": worked_hours,
            }

    return {
        "status": "FEASIBLE",
        "hours": hours,
        "peak_hours": peak_hours,
        "assignments": assignments,
    }
