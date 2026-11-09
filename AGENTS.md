<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Architecture rules

- Geography (`destinations`) is separate from personal records (`destination_visits`, one row per destination); never put status/visit counts on `destinations` — keeps general info reusable and prevents duplicate country rows.
- All statistics are derived in `src/lib/stats.ts` from DB rows; never hardcode counts in UI — totals must follow data edits.
- Map shapes join on `destinations.map_key` (world-atlas 110m ISO numeric id, or shape name when it has no id); constituent/territory/SAR/disputed and shape-less destinations render as points — lets England, Hong Kong etc. be tracked individually.
- Writes go straight from the browser client and are protected by RLS (`has_role(auth.uid(),'admin')`); public reads are limited by RLS to published/public rows.
- First administrator is claimed once via the `claim_first_admin()` RPC from /admin; no default passwords.
- Shared query definitions live in `src/lib/queries.ts`; invalidate by their first key after mutations.
- Gallery media lives in `media_items` (photo | video | embed); uploads share the private `journal-media` bucket and are served via `/api/public/media/*`; video links are normalised by `src/lib/media.ts` (YouTube-nocookie/Vimeo only) — one storage path and a safe embed allowlist.
- Destination imagery is resolved through the shared image registry; downloaded landmark photos have credits alongside their asset pointers in `landmark-images.ts` — keeps coverage and attribution reusable without changing travel records.
