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

## Project rules
- English Arena game code lives in `src/arena/` (ported untyped JS, `// @ts-nocheck`); the `/` route renders it client-only via `ClientOnly` + `lazy`, because it reads localStorage and uses hash pages (`#/games`, `#/rating`, ...).
- All backend access goes through `src/arena/cloud.ts` (Lovable Cloud client + managed Google sign-in); never reintroduce a hand-made Supabase client.
- Tailwind preflight is intentionally not loaded in `src/styles.css`; the game's own stylesheet (`src/arena/Theme.ts`) defines the whole look.
- Guest mode keeps progress only in localStorage; signed-in users also upsert their own `profiles` row (RLS: read for signed-in, write own row).
- AI explanations run in `src/lib/explain.functions.ts` (server function, `requireSupabaseAuth`, `@lovable.dev/ai-gateway`); only signed-in users can call it because every call spends AI credits.
