# Production Checklist

## Already prepared locally

- **Build checks:** `npm run check` runs TypeScript validation and the production Vite build.
- **Secrets hygiene:** the frontend no longer requires `VITE_GROQ_API_KEY`.
- **Public test routes:** `/test-supabase` and `/test-orders` are removed from the production router.
- **AI proxy:** Groq calls now go through the `admin-ai` Supabase Edge Function.
- **Static deploy config:** `netlify.toml` defines the build command, SPA redirect, long-lived asset caching, and security headers.
- **Git hygiene:** `.env*`, build output, logs, and dependencies are ignored; `.gitattributes` normalizes line endings.

## Required before real production traffic

- **Rotate Groq key:** treat the old browser-exposed Groq key as compromised, revoke it, and create a new one.
- **Set Edge Function secrets:** add `GROQ_API_KEY` in Supabase Edge Function secrets. Optionally add `ALLOWED_ORIGIN=https://your-domain.hr`.
- **Deploy Edge Function:** run `supabase login`, `supabase link --project-ref <project-ref>`, then `supabase functions deploy admin-ai`.
- **Migrate auth:** replace the current custom/localStorage auth with Supabase Auth sessions before relying on admin-only browser features.
- **Enable RLS:** enable Row Level Security on every exposed table and create policies matching public, customer, and admin access.
- **Verify storage policies:** ensure product image buckets allow only intended read/write operations.
- **Replace seed accounts:** remove or rotate all seeded admin/test credentials before launch.
- **Configure production environment:** set only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the hosting provider.
- **Connect Git remote:** initialize/push to your chosen GitHub/GitLab repository after confirming no secrets are tracked.
- **Configure custom domain:** add DNS, HTTPS, and the final domain in your hosting provider and Supabase allowed URLs.

## Commands to use

```powershell
npm run check
supabase secrets set GROQ_API_KEY=your_new_groq_key
supabase functions deploy admin-ai
git status
```
