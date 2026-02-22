# Specification

## Summary
**Goal:** Fix the admin authorization error preventing the admin user from viewing all appointments in the admin panel.

**Planned changes:**
- Fix backend authorization logic to correctly recognize the admin principal 'toamj-lbfi5-2suff-sgsui-6nkd7-obeou-bycm3-yv3ea-izdzv-w6ra2-zqe' as an admin
- Add debug logging to trace caller principal, admin authentication check results, and authorization failure reasons
- Verify frontend is correctly passing the admin access token when making getAllAppointments calls

**User-visible outcome:** Admin users can successfully view all appointments in the admin panel without encountering "Unauthorized" errors.
