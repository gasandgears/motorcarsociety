# Motorcar Society generated listing heroes

- [NEW] `app/api/cars/[id]/generate-hero/route.ts`: authorize staff, load a saved hero, request a high-fidelity OpenAI image edit, and save the generated result as the newest hero.
- [MODIFY] `app/motorcar-app.tsx`: add a clear “Create Motorcar Society Hero” action, generation progress, and reversible saved-version behavior.
- [MODIFY] `system_architecture.md`: document the server-only image-generation boundary and hero versioning rule.
- Verify production build, deploy to Vercel, and test that the configured environment is present.

