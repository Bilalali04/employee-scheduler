"""Core domain constants for the employee scheduler (v1 scope).

No logic here, just the values that scheduler/ and models/ will consume.
"""

# Brands and their branches. Employees may only transfer within the same brand.
BRANDS = {
    "S": ["S1", "S2", "S3"],
    "M": ["M1", "M2", "M3"],
}

# Store size tiers -> minimum workers on floor (MFC = minimum floor coverage)
MFC_MINIMUMS = {
    "small": 1,
    "big": 2,
}

# During peak hours, minimum staffing is 2 regardless of MFC baseline
PEAK_HOUR_MINIMUM_STAFF = 2

# Employee type -> allowed shift length range, in hours (inclusive)
SHIFT_LENGTH_HOURS = {
    "full_time": (6, 8),
    "part_time": (3, 7),
}

# Store size tier -> allowed weekly budget hour range (inclusive)
WEEKLY_BUDGET_HOURS = {
    "small": (80, 100),
    "big": (120, 170),
}

# Fixed store hours for v1 (variable per-store hours are deferred)
STORE_OPEN_HOUR = 10  # 10am
STORE_CLOSE_HOUR = 18  # 6pm
