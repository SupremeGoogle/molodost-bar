import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { pushFile } from '@/lib/github'

interface LeadData {
  name: string
  phone: string
  type: string
  guests?: string
  date?: string
  message?: string
  source?: string
}

interface Lead extends LeadData {
  id: string
  createdAt: string
  status: 'new' | 'called' | 'done'
}

const LEADS_PATH = path.join(process.cwd(), 'content', 'leads.json')

function readLeads(): Lead[] {
  try {
    return JSON.parse(fs.readFileSync(LEADS_PATH, 'utf-8'))
  } catch {
    return []
  }
}

function buildTgMessage(data: LeadData): string {
  const emoji: Record<string, string> = {
    'Бронирование стола': '🪑',
    'Мероприятие': '🎉',
    'Вопрос': '💬',
    'Другое': '📋',
  }
  return [
    `🔔 *Новая заявка — Молодость*`,
    ``,
    `👤 *Имя:* ${data.name}`,
    `📞 *Телефон:* ${data.phone}`,
    `${emoji[data.type] ?? '📋'} *Тип:* ${data.type}`,
    data.guests   ? `👥 *Гостей:* ${data.guests}` : '',
    data.date     ? `📅 *Дата:* ${data.date}` : '',
    data.message  ? `💬 *Сообщение:* ${data.message}` : '',
    `🌐 *Источник:* ${data.source ?? 'Сайт'}`,
  ].filter(Boolean).join('\n')
}

async function saveLead(lead: Lead) {
  const leads = readLeads()
  leads.unshift(lead) // newest first
  const json = JSON.stringify(leads, null, 2)
  fs.writeFileSync(LEADS_PATH, json, 'utf-8')
  // Push to GitHub so leads persist on Vercel
  await pushFile('content/leads.json', json, `📥 Новая заявка от ${lead.name}`)
}

async function sendToGoogleSheets(data: LeadData) {
  const url = process.env.GOOGLE_SCRIPT_URL
  if (!url || url.includes('ВСТАВИТЬ')) return
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => null)
}

async function broadcastTelegram(message: string) {
  const workerUrl = process.env.CLOUDFLARE_WORKER_URL
  const secret    = process.env.CLOUDFLARE_BROADCAST_SECRET
  if (!workerUrl || !secret || secret.includes('ПРИДУМАТЬ')) return
  await fetch(`${workerUrl}/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify({ message }),
  }).catch(() => null)
}

export async function GET() {
  const leads = readLeads()
  return NextResponse.json(leads)
}

export async function POST(req: Request) {
  try {
    const data: LeadData = await req.json()

    if (!data.name?.trim() || !data.phone?.trim()) {
      return NextResponse.json({ error: 'Имя и телефон обязательны' }, { status: 400 })
    }

    const lead: Lead = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: 'new',
    }

    await Promise.all([
      saveLead(lead),
      sendToGoogleSheets(data),
      broadcastTelegram(buildTgMessage(data)),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ошибка' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  // Update lead status from admin
  try {
    const { id, status } = await req.json()
    const leads = readLeads()
    const lead = leads.find((l) => l.id === id)
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    lead.status = status
    const json = JSON.stringify(leads, null, 2)
    fs.writeFileSync(LEADS_PATH, json, 'utf-8')
    await pushFile('content/leads.json', json, `✏️ Статус заявки обновлён`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
