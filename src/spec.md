# Specification

## Summary
**Goal:** Fix admin panel authorization errors and ensure appointments display correctly for authenticated admin users.

**Planned changes:**
- Fix backend authentication logic to properly identify admin users (username: '6352174912', password: '63521') when accessing getAllAppointments
- Resolve the "Unauthorized: Only admins can view all appointments" error in the admin panel
- Ensure appointment data is correctly fetched and displayed in the admin panel table after successful authentication

**User-visible outcome:** Admin users can successfully log in and view all appointments in the admin panel without authorization errors, with the appointment table displaying all relevant patient information including name, phone, service type, date, and status.
