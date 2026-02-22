# Specification

## Summary
**Goal:** Fix admin panel permission errors and add interactive open/close control buttons for clinic status management.

**Planned changes:**
- Fix the "You may not have the required permissions" error by ensuring proper authentication checks in the admin panel
- Replace the read-only clinic status display with interactive "Open" and "Close" buttons
- Connect the frontend buttons to backend setClinicOpen and setClinicClosed functions
- Ensure manual override status persists and updates are immediately reflected in the UI

**User-visible outcome:** Admin users can access the admin panel without permission errors and actively control the clinic's open/closed status using dedicated buttons, with changes taking effect immediately.
