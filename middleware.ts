import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const unavailablePage = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Сайт недоступен</title>
    <style>
      :root {
        color-scheme: dark;
        --red: #c00020;
        --dark: #0d0d0d;
        --cream: #f0e8d5;
      }

      * {
        box-sizing: border-box;
      }

      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        background:
          linear-gradient(rgba(13, 13, 13, 0.78), rgba(13, 13, 13, 0.94)),
          radial-gradient(circle at center, rgba(192, 0, 32, 0.2), transparent 45%),
          var(--dark);
        color: var(--cream);
        font-family: Arial, Helvetica, sans-serif;
        padding: 24px;
      }

      main {
        width: min(560px, 100%);
        text-align: center;
        border: 1px solid rgba(240, 232, 213, 0.22);
        background: rgba(13, 13, 13, 0.68);
        padding: clamp(32px, 7vw, 64px) clamp(24px, 6vw, 48px);
      }

      .mark {
        width: 56px;
        height: 56px;
        margin: 0 auto 24px;
        border: 2px solid var(--red);
        display: grid;
        place-items: center;
        color: var(--red);
        font-size: 32px;
        font-weight: 700;
      }

      h1 {
        margin: 0;
        font-size: clamp(32px, 8vw, 56px);
        line-height: 1;
        text-transform: uppercase;
        letter-spacing: 0;
      }

      p {
        margin: 18px 0 0;
        font-size: clamp(18px, 4vw, 22px);
        line-height: 1.4;
        color: rgba(240, 232, 213, 0.78);
      }
    </style>
  </head>
  <body>
    <main>
      <div class="mark">!</div>
      <h1>Сайт недоступен</h1>
      <p>Мы временно закрыли доступ. Пожалуйста, зайдите позже.</p>
    </main>
  </body>
</html>`

export function middleware(_request: NextRequest) {
  return new NextResponse(unavailablePage, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.json).*)',
  ],
}
