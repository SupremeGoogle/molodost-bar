# molodost.bar48 — архитектура

## Commands
```bash
npm run dev      # localhost:3000
npm run build    # production build
npm run lint     # ESLint (next/core-web-vitals)
```

## Architecture

**Data source of truth:** `content/data.json` — read via `lib/content.ts` (sync `fs.readFileSync`).

**All site text** is editable through `/admin` → in-app editor → save pushes to GitHub. No static generation — every request SSR's from `data.json`.

**Key directories:**
- `components/` — one component per section (Hero, Gallery, PriceMenu, etc.), all `'use client'`
- `app/api/` — 7 routes: auth, content, push, upload, lead, leads.csv, debug
- `content/` — `data.json` (site content), `leads.json` (contact form submissions)
- `cloudflare-worker/` — Telegram bot proxy (separate deploy via `wrangler`)
- `apps-script/` — Google Apps Script (deployed manually, clasp not configured)
- `public/gallery/` — 6 photos (~3-4 MB each)
- `public/price/` — 6 menu page images

## Admin → GitHub push flow
1. Admin edits content in `/admin`
2. Click "Сохранить всё и пуш в GitHub"
3. `POST /api/push` → saves `content/data.json` locally → calls GitHub Contents API PUT
4. Git commit triggers Vercel redeploy (~1 min)

## Environment variables (Vercel)
```
ADMIN_PASSWORD=molodost062026
GITHUB_TOKEN=<PAT with repo write>
GITHUB_OWNER=SupremeGoogle
GITHUB_REPO=molodost-bar
GOOGLE_SCRIPT_URL=<Apps Script web app URL>
CLOUDFLARE_WORKER_URL=<worker URL>
CLOUDFLARE_BROADCAST_SECRET=<matches worker secret>
```

## Design tokens (Tailwind)
| Token | Value | Use |
|---|---|---|
| `soviet-red` | `#C00020` | primary accent, CTA buttons |
| `soviet-dark` | `#0D0D0D` | main background |
| `aged-cream` | `#F0E8D5` | headings |
| `soviet-gold` | `#C9A84C` | star ratings |
| `font-russo` | Russo One | headlines |
| `font-pt` | PT Sans | body |
| `bg-grain` | SVG filter | grain texture overlay |

## Critical gotchas

- **`.env.local` is committed with live secrets** — do NOT commit again or push to public forks
- **`POST /api/content`, `POST /api/upload`, `PATCH /api/lead` have NO authentication** — admin panel relies on `/api/auth` + `POST /api/push` for writes
- **Every admin save and every lead form submission triggers a full Vercel redeploy** — takes ~1 minute
- **Cloudflare worker** deployed separately with `wrangler`, has its own secrets (`TELEGRAM_BOT_TOKEN`, `BROADCAST_SECRET`), uses KV namespace `SUBSCRIBERS`
- **Google Apps Script** deployed manually (clasp not connected to a real script ID)
- **`public/schedule.png`** is NOT used — schedule is text-based in `WorkingHours.tsx`
- **`Галлерея/` and `Прайс/` at repo root** are orphaned duplicates of `public/gallery/` and `public/price/`
- **No error boundaries** — invalid `data.json` crashes the entire site
- **`page.tsx` uses `revalidate = 60` but it has no effect** (sync `fs.readFileSync`, no fetch; page is fully dynamic)
