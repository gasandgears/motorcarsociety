# Public Information Pages — Implementation Plan

## Current membership model

- Account status is separate from membership level: `pending`, `approved`, or `denied`.
- Public applicants begin as `applicant / none / pending`.
- Approved collectors use the `member` role and one of three public-facing levels:
  - `standard` → **Verified Member**: complimentary at launch; approved Registry access, dossier requests, and a private Wanted List.
  - `priority` → **Priority Member**: currently described as $995 annually; includes earlier matches and direct specialist coordination.
  - `private` → **Private Client**: currently described as $2,500 annually; invitation-only acquisition and collection support.
- Internal accounts use separate levels:
  - `staff` for the Barnaby workflow.
  - `leadership` for administrators.
- Important: the application currently enforces approval and role access, but does not yet technically differentiate Registry visibility between Verified, Priority, and Private Client. Those three levels are presently service labels selected by an administrator.

## Pages and changes

### [NEW] `app/about/page.tsx`

- Explain why Motorcar Society exists, how the Registry differs from a marketplace, and how provenance, discretion, and matching work.
- Present the three collector membership levels clearly.
- Explain that every application is reviewed and access is assigned by the Motorcar Society team.
- Include calls to apply for membership and submit a car.

### [NEW] `app/privacy/page.tsx`

- Add a readable privacy notice covering account information, Wanted Lists, vehicle records, uploaded documentation, dossier requests, service providers, retention, security, and contact rights.
- Clearly distinguish private source documents from public or member-visible listing information.
- Mark an effective date and avoid claims the current system cannot support.

### [NEW] `app/terms/page.tsx`

- Add terms covering membership approval, private information, acceptable use, listing accuracy, no guarantee of sale or valuation, intellectual property, account termination, and liability limitations.
- Make clear that Registry guidance is informational and not an appraisal.

### [NEW] `app/contact/page.tsx`

- Add a simple contact page with clear paths for membership, vehicle submission, dossier questions, and general inquiries.
- Use Dean’s approved project email where a contact address is required.
- Avoid a nonfunctional form; provide direct, dependable contact actions first.

### [NEW] `app/submit-a-car/page.tsx`

- Add a public-facing vehicle submission page explaining the review process.
- Provide a concise intake form for owner contact details, year, make, model, location, ownership status, brief vehicle story, and available documentation.
- Include consent language before submission and a clear success state.

### [NEW] `app/api/vehicle-submissions/route.ts`

- Validate and store public vehicle inquiries safely.
- Apply field length limits, normalize email/phone data, and return plain-language validation errors.
- Do not create a Registry record automatically; submissions remain a review queue.

### [MODIFY] `db/schema.ts`

- Add a `vehicle_submissions` table with contact details, vehicle summary, consent timestamp, review status, and created/updated timestamps.

### [NEW] `supabase/migrations/20260906_vehicle_submissions.sql`

- Create the production table, index review status/date, and enable row-level security.
- Keep public browser clients from directly reading submissions; all intake goes through the validated server route.

### [MODIFY] `app/motorcar-app.tsx`

- Replace inactive footer labels with links to About, Privacy, Terms, Contact, and Submit a Car.
- Add About and Submit a Car to the appropriate public navigation areas without crowding the primary header.
- Update the membership call-to-action to point to the About page’s tier explanation.

### [MODIFY] `tests/rendered-html.test.mjs`

- Verify all five routes render meaningful headings and navigation.
- Verify the membership page content and vehicle-submission form fields.

### [MODIFY] `tests/ui-components.test.mjs`

- Verify footer destinations and the public calls to action.

### [MODIFY] `system_architecture.md`

- Document the distinction between account status, account role, membership tier, and vehicle-submission review state.

## Verification

- Run the complete build and automated test suite.
- Check all five pages at desktop and phone widths.
- Submit invalid form data and confirm friendly validation.
- Submit one test inquiry and confirm it is stored without creating or releasing a car.
- Verify visitor, applicant, member, and admin navigation remains correct.
