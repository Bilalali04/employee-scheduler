"""Peak hour detection logic (v1 scope).

Pure logic only, no MongoDB access here - db/seed_data.py owns generating
and storing hourly_sales. Given a store's hourly_sales data, finds the
contiguous window of consecutive hours with the highest average sales -
the "peak hours" from CLAUDE.md where minimum staffing bumps to 2
regardless of the MFC baseline.
"""

PEAK_WINDOW_LENGTHS = (2, 3)


def _hour_from_label(label):
    """Parse an hour key like "10am", "1pm", or a plain int/str hour into 24-hour int."""
    if isinstance(label, int):
        return label
    label = str(label)
    if label.isdigit():
        return int(label)
    suffix = label[-2:].lower()
    number = int(label[:-2])
    if suffix == "am":
        return 0 if number == 12 else number
    if suffix == "pm":
        return 12 if number == 12 else number + 12
    raise ValueError(f"Unrecognized hour label: {label!r}")


def detect_peak_window(hourly_sales, window_lengths=PEAK_WINDOW_LENGTHS):
    """Return the contiguous window of consecutive hours with the highest average sales.

    hourly_sales maps hour labels (e.g. "10am", "1pm") or hour ints to sales
    figures. window_lengths bounds how many consecutive hours the detected
    peak window may span (default 2-3, matching how seed data is generated),
    rather than hardcoding to the seed data's exact peak length.

    Returns {"start_hour": int, "end_hour": int, "hours": [int, ...]} using
    24-hour integer hours, with end_hour inclusive.
    """
    sales_by_hour = {
        _hour_from_label(label): sales for label, sales in hourly_sales.items()
    }
    hours = sorted(sales_by_hour)

    best_window = None
    best_average = None
    for length in window_lengths:
        for start in hours:
            window = list(range(start, start + length))
            if not all(hour in sales_by_hour for hour in window):
                continue
            average = sum(sales_by_hour[hour] for hour in window) / length
            if best_average is None or average > best_average:
                best_average = average
                best_window = window

    if best_window is None:
        raise ValueError("hourly_sales does not contain enough consecutive hours")

    return {
        "start_hour": best_window[0],
        "end_hour": best_window[-1],
        "hours": best_window,
    }


def is_peak_hour(hour, peak_window):
    """Return True if hour falls within the detected peak_window."""
    return hour in peak_window["hours"]


if __name__ == "__main__":
    sample_hourly_sales = {
        "10am": 100,
        "11am": 110,
        "12pm": 95,
        "1pm": 400,
        "2pm": 380,
        "3pm": 105,
        "4pm": 90,
        "5pm": 115,
    }

    window = detect_peak_window(sample_hourly_sales)
    assert window == {"start_hour": 13, "end_hour": 14, "hours": [13, 14]}
    assert is_peak_hour(13, window) is True
    assert is_peak_hour(14, window) is True
    assert is_peak_hour(10, window) is False

    print("All peak_hours sanity checks passed.")
