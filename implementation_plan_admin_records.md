# Admin Record Workspace — Implementation Plan

## Objective

Convert every Admin Console collection into a compact, single-line list. Selecting a row opens a dedicated record page where an administrator can inspect the complete record, edit supported fields, add internal notes, change status, and delete the record with a clear confirmation.

## Shared interaction model

- Every collection page uses the same responsive table/list pattern: one record per horizontal row, a few identifying columns, current status, updated date, and a visible chevron/link.
- On phones, each row remains one compact clickable item with secondary columns hidden rather than expanding into a large card.
- Clicking a row opens a stable URL for that record.
- Detail pages use a common header with Back, Save changes, and Delete controls.
- Deletion always names the exact record and requires confirmation. Protected leadership accounts cannot be deleted.
- Internal notes are timestamped and attributed to the administrator who wrote them.

## Data model

### [MODIFY] `db/schema.ts`

- Add `admin_record_notes`: record type, record ID, note text, author ID/email, and timestamps.
- Add an updated timestamp to mailing contacts if not already present (already present).
- Continue using the existing status fields for dossiers, submissions, Wanted records, cars, and accounts.

### [NEW] `supabase/migrations/20260906_admin_record_notes.sql`

- Create the private notes table with an entity/date index and row-level security.
- Notes are never exposed by public APIs.

## Shared admin components

### [NEW] `components/admin-record-list.tsx`

- Reusable single-line row layout, empty state, status badge, and responsive column behavior.

### [NEW] `components/admin-record-detail.tsx`

- Reusable detail header, editable internal-notes timeline, add-note form, delete confirmation, loading, and error states.

### [NEW] `app/api/admin/record-notes/route.ts`

- Admin-only list and create operations for notes.
- Validate allowed record types and note length.

## Collection and detail routes

### Dossier requests

- [MODIFY] `/admin/dossier-requests`: compact rows only.
- [NEW] `/admin/dossier-requests/[id]`: requester, vehicle, dates, status (`new`, `contacted`, `closed`), internal notes, and delete.
- [MODIFY] `app/api/admin/dossier-requests/route.ts`: add single-record retrieval and deletion support through a dedicated `[id]` route.

### Vehicle submissions

- [MODIFY] `/admin/vehicle-submissions`: compact rows only.
- [NEW] `/admin/vehicle-submissions/[id]`: complete owner/contact/vehicle/story/documentation information, status (`new`, `contacted`, `accepted`, `declined`), internal notes, and delete.
- [NEW] `app/api/admin/vehicle-submissions/[id]/route.ts`: get, edit, status update, and delete.

### Client contacts

- [MODIFY] `/admin/contacts`: keep CSV import as a compact action at the top; show imported contacts as single-line rows below.
- [NEW] `/admin/contacts/[id]`: edit name, email, phone, source, permission, invitation status, internal notes, and delete.
- [NEW] `app/api/admin/contacts/[id]/route.ts`: get, update, and delete.

### Member Wanted List

- [MODIFY] `/admin/wanted-list`: compact rows with member and requested car.
- [NEW] `/admin/wanted-list/[id]`: member information, year/make/model/variant/range/details/status, internal notes, edit, and delete.
- [NEW] `app/api/admin/wanted/[id]/route.ts`: get, update, and delete as an administrator.

### Registry releases

- [MODIFY] `/admin/registry-releases`: compact rows with car, Registry ID, audience, and release status.
- [NEW] `/admin/registry-releases/[id]`: open the existing complete car-file editor at a stable admin URL, retain release controls and existing deletion.
- [MODIFY] `app/admin/[section]/page.tsx` and car-intake routing so old links continue to work.

### Accounts

- [MODIFY] `/admin/accounts`: compact rows with name/email, approval status, role, and level.
- [NEW] `/admin/accounts/[userId]`: contact profile, application information, status, role, membership level, internal notes, save, and delete.
- [NEW] `app/api/admin/members/[userId]/route.ts`: get, update, and full account deletion, including the Supabase Auth user. Protect Dean’s and Barnaby’s administrator accounts from deletion.

## Navigation and architecture

### [MODIFY] `app/motorcar-app.tsx`

- Replace the six expanded collection renderers with compact line-item lists.
- Preserve all existing search, filtering, pagination, matching, import, release, and account-management behavior.

### [NEW] Dynamic admin detail route files

- Add server-authenticated route entry points for all six detail-page families.
- Redirect unauthenticated visitors to sign in and reject non-admin accounts.

### [MODIFY] `system_architecture.md`

- Document stable admin record URLs, the shared internal-note model, deletion behavior, and protected accounts.

## Verification

- Run the full build and automated tests.
- Verify all six collection pages at desktop and phone widths.
- Verify each row opens the correct record page.
- Verify status changes and notes persist after reload.
- Verify deletion confirmations and protected-account safeguards.
- Verify existing Registry car editing, contact import, Wanted matching, and account approval still work.
- Deploy the migration and production build, then repeat the primary live flows.
