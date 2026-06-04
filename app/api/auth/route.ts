import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { password } = await req.json()
  const correct = process.env.ADMIN_PASSWORD

  if (!correct) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD не задан в переменных окружения' }, { status: 500 })
  }

  if (password !== correct) {
    return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
