"""Employee document structure and validation helpers.

No MongoDB insert/query logic here, that lives in db/seed_data.py.
"""

from config.settings import BRANDS, SHIFT_LENGTH_HOURS

EMPLOYMENT_TYPES = tuple(SHIFT_LENGTH_HOURS.keys())


def validate_assignment(brand, branch):
    """Raise ValueError if brand/branch is not a valid combination."""
    if brand not in BRANDS:
        raise ValueError(f"Unknown brand: {brand!r}")
    if branch not in BRANDS[brand]:
        raise ValueError(f"Branch {branch!r} does not belong to brand {brand!r}")


def validate_shift_length(employment_type, shift_hours):
    """Return True if shift_hours falls within the range for employment_type.

    employment_type must be one of the keys in SHIFT_LENGTH_HOURS
    ("full_time" or "part_time").
    """
    if employment_type not in SHIFT_LENGTH_HOURS:
        raise ValueError(f"Unknown employment type: {employment_type!r}")
    minimum, maximum = SHIFT_LENGTH_HOURS[employment_type]
    return minimum <= shift_hours <= maximum


def build_employee(employee_id, name, brand, branch, employment_type):
    """Construct a valid employee document.

    Args:
        employee_id: unique identifier for the employee.
        name: employee's name.
        brand: "S" or "M".
        branch: e.g. "S1", "M2" - must belong to brand.
        employment_type: "full_time" or "part_time".

    Returns:
        dict representing the employee document. All employees are hourly
        per v1 scope.
    """
    validate_assignment(brand, branch)
    if employment_type not in SHIFT_LENGTH_HOURS:
        raise ValueError(f"Unknown employment type: {employment_type!r}")
    return {
        "employee_id": employee_id,
        "name": name,
        "brand": brand,
        "branch": branch,
        "employment_type": employment_type,
        "hourly": True,
    }
