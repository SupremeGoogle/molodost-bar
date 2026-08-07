# Молодость — заметки по разработке

## Project

Website for **«Молодость»** — кафе-бар в Липецке, Russia. Next.js 14, Tailwind CSS, TypeScript. Soviet/USSR 90s aesthetic.

**Live repo:** https://github.com/SupremeGoogle/molodost-bar  
**Admin panel:** `/admin` (password: stored separately, not in code)

## Commands

```bash
npm run dev      # dev server (http://localhost:3000)
npm run build    # production build
npm run lint     # eslint
```

If `next` command not found, use `node_modules/.bin/next dev`.

## Architecture

Content is stored in `content/data.json` — the single source of truth for all editable text, images, hours, reviews, and contacts.

```
app/
  page.tsx          — main page, reads data.json via getContent()
  admin/page.tsx    — password-protected admin panel (client component)
  api/content/      — GET/POST data.json
  api/push/         — saves data.json then pushes to GitHub via API
  api/upload/       — uploads image file to GitHub, saves locally
components/         — one component per section (Hero, Gallery, PriceMenu, …)
lib/
  content.ts        — fs read/write for content/data.json
  github.ts         — GitHub REST API helpers (getFileSha, pushFile, pushBinaryFile, deleteFile)
content/data.json   — all site content (edit via admin or directly)
public/
  gallery/          — gallery photos (photo1.jpg … photo6.jpg)
  price/            — price list pages (1.jpg … 6.jpg)
```

## Admin → GitHub push flow

1. Admin edits content in `/admin`
2. Click "Сохранить → GitHub"
3. `POST /api/push` → saves `content/data.json` locally → calls GitHub Contents API PUT
4. GitHub triggers Vercel redeploy → site updates automatically

## Environment variables

```
GITHUB_TOKEN=<personal access token with repo write>
GITHUB_OWNER=SupremeGoogle
GITHUB_REPO=molodost-bar
```

Set in `.env.local` locally. On Vercel: add as Environment Variables in project settings.

## Business Information

**Address:** ул. А.Г. Стаханова, 49А (этаж 1), г. Липецк  
**Phone:** +7 (4742) 39-03-93  
**Legal:** ООО «МАЯК», ИНН 4823072199, ОГРН 1164827057273  
**Telegram:** https://t.me/molodost48  
**Instagram:** https://www.instagram.com/molodost.bar48

## Design tokens (Tailwind)

| Token | Value | Use |
|-------|-------|-----|
| `soviet-red` | `#C00020` | primary accent, CTA buttons |
| `soviet-dark` | `#0D0D0D` | main background |
| `soviet-dark2` | `#141414` | secondary background |
| `aged-cream` | `#F0E8D5` | headings, aged-paper sections |
| `soviet-gold` | `#C9A84C` | star ratings |
| `dark-red` | `#8B0000` | hover state |

Fonts: `font-russo` = Russo One (headlines, Cyrillic), `font-pt` = PT Sans (body).
