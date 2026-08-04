# Connecting Sanity CMS (when you're ready)

The site works fully WITHOUT the CMS today — content lives in `/content/*.json`.
When you want the CMS, do this (roughly 30–45 minutes):

1. **Create a free Sanity project**
   ```bash
   npm create sanity@latest
   ```
   Sign in (Google/GitHub works), name the project "GNG Website", choose the
   *Clean* template. This gives you a `studio/` folder — the editing dashboard.

2. **Add these schemas** — copy every file from this folder's `schemas/` into
   your studio's `schemaTypes/` and export them from its index. They match the
   JSON in `/content` field-for-field.

3. **Add your project keys to the website** — create `.env.local` in the site root:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxx
   NEXT_PUBLIC_SANITY_DATASET=production
   ```

4. **Install the client & swap the content layer**
   ```bash
   npm install next-sanity
   ```
   Then in `lib/content.js`, replace the JSON returns with GROQ fetches, e.g.:
   ```js
   import { createClient } from 'next-sanity'
   const client = createClient({
     projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
     dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
     apiVersion: '2024-07-01', useCdn: true,
   })
   export async function getSolutions() { return client.fetch(`*[_type == "solution"]`) }
   export async function getHardware()  { return client.fetch(`*[_type == "product"]`) }
   export async function getPosts()     { return client.fetch(`*[_type == "post"] | order(date desc)`) }
   export async function getSite()      { return client.fetch(`*[_type == "siteSettings"][0]`) }
   ```
   (Pages already `await`-friendly: they're server components.)

5. **Leads into the CMS** — in `app/api/contact/route.js`, replace the file
   write with a Sanity create (needs a write token in `SANITY_WRITE_TOKEN`):
   ```js
   await client.create({ _type: 'lead', ...lead })
   ```

6. **Run the studio** with `npm run dev` inside `studio/` — your team edits
   products, solutions, posts and settings there; the site updates on refresh.
