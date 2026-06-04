import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const LEADS_PATH = path.join(process.cwd(), 'content', 'leads.json')

function escapeCSV(val: string | undefined): string {
  if (!val) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET(req: Request) {
  // Simple token auth so the URL is not fully public
  const token = new URL(req.url).searchParams.get('token')
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || token !== expected) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  let leads: Record<string, string>[] = []
  try {
    leads = JSON.parse(fs.readFileSync(LEADS_PATH, 'utf-8'))
  } catch {
    leads = []
  }

  const headers = ['Дата', 'Имя', 'Телефон', 'Тип', 'Гостей', 'Дата визита', 'Сообщение', 'Статус', 'Источник']

  const rows = leads.map((l) => [
    new Date(l.createdAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }),
    l.name, l.phone, l.type,
    l.guests || '', l.date || '', l.message || '',
    l.status === 'new' ? 'Новая' : l.status === 'called' ? 'Позвонили' : 'Готово',
    l.source || 'Сайт',
  ].map(escapeCSV).join(','))

  const csv = [headers.join(','), ...rows].join('\r\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
