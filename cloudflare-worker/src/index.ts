/**
 * Молодость — Telegram Worker
 *
 * Endpoints:
 *   POST /webhook   — Telegram отправляет сюда все сообщения бота
 *   POST /broadcast — Next.js вызывает для рассылки заявки подписчикам
 *   GET  /subscribers — список подписчиков (для отладки)
 *
 * Команды бота:
 *   /start      — приветствие
 *   /molodost   — подписаться на уведомления
 *   /stop       — отписаться
 */

export interface Env {
  TELEGRAM_BOT_TOKEN: string   // секрет Cloudflare
  BROADCAST_SECRET: string     // секрет Cloudflare (совпадает с env Next.js)
  SUBSCRIBERS: KVNamespace     // KV-хранилище подписчиков
}

interface TgChat {
  id: number
  username?: string
  first_name?: string
  type: string
}

interface TgUpdate {
  message?: {
    chat: TgChat
    text?: string
    from?: { id: number; first_name?: string; username?: string }
  }
}

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })

    const { pathname } = new URL(request.url)

    if (pathname === '/webhook' && request.method === 'POST')
      return webhook(request, env)

    if (pathname === '/broadcast' && request.method === 'POST')
      return broadcast(request, env)

    if (pathname === '/subscribers' && request.method === 'GET')
      return subscribers(env)

    return ok({ status: 'Молодость TG Worker работает' })
  },
}

// ─── /webhook ────────────────────────────────────────────────────────────────

async function webhook(req: Request, env: Env): Promise<Response> {
  try {
    const update: TgUpdate = await req.json()
    const msg = update.message
    if (!msg?.text) return ok({ ok: true })

    const chat = msg.chat
    const text = msg.text.trim().split(' ')[0].split('@')[0].toLowerCase()

    if (text === '/start') {
      await send(env, chat.id,
        `👋 *Привет, ${msg.from?.first_name ?? 'друг'}!*\n\n` +
        `Это бот кафе-бара *«Молодость»* — Липецк.\n\n` +
        `📲 /molodost — подписаться на новые заявки с сайта\n` +
        `🚫 /stop — отписаться`
      )
      return ok({ ok: true })
    }

    if (text === '/molodost') {
      const subs = await getSubs(env)
      if (subs.includes(chat.id)) {
        await send(env, chat.id, 'ℹ️ Вы уже подписаны на уведомления.')
      } else {
        subs.push(chat.id)
        await saveSubs(env, subs)
        await env.SUBSCRIBERS.put(`sub:${chat.id}`, JSON.stringify({
          chat_id: chat.id,
          username: chat.username ?? '',
          first_name: msg.from?.first_name ?? '',
          subscribed_at: new Date().toISOString(),
        }))
        await send(env, chat.id,
          `✅ *Вы подписаны!*\n\n` +
          `Теперь при каждой новой заявке с сайта molodost.bar вы получите уведомление.\n\n` +
          `Для отписки: /stop`
        )
      }
      return ok({ ok: true })
    }

    if (text === '/stop') {
      const subs = await getSubs(env)
      const filtered = subs.filter((id) => id !== chat.id)
      if (filtered.length < subs.length) {
        await saveSubs(env, filtered)
        await env.SUBSCRIBERS.delete(`sub:${chat.id}`)
        await send(env, chat.id, '🚫 Вы отписались от уведомлений.')
      } else {
        await send(env, chat.id, 'Вы не были подписаны.')
      }
      return ok({ ok: true })
    }

    return ok({ ok: true })
  } catch (e) {
    return ok({ ok: false, error: String(e) })
  }
}

// ─── /broadcast ──────────────────────────────────────────────────────────────

async function broadcast(req: Request, env: Env): Promise<Response> {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${env.BROADCAST_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS })
  }

  const { message } = await req.json() as { message: string }
  if (!message) return Response.json({ error: 'message required' }, { status: 400, headers: CORS })

  const subs = await getSubs(env)
  if (subs.length === 0) return ok({ ok: true, sent: 0, total: 0, msg: 'Нет подписчиков' })

  const blocked: number[] = []
  const results = await Promise.allSettled(
    subs.map(async (chatId) => {
      const res = await send(env, chatId, message)
      if (!res.ok) {
        const err = await res.json() as { error_code?: number }
        // бот заблокирован или чат удалён — убираем подписчика
        if (err.error_code === 403 || err.error_code === 400) {
          blocked.push(chatId)
        }
        throw new Error(JSON.stringify(err))
      }
    })
  )

  // Удаляем заблокированных
  if (blocked.length > 0) {
    const clean = subs.filter((id) => !blocked.includes(id))
    await saveSubs(env, clean)
    for (const id of blocked) await env.SUBSCRIBERS.delete(`sub:${id}`)
  }

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return ok({ ok: true, sent, failed, total: subs.length, removed_blocked: blocked.length })
}

// ─── /subscribers ─────────────────────────────────────────────────────────────

async function subscribers(env: Env): Promise<Response> {
  const subs = await getSubs(env)
  const details = await Promise.all(
    subs.map(async (id) => {
      const raw = await env.SUBSCRIBERS.get(`sub:${id}`)
      return raw ? JSON.parse(raw) : { chat_id: id }
    })
  )
  return ok({ count: subs.length, subscribers: details })
}

// ─── helpers ─────────────────────────────────────────────────────────────────

async function getSubs(env: Env): Promise<number[]> {
  const raw = await env.SUBSCRIBERS.get('list')
  return raw ? JSON.parse(raw) : []
}

async function saveSubs(env: Env, subs: number[]): Promise<void> {
  await env.SUBSCRIBERS.put('list', JSON.stringify(subs))
}

async function send(env: Env, chatId: number, text: string): Promise<Response> {
  return fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  })
}

function ok(data: unknown): Response {
  return Response.json(data, { headers: CORS })
}
