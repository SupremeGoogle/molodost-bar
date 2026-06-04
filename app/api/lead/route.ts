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

async function sendToGoogleSheets(data: LeadData) {
  const url = process.env.GOOGLE_SCRIPT_URL
  if (!url) return

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

async function sendToTelegram(data: LeadData) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

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
    `${typeEmoji[data.type] || '📋'} *Тип:* ${data.type}`,
    data.guests ? `👥 *Гостей:* ${data.guests}` : '',
    data.date ? `📅 *Дата:* ${data.date}` : '',
    data.message ? `💬 *Сообщение:* ${data.message}` : '',
    `🌐 *Источник:* ${data.source || 'Сайт'}`,
  ].filter(Boolean).join('\n')

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines,
      parse_mode: 'Markdown',
    }),
  })
}

export async function POST(req: Request) {
  try {
    const data: LeadData = await req.json()

    if (!data.name || !data.phone) {
      return NextResponse.json({ error: 'Имя и телефон обязательны' }, { status: 400 })
    }

    await Promise.all([
      sendToGoogleSheets(data),
      sendToTelegram(data),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
