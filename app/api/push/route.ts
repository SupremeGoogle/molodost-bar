import { NextResponse } from 'next/server'
import { getContent, saveContent } from '@/lib/content'
import { pushFile } from '@/lib/github'

export async function POST(req: Request) {
  try {
    const { data } = await req.json()

    // Save locally first
    saveContent(data)

    // Push to GitHub
    const content = JSON.stringify(data, null, 2)
    await pushFile(
      'content/data.json',
      content,
      '🔧 Admin: update site content'
    )

    return NextResponse.json({ ok: true, message: 'Изменения сохранены и отправлены в GitHub!' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
