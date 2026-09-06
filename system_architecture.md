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

## Admin record workspaces

Each Admin Console collection is a compact line-item list. Stable detail URLs use `/admin/[section]/[id]` and are rendered by `components/admin-record-detail.tsx`. The generic admin record API uses a fixed whitelist of tables and editable fields; route parameters can never select arbitrary database tables or columns.

Internal notes live in `admin_record_notes` and are keyed by record type and record ID. They are available only through administrator-authorized APIs. Deleting an ordinary record also removes its internal notes. Registry car deletion continues through the car-specific endpoint so media is removed from private storage first.

Account deletion removes the Supabase Auth identity and relies on existing cascading relationships for account-owned data. The administrator accounts for `deank@kirklanddigital.com` and `bbforcars@gmail.com` are protected from deletion and from losing approved Admin status.
