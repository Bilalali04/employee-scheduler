"""Store document structure and validation helpers.

No MongoDB insert/query logic here, that lives in db/seed_data.py.
"""

from config.settings import BRANDS, MFC_MINIMUMS


def get_mfc_minimum(size_tier):
    """Return the minimum floor coverage (MFC) for a given size tier."""
    if size_tier not in MFC_MINIMUMS:
        raise ValueError(f"Unknown size tier: {size_tier!r}")
    return MFC_MINIMUMS[size_tier]


def validate_store(brand, branch, size_tier):
    """Raise ValueError if brand/branch/size_tier is not a valid combination."""
    if brand not in BRANDS:
        raise ValueError(f"Unknown brand: {brand!r}")
    if branch not in BRANDS[brand]:
        raise ValueError(f"Branch {branch!r} does not belong to brand {brand!r}")
    if size_tier not in MFC_MINIMUMS:
        raise ValueError(f"Unknown size tier: {size_tier!r}")


def build_store(store_id, brand, branch, size_tier):
    """Construct a valid store document.

    Args:
        store_id: unique identifier for the store.
        brand: "S" or "M".
        branch: e.g. "S1", "M2" - must belong to brand.
        size_tier: "small" or "big".

    Returns:
        dict representing the store document, including the derived MFC
        minimum for its size tier.
    """
    validate_store(brand, branch, size_tier)
    return {
        "store_id": store_id,
        "brand": brand,
        "branch": branch,
        "size_tier": size_tier,
        "mfc_minimum": get_mfc_minimum(size_tier),
    }
