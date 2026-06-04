import { NextResponse } from 'next/server'

interface LeadData {
  name: string
  phone: string
  type: string
  guests?: string
  date?: string
  message?: string
  source?: string
}

function buildTgMessage(data: LeadData): string {
  const typeEmoji: Record<string, string> = {
    'Бронирование стола': '🪑',
    'Мероприятие': '🎉',
    'Вопрос': '💬',
    'Другое': '📋',
  }

  const lines = [
    `🔔 *Новая заявка — Молодость*`,
    ``,
    `👤 *Имя:* ${data.name}`,
    `📞 *Телефон:* ${data.phone}`,
    `${typeEmoji[data.type] ?? '📋'} *Тип:* ${data.type}`,
    data.guests ? `👥 *Гостей:* ${data.guests}` : '',
    data.date   ? `📅 *Дата:* ${data.date}` : '',
    data.message ? `💬 *Сообщение:* ${data.message}` : '',
    `🌐 *Источник:* ${data.source ?? 'Сайт'}`,
  ].filter(Boolean)

  return lines.join('\n')
}

async function sendToGoogleSheets(data: LeadData) {
  const url = process.env.GOOGLE_SCRIPT_URL
  if (!url) return
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

async function broadcastViaClouflare(message: string) {
  const workerUrl = process.env.CLOUDFLARE_WORKER_URL
  const secret    = process.env.CLOUDFLARE_BROADCAST_SECRET
  if (!workerUrl || !secret) return

  await fetch(`${workerUrl}/broadcast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${secret}`,
    },
    body: JSON.stringify({ message }),
  })
}

export async function POST(req: Request) {
  try {
    const data: LeadData = await req.json()

    if (!data.name || !data.phone) {
      return NextResponse.json({ error: 'Имя и телефон обязательны' }, { status: 400 })
    }

    const message = buildTgMessage(data)

    await Promise.all([
      sendToGoogleSheets(data),
      broadcastViaClouflare(message),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
