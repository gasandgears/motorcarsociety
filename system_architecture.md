# System architecture notes

## Generated registry heroes

- Image editing runs only in `app/api/cars/[id]/generate-hero/route.ts`; `OPENAI_API_KEY` must remain server-side in Vercel.
- A staff member explicitly starts generation from a saved JPG, PNG, or WebP hero.
- The source file is never overwritten. Each result is stored as another `hero` file, and the newest saved hero is the active Registry image.
- Generation uses high input fidelity and a fixed Motorcar Society private-gallery prompt so the vehicle stays recognizable while the setting is replaced.
