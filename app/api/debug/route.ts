import { NextResponse } from 'next/server'

export async function GET() {
  const check = (val: string | undefined) =>
    val && !val.includes('ВСТАВИТЬ') && !val.includes('ПРИДУМАТЬ') && val.length > 5

  const vars = {
    GITHUB_TOKEN:              { ok: check(process.env.GITHUB_TOKEN),              hint: 'Токен доступа к репозиторию' },
    ADMIN_PASSWORD:            { ok: check(process.env.ADMIN_PASSWORD),            hint: 'Пароль админки' },
    GOOGLE_SCRIPT_URL:         { ok: check(process.env.GOOGLE_SCRIPT_URL),         hint: 'URL Google Apps Script (нужно задеплоить скрипт)' },
    CLOUDFLARE_WORKER_URL:     { ok: check(process.env.CLOUDFLARE_WORKER_URL),     hint: 'URL Cloudflare Worker' },
    CLOUDFLARE_BROADCAST_SECRET: { ok: check(process.env.CLOUDFLARE_BROADCAST_SECRET), hint: 'Секрет рассылки (должен совпадать с wrangler secret put BROADCAST_SECRET)' },
  }

  const allOk = Object.values(vars).every((v) => v.ok)

  return NextResponse.json({ allOk, vars })
}

export async function POST(req: Request) {
  // Test broadcast
  const { type } = await req.json()

  if (type === 'telegram') {
    const workerUrl = process.env.CLOUDFLARE_WORKER_URL
    const secret    = process.env.CLOUDFLARE_BROADCAST_SECRET

    if (!workerUrl || !secret || workerUrl.includes('ВСТАВИТЬ') || secret.includes('ПРИДУМАТЬ')) {
      return NextResponse.json({ ok: false, error: 'CLOUDFLARE_WORKER_URL или CLOUDFLARE_BROADCAST_SECRET не настроены' })
    }

    try {
      const res = await fetch(`${workerUrl}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
        body: JSON.stringify({ message: '🧪 *Тест уведомлений*\n\nЭто тестовое сообщение из админ-панели «Молодости».\n\nЕсли вы его видите — всё работает! ✅' }),
      })
      const json = await res.json()
      return NextResponse.json({ ok: res.ok, result: json })
    } catch (e) {
      return NextResponse.json({ ok: false, error: String(e) })
    }
  }

  if (type === 'sheets') {
    const url = process.env.GOOGLE_SCRIPT_URL
    if (!url || url.includes('ВСТАВИТЬ')) {
      return NextResponse.json({ ok: false, error: 'GOOGLE_SCRIPT_URL не настроен' })
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Тест', phone: '+7 000 000 00 00', type: 'Тест',
          message: 'Тестовая заявка из админки', source: 'Тест',
        }),
      })
      const json = await res.json()
      return NextResponse.json({ ok: res.ok, result: json })
    } catch (e) {
      return NextResponse.json({ ok: false, error: String(e) })
    }
  }

  return NextResponse.json({ error: 'unknown type' }, { status: 400 })
}
