"""Synthetic data seeding.

Generates realistic store and employee data with Faker and random, then
inserts it into MongoDB. Domain rules (brand/branch pairing, size tiers,
FT/PT shift ranges) are enforced through the models/ validation helpers
rather than hand-written fixtures.
"""

import random
import uuid

from faker import Faker

from config.settings import BRANDS, MFC_MINIMUMS, SHIFT_LENGTH_HOURS
from db.connection import get_client, get_db
from models.employee import EMPLOYMENT_TYPES, build_employee, validate_shift_length
from models.store import build_store

fake = Faker()

EMPLOYEE_COUNT_RANGE = {
    "small": (4, 5),
    "big": (6, 8),
}


def generate_branch_size_tiers():
    """Assign a size tier to each branch, ensuring both tiers appear per brand."""
    tiers = {}
    for brand, branches in BRANDS.items():
        shuffled = list(branches)
        random.shuffle(shuffled)
        # Guarantee at least one small and one big branch per brand.
        tiers[shuffled[0]] = "small"
        tiers[shuffled[1]] = "big"
        for branch in shuffled[2:]:
            tiers[branch] = random.choice(list(MFC_MINIMUMS.keys()))
    return tiers


def generate_stores(branch_size_tiers):
    """Build a valid store document for each branch."""
    stores = []
    for brand, branches in BRANDS.items():
        for branch in branches:
            store_id = f"store_{branch.lower()}"
            size_tier = branch_size_tiers[branch]
            stores.append(build_store(store_id, brand, branch, size_tier))
    return stores


def generate_employees(branch_size_tiers):
    """Build a roster of valid employee documents for each branch."""
    employees = []
    for brand, branches in BRANDS.items():
        for branch in branches:
            size_tier = branch_size_tiers[branch]
            low, high = EMPLOYEE_COUNT_RANGE[size_tier]
            for _ in range(random.randint(low, high)):
                employment_type = random.choice(EMPLOYMENT_TYPES)
                min_hours, max_hours = SHIFT_LENGTH_HOURS[employment_type]
                shift_hours = random.randint(min_hours, max_hours)
                assert validate_shift_length(employment_type, shift_hours)

                employee_id = f"emp_{uuid.uuid4().hex[:8]}"
                employee = build_employee(
                    employee_id, fake.name(), brand, branch, employment_type
                )
                employee["typical_shift_hours"] = shift_hours
                employees.append(employee)
    return employees


def test_connection():
    """Ping the MongoDB server and return the result."""
    return get_client().admin.command("ping")


def seed():
    """Generate synthetic stores and employees and insert them into MongoDB."""
    branch_size_tiers = generate_branch_size_tiers()
    stores = generate_stores(branch_size_tiers)
    employees = generate_employees(branch_size_tiers)

    db = get_db()
    db.stores.delete_many({})
    db.employees.delete_many({})
    db.stores.insert_many(stores)
    db.employees.insert_many(employees)

    print(f"Inserted {len(stores)} stores and {len(employees)} employees.")
    return stores, employees


if __name__ == "__main__":
    print("Ping result:", test_connection())
    seed()
