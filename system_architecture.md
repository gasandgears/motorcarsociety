# Motorcar Society System Architecture

## Identity and access

Account controls have three distinct dimensions:

- `status`: `pending`, `approved`, or `denied`. This determines whether an application has been accepted.
- `role`: `applicant`, `member`, `barnaby`, or `admin`. This determines the major application areas a person may use.
- `tier`: `none`, `standard`, `priority`, `private`, `staff`, or `leadership`. Collector-facing labels are Verified Member (`standard`), Priority Member (`priority`), and Private Client (`private`). Staff and Leadership are internal.

Registry access currently distinguishes visitors, approved members, and staff. Priority and Private Client are service levels assigned by an administrator; they do not yet create additional database visibility rules.

## Public vehicle submissions

The `/submit-a-car` form creates a record in `vehicle_submissions`; it never creates a Registry car automatically. The public client cannot read submission records directly. The server validates and stores submissions, and administrators review them at `/admin/vehicle-submissions`. Accepted submissions must still be deliberately converted into a car file through the normal Registry intake process.

## Public information pages

About, Privacy, Terms, Contact, and Submit a Car share `components/public-page-shell.tsx`. Barnaby Brokaw is the public contact at `bbforcars@gmail.com` and `619-518-2469`.
