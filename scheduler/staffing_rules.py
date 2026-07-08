"""Core staffing rule functions (v1 scope).

Pure logic only, no MongoDB access here - that stays in db/connection.py
and db/seed_data.py. Functions operate on store/employee documents as
already produced by models/store.py and models/employee.py.
"""

from config.settings import BRANDS, PEAK_HOUR_MINIMUM_STAFF, WEEKLY_BUDGET_HOURS


def get_required_staffing(store, is_peak_hour):
    """Return the minimum number of employees required at store for one hour.

    Uses the store's MFC minimum, or the peak-hour minimum if is_peak_hour
    is True, whichever is higher.
    """
    if is_peak_hour:
        return max(store["mfc_minimum"], PEAK_HOUR_MINIMUM_STAFF)
    return store["mfc_minimum"]


def _brand_of(branch):
    for brand, branches in BRANDS.items():
        if branch in branches:
            return brand
    raise ValueError(f"Unknown branch: {branch!r}")


def get_eligible_employees(employees, target_branch):
    """Return employees eligible to work at target_branch.

    Includes employees already assigned to target_branch plus employees
    from other branches of the same brand. Employees from the other brand
    are excluded entirely (brand-block transfer rule).
    """
    target_brand = _brand_of(target_branch)
    return [employee for employee in employees if employee["brand"] == target_brand]


def get_weekly_budget_range(store):
    """Return the (min, max) weekly budget hours for store, based on size tier."""
    return WEEKLY_BUDGET_HOURS[store["size_tier"]]


if __name__ == "__main__":
    small_store = {
        "store_id": "store_s2",
        "brand": "S",
        "branch": "S2",
        "size_tier": "small",
        "mfc_minimum": 1,
    }
    big_store = {
        "store_id": "store_s1",
        "brand": "S",
        "branch": "S1",
        "size_tier": "big",
        "mfc_minimum": 2,
    }

    assert get_required_staffing(small_store, is_peak_hour=False) == 1
    assert get_required_staffing(small_store, is_peak_hour=True) == 2
    assert get_required_staffing(big_store, is_peak_hour=False) == 2
    assert get_required_staffing(big_store, is_peak_hour=True) == 2

    employees = [
        {"employee_id": "e1", "brand": "S", "branch": "S1"},
        {"employee_id": "e2", "brand": "S", "branch": "S2"},
        {"employee_id": "e3", "brand": "M", "branch": "M1"},
    ]
    eligible = get_eligible_employees(employees, "S3")
    assert {employee["employee_id"] for employee in eligible} == {"e1", "e2"}

    assert get_weekly_budget_range(small_store) == (80, 100)
    assert get_weekly_budget_range(big_store) == (120, 170)

    print("All staffing_rules sanity checks passed.")
