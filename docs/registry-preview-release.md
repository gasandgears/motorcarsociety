# Registry previews, inquiries and visitor signup

Released cars have public HTML/JSON teasers limited to identity, category and hero image. Approved members of every tier may view full released listing details/gallery/video, including Private Match. Confidential seller call notes and source documents remain staff-only.

Coming Soon uses a separate explicit preview allowlist. An enabled entry supplies only a reviewed public title and one designated hero cover. Cars in intake/review/ready are eligible; released cars automatically leave this section. Staff can withhold a preview in the intake editor. Clicking opens an inquiry dialog, never the unreleased detail page.

The 26 current preview records are enabled after Dean explicitly approved their limited public identity/photo teasers, superseding older no-publication audit notes for this purpose only. The first bulk activation was rejected; the single retry under that new approval succeeded. Full intake listings remain blocked.

Inquiries require name/phone/email and contact consent. They are car-specific, stored privately and shown at `/admin/coming-soon-inquiries`. They do not join a newsletter. Same-origin JSON, bounded streamed bodies, honeypot, form age, database-backed IP/email rate limits, transaction locks and deduplication protect the endpoint. Pending notifications can be retried by staff.

Email routing requires explicit production `RESEND_API_KEY`, `INQUIRY_EMAIL_FROM` and `INQUIRY_EMAIL_TO` configuration. Preserve the configured validation recipient; there is no implicit recipient fallback. Missing/rejected delivery leaves a saved pending inquiry; UI never claims it sent. Provider acceptance and inbox delivery are separate checks.

Visitor newsletter signup is separate from membership. A server gate excludes any authenticated user and fails closed on auth errors; the client starts closed, rechecks eligibility and suppresses on auth changes. Dismissal/success is remembered locally. Explicit newsletter consent is required, phone optional, no account is created, and no newsletter is sent. Contacts use the existing admin-only `mailing_contacts` table. Duplicate insertion never overwrites a contact or reverses unsubscribe.

Database migrations:
- `20261103195015_coming_soon_inquiries.sql`
- `20261103195913_newsletter_signup_limits.sql`
Both are applied to the Registry project. New tables have RLS enabled and no anon/authenticated grants; all access is through authorized server routes.

Run `node --test tests/registry-access.test.mjs tests/coming-soon.test.mjs tests/visitor-signup.test.mjs` and `npm run build`. Full legacy suite also contains pre-existing development-metadata and dist-directory assumptions.

Staff can upload an already-finished display hero using **Upload finished hero**. This adds a new hero file without regenerating it, overwriting source/gallery files, or saving release/certification changes.

The finished-hero upload control is in the saved-car editor header, available without navigating or auto-saving. Ordinary edits, checklist updates, visibility changes and document prefill omit workflow status. The server preserves the current status when omitted, rejects invalid explicit statuses, and changes it only on an explicit workflow action.
