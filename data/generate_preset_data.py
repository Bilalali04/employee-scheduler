"""One-time generator for the preset Excel dataset (data/preset_data.xlsx).

Run manually to (re)create the fixed preset dataset that db/excel_import.py
reads at runtime:

    python -m data.generate_preset_data

This is not part of the app's runtime path - it reuses the same Faker/random
generation approach as db/seed_data.py (including its generate_hourly_sales
and generate_branch_size_tiers helpers) to produce a realistic dataset once,
then writes it to a static Excel file. From then on, that file - not live
random generation - is the source of truth for seed data.
"""

import random

import pandas as pd
from faker import Faker

from config.settings import BRANDS, SHIFT_LENGTH_HOURS
from db.seed_data import generate_branch_size_tiers, generate_hourly_sales

fake = Faker()

EMPLOYEE_COUNT_RANGE = {
    "small": (4, 5),
    "big": (6, 8),
}

OUTPUT_PATH = "data/preset_data.xlsx"


def generate_store_rows(branch_size_tiers):
    """Build one row per branch for the Stores sheet."""
    rows = []
    for brand, branches in BRANDS.items():
        for branch in branches:
            rows.append(
                {
                    "Store_Code": f"store_{branch.lower()}",
                    "Brand": brand,
                    "Branch": branch,
                    "Size_Tier": branch_size_tiers[branch],
                }
            )
    return rows


def generate_hourly_sales_rows(store_rows):
    """Build one row per store per operating hour for the Hourly_Sales sheet."""
    rows = []
    for store_row in store_rows:
        for hour_label, sales in generate_hourly_sales().items():
            rows.append(
                {
                    "Store_Code": store_row["Store_Code"],
                    "Hour": hour_label,
                    "Sales": sales,
                }
            )
    return rows


def generate_employee_rows(branch_size_tiers):
    """Build one row per employee for the Employees sheet.

    Employment_Type values match config.settings.SHIFT_LENGTH_HOURS keys
    directly ("full_time"/"part_time") so db/excel_import.py can pass them
    straight to models/employee.py without a translation table.
    """
    rows = []
    counter = 1
    for brand, branches in BRANDS.items():
        for branch in branches:
            size_tier = branch_size_tiers[branch]
            low, high = EMPLOYEE_COUNT_RANGE[size_tier]
            for _ in range(random.randint(low, high)):
                employment_type = random.choice(list(SHIFT_LENGTH_HOURS.keys()))
                min_hours, max_hours = SHIFT_LENGTH_HOURS[employment_type]
                rows.append(
                    {
                        "Employee_Code": f"EMP{counter:04d}",
                        "Employee_Name": fake.name(),
                        "Position_Title": "Sales Associate",
                        "Pay_Type": "Hourly",
                        "Employment_Type": employment_type,
                        "Brand": brand,
                        "Branch": branch,
                        "Store_Code": f"store_{branch.lower()}",
                        "Min_Shift_Hours": min_hours,
                        "Max_Shift_Hours": max_hours,
                    }
                )
                counter += 1
    return rows


def main():
    branch_size_tiers = generate_branch_size_tiers()
    store_rows = generate_store_rows(branch_size_tiers)
    hourly_sales_rows = generate_hourly_sales_rows(store_rows)
    employee_rows = generate_employee_rows(branch_size_tiers)

    with pd.ExcelWriter(OUTPUT_PATH, engine="openpyxl") as writer:
        pd.DataFrame(store_rows).to_excel(writer, sheet_name="Stores", index=False)
        pd.DataFrame(employee_rows).to_excel(writer, sheet_name="Employees", index=False)
        pd.DataFrame(hourly_sales_rows).to_excel(
            writer, sheet_name="Hourly_Sales", index=False
        )

    print(
        f"Wrote {len(store_rows)} stores, {len(employee_rows)} employees, and "
        f"{len(hourly_sales_rows)} hourly sales rows to {OUTPUT_PATH}"
    )


if __name__ == "__main__":
    main()
