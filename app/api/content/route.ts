import { NextResponse } from 'next/server'
import { getContent, saveContent } from '@/lib/content'

export async function GET() {
  try {
    const data = getContent()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to read content' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    saveContent(data)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
  }
}
