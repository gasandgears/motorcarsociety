# Motorcar Society Private Registry

## Product rule

Build a private collector-car sales network and the operating system behind it. Do not build an auction site or an open classified marketplace.

## Primary users

- Verified collectors, initially expected to skew age 60 and above.
- Barnaby Brokaw, responsible for sourcing, seller calls, facts, and negotiation.
- Dean Kirkland, responsible for historical presentation, photography, film, and release quality.

## Required experience

- Large readable type and high contrast.
- Straightforward labels and controls.
- Public Registry, private dossiers, Wanted Lists, membership applications, and a sales operations desk.
- Every car progresses through a visible intake checklist before release.
- Automation prepares drafts and reminders. A person approves every vehicle record before publication.

## Accountability rules for Barnaby's Desk

- Show one clear next action per car.
- Put the most urgent call first.
- Send a morning action list and an afternoon overdue reminder.
- Allow one snooze.
- Alert Dean when an action remains incomplete for 24 hours.
- Keep overdue work visible until completed or reassigned.
- Never hide an unfinished car inside a general inbox.

## Release sequence

1. Private Match for collectors whose Wanted Lists fit the car.
2. Verified-member release.
3. Public release only when the seller approves wider exposure.

## Current prototype boundary

The first prototype demonstrates the collector Registry, private dossier request, Wanted List, membership application, and Barnaby's daily action desk. Production authentication, confidential document storage, CRM integrations, and transaction handling follow after the workflow is approved.

## Version 2: Add a Car

- Barnaby creates a car file after entering only the year, make, model, seller, phone, and expected price.
- The file exists before every photo or document is available.
- Missing photos and records remain visible as an assigned checklist.
- Release defaults to Private Match; member or public visibility requires explicit selection and team approval.
- The handoff separates Dean's presentation work from Barnaby's remaining seller follow-up.
- Selected images display as local thumbnails with filenames, file sizes, counts, and removal controls.
- Car records persist in D1 and appear under Recent Car Files on Barnaby's Desk.
- Photos, PDFs, and videos persist in private R2 storage and reopen with the car file.
- Every write requires an authenticated visitor already allowed into the private Site.
- Production email and reminder delivery remain deliberately deferred.

## Version 3: Barnaby’s private action desk

- Barnaby’s Desk is shown only to the account assigned to Barnaby. The temporary Barnaby login is `deankirkland@me.com` until his permanent email replaces it.
- The Desk API and every task update enforce the same restriction on the server.
- Every saved car receives one visible next action based on missing seller details, vehicle identification, photos, documents, and handoff status.
- Overdue work sorts to the top. The Desk shows who owns the action, when it is due, and the car-file completion percentage.
- Barnaby can open the car, complete the current action, or snooze it once for 24 hours.
- Completing an action exposes the next unfinished item instead of hiding the car in a general inbox.
- Cars already sent to Dean are labeled as waiting for Dean rather than appearing as Barnaby’s unfinished work.
