"""Schedule generation (v1 scope: feasibility only, no optimization objective).

Uses Google OR-Tools' CP-SAT solver to find any valid assignment of
employees to hours for a store's fixed operating hours - first for a
single day, then across a full week, then across every seeded store. Each
level only proves a feasible schedule exists (or reports infeasibility).

Pure logic only, no MongoDB access here - callers pass in store documents
and their eligible employees (e.g. from db/connection.py + staffing_rules.py).
"""

from itertools import combinations

from ortools.sat.python import cp_model

from config.settings import SHIFT_LENGTH_HOURS, STORE_CLOSE_HOUR, STORE_OPEN_HOUR
from scheduler.peak_hours import detect_peak_window, is_peak_hour
from scheduler.staffing_rules import get_required_staffing, get_weekly_budget_range

NUM_DAYS_PER_WEEK = 7


def _compute_hours_and_required_staffing(store):
    """Return the store's operating hours, peak hours, and per-hour minimums."""
    hours = list(range(STORE_OPEN_HOUR, STORE_CLOSE_HOUR))
    peak_window = detect_peak_window(store["hourly_sales"])
    peak_hours = [hour for hour in hours if is_peak_hour(hour, peak_window)]
    required_staffing = {
        hour: get_required_staffing(store, is_peak_hour(hour, peak_window))
        for hour in hours
    }
    return hours, peak_hours, required_staffing


def _add_daily_constraints(
    model, work_by_hour, hours, required_staffing, employees, day_label="0"
):
    """Add coverage, shift-length, and contiguity constraints for one day.

    work_by_hour maps employee_id -> hour -> BoolVar for a single day.
    day_label distinguishes variable names when called once per weekday.
    """
    for hour in hours:
        model.Add(
            sum(work_by_hour[employee["employee_id"]][hour] for employee in employees)
            >= required_staffing[hour]
        )

    for employee in employees:
        employee_id = employee["employee_id"]
        min_hours, max_hours = SHIFT_LENGTH_HOURS[employee["employment_type"]]
        work = work_by_hour[employee_id]

        daily_total = model.NewIntVar(
            0, len(hours), f"daily_total_{employee_id}_{day_label}"
        )
        model.Add(daily_total == sum(work[hour] for hour in hours))

        # Either the employee doesn't work at all, or their total falls
        # within their FT/PT shift-length range.
        works_that_day = model.NewBoolVar(f"works_{employee_id}_{day_label}")
        model.Add(daily_total == 0).OnlyEnforceIf(works_that_day.Not())
        model.Add(daily_total >= min_hours).OnlyEnforceIf(works_that_day)
        model.Add(daily_total <= max_hours).OnlyEnforceIf(works_that_day)

        # Contiguity: forbid any 1-0-1 pattern across three hours, which
        # rules out more than one block of working hours in the day.
        for hour_a, hour_b, hour_c in combinations(hours, 3):
            model.AddBoolOr(
                [work[hour_a].Not(), work[hour_b], work[hour_c].Not()]
            )


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
    hours, peak_hours, required_staffing = _compute_hours_and_required_staffing(store)

    model = cp_model.CpModel()

    # work[employee_id][hour] = 1 if that employee is scheduled that hour.
    work = {
        employee["employee_id"]: {
            hour: model.NewBoolVar(f"work_{employee['employee_id']}_{hour}")
            for hour in hours
        }
        for employee in eligible_employees
    }

    _add_daily_constraints(model, work, hours, required_staffing, eligible_employees)

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


def generate_weekly_schedule(store, employees):
    """Solve for a feasible full-week schedule for one store.

    Builds on the same coverage, shift-length, and contiguity constraints
    as generate_daily_schedule, applied independently for each of the 7
    days of the week, plus one additional constraint: the store's total
    hours across the whole week (summed over every employee and every day)
    must fall within get_weekly_budget_range(store) - a store-level budget,
    not a per-employee one. Employees may work different hours on
    different days and are not required to work every day.

    Args:
        store: store document with mfc_minimum, size_tier, hourly_sales.
        employees: employee documents eligible to work this store.

    Returns:
        dict with "status" ("FEASIBLE" or "INFEASIBLE") and, when feasible,
        "hours", "peak_hours", "weekly_budget_range", "total_weekly_hours",
        and "schedule" (day index 0-6 -> assignments dict, same shape as
        generate_daily_schedule's "assignments").
    """
    hours, peak_hours, required_staffing = _compute_hours_and_required_staffing(store)
    days = list(range(NUM_DAYS_PER_WEEK))
    min_budget, max_budget = get_weekly_budget_range(store)

    model = cp_model.CpModel()

    # work[employee_id][day][hour] = 1 if that employee is scheduled then.
    work = {
        employee["employee_id"]: {
            day: {
                hour: model.NewBoolVar(f"work_{employee['employee_id']}_{day}_{hour}")
                for hour in hours
            }
            for day in days
        }
        for employee in employees
    }

    for day in days:
        work_by_hour = {
            employee["employee_id"]: work[employee["employee_id"]][day]
            for employee in employees
        }
        _add_daily_constraints(
            model, work_by_hour, hours, required_staffing, employees, day_label=str(day)
        )

    # Store-level weekly budget: total hours across every employee and day.
    max_possible_hours = len(employees) * len(days) * len(hours)
    total_weekly_hours = model.NewIntVar(0, max_possible_hours, "total_weekly_hours")
    model.Add(
        total_weekly_hours
        == sum(
            work[employee["employee_id"]][day][hour]
            for employee in employees
            for day in days
            for hour in hours
        )
    )
    model.Add(total_weekly_hours >= min_budget)
    model.Add(total_weekly_hours <= max_budget)

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30.0
    status = solver.Solve(model)

    if status not in (cp_model.FEASIBLE, cp_model.OPTIMAL):
        return {"status": "INFEASIBLE"}

    schedule = {}
    for day in days:
        assignments = {}
        for employee in employees:
            employee_id = employee["employee_id"]
            worked_hours = [
                hour for hour in hours if solver.Value(work[employee_id][day][hour]) == 1
            ]
            if worked_hours:
                assignments[employee_id] = {
                    "name": employee["name"],
                    "employment_type": employee["employment_type"],
                    "hours": worked_hours,
                }
        schedule[day] = assignments

    return {
        "status": "FEASIBLE",
        "hours": hours,
        "peak_hours": peak_hours,
        "weekly_budget_range": (min_budget, max_budget),
        "total_weekly_hours": solver.Value(total_weekly_hours),
        "schedule": schedule,
    }


def generate_full_schedule(stores, employees_by_store):
    """Generate a weekly schedule for every store.

    Args:
        stores: list of store documents.
        employees_by_store: dict mapping store_id to that store's eligible
            employee documents (e.g. from staffing_rules.get_eligible_employees).

    Returns:
        dict mapping store_id -> the result of generate_weekly_schedule for
        that store.
    """
    return {
        store["store_id"]: generate_weekly_schedule(
            store, employees_by_store.get(store["store_id"], [])
        )
        for store in stores
    }
