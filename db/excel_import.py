"""Excel-based data import.

Reads the preset Excel workbook (Stores, Employees, Hourly_Sales sheets -
see data/generate_preset_data.py for how it was produced) and maps each row
into build_store() / build_employee() documents, validating them the same
way db/seed_data.py's live generation did. The Excel file is now the source
of truth for seed data; random generation only ran once to produce it.
"""

import pandas as pd

from models.employee import build_employee
from models.store import build_store

DEFAULT_EXCEL_PATH = "data/preset_data.xlsx"


def _load_hourly_sales_by_store(hourly_sales_df):
    """Group Hourly_Sales rows into store_code -> {hour_label: sales}."""
    hourly_sales_by_store = {}
    for row in hourly_sales_df.itertuples(index=False):
        hourly_sales_by_store.setdefault(row.Store_Code, {})[row.Hour] = row.Sales
    return hourly_sales_by_store


def import_stores_and_employees(excel_path=DEFAULT_EXCEL_PATH):
    """Read the preset Excel workbook and return validated (stores, employees).

    Returns:
        (stores, employees) - lists of documents built via build_store() /
        build_employee(), the same document shape db/seed_data.py produces
        (stores carry an "hourly_sales" field for peak-hour detection).
    """
    stores_df = pd.read_excel(excel_path, sheet_name="Stores")
    employees_df = pd.read_excel(excel_path, sheet_name="Employees")
    hourly_sales_df = pd.read_excel(excel_path, sheet_name="Hourly_Sales")

    hourly_sales_by_store = _load_hourly_sales_by_store(hourly_sales_df)

    stores = []
    for row in stores_df.itertuples(index=False):
        store = build_store(row.Store_Code, row.Brand, row.Branch, row.Size_Tier)
        store["hourly_sales"] = hourly_sales_by_store.get(row.Store_Code, {})
        stores.append(store)

    employees = []
    for row in employees_df.itertuples(index=False):
        employee = build_employee(
            row.Employee_Code,
            row.Employee_Name,
            row.Brand,
            row.Branch,
            row.Employment_Type,
        )
        employee["position_title"] = row.Position_Title
        employee["pay_type"] = row.Pay_Type
        employees.append(employee)

    return stores, employees


if __name__ == "__main__":
    imported_stores, imported_employees = import_stores_and_employees()
    print(f"Imported {len(imported_stores)} stores and {len(imported_employees)} employees.")
    print()
    print("Sample store:", imported_stores[0])
    print()
    print("Sample employee:", imported_employees[0])
