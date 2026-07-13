# User Stories

These describe how the Employee Scheduler is meant to be used, grouped by
the stage of the workflow they belong to. Stories reflect what's actually
built (see the README's "Features implemented" section); stories tied to
roadmap items not yet built are called out explicitly under **Future**.

## Data Import

- As a store manager, I want to upload my employee and store roster as an
  Excel workbook, so that I can get a working schedule without manually
  entering data into a new system.
- As a business owner, I want the system to validate my upload and tell me
  clearly what's wrong (e.g., a `Store_Code` mismatch between sheets)
  instead of crashing, so that I can trust the imported data before I rely
  on it.
- As a manager whose staff has changed (a new hire, someone leaving), I
  want to re-upload an updated workbook, so that the next schedule reflects
  my current team without editing records one by one.

## Schedule Generation

- As a scheduler, I want to select a store and generate its weekly
  schedule automatically, so that I don't have to work out shift
  assignments by hand.
- As a business owner, I want the schedule to only assign employees to
  branches of their own brand, so that transfer eligibility is enforced
  without me having to check it manually.
- As a manager, I want each shift to be a single contiguous block within
  legal full-time/part-time length limits, so that the schedule is
  actually usable and fair to employees, not scattered hours.

## Schedule Review

- As a manager, I want to view the generated weekly schedule as a
  day-by-employee grid, so that I can see at a glance who's working when.
- As a scheduler, I want to see each eligible employee and their actual
  scheduled hours for the week (including who wasn't scheduled at all), so
  that I understand how the whole roster is being used, not just who
  happened to get shifts.

## Understanding & Debugging Schedules

- As a manager, I want to see which hours are flagged as "peak" and why
  staffing is higher then, so that I understand the connection between
  real sales data and the staffing decisions the schedule made.
- As a business owner, I want to check the solver's status and required
  staffing per hour when a schedule looks unexpected or fails to generate,
  so that I can diagnose the cause (e.g., too few eligible employees)
  instead of just seeing a blank result.

## Cross-Store Comparison

- As a multi-location business owner, I want to switch between stores
  easily, so that I can review and compare schedules across different
  branches and brands.
- As an operations manager, I want to see each store's size tier and
  minimum floor coverage, so that I understand why staffing requirements
  differ from one location to the next.

## Staffing & Coverage Assurance

- As a manager, I want confirmation that a store meets its minimum floor
  coverage every hour, especially during its detected peak window, so
  that I know it won't be understaffed during a rush.
- As a business owner, I want peak hours detected from actual hourly sales
  data rather than guessed, so that staffing decisions are grounded in
  real demand instead of assumption.

## Budget/Cost Assurance

- As a business owner, I want to see total scheduled hours against my
  store's weekly budget range, so that I can confirm labor hours stay
  within plan before committing to the schedule.
- As a manager, I want to be told clearly when no feasible schedule could
  be generated for a store, so that I know to investigate and adjust the
  roster or hours before relying on it.

## Future (roadmap - not yet built)

- As a manager, I want to see each employee's gross profit per hour, so
  that I can evaluate labor efficiency, not just hours worked. (GP/Hr
  tracking - currently a "Soon" placeholder in the UI)
- As a manager, I want overtime and required breaks tracked automatically,
  so that I stay compliant with labor rules. (overtime/break tracking -
  currently a "Soon" placeholder in the UI)
- As a business owner, I want to export a generated schedule back to
  Excel, so that I can share or print it outside the app. (Excel export of
  generated schedules - distinct from Excel as an import connector, which
  is already implemented)
- As a manager, I want to print the schedule directly from the browser, so
  that I can post a physical copy in the break room. (Print toolbar action
  - currently a disabled placeholder)
- As a manager, I want to copy an employee's email from the schedule view,
  so that I can quickly reach out about a shift change. (Copy Email
  toolbar action - currently a disabled placeholder)
