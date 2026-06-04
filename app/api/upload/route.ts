import { NextResponse } from 'next/server'
import { pushBinaryFile, deleteFile } from '@/lib/github'
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
  try {
    const { fileName, base64, folder, action } = await req.json()

    if (action === 'delete') {
      const filePath = `public/${folder}/${fileName}`
      // Delete from GitHub
      await deleteFile(filePath, `🗑️ Admin: delete ${fileName}`)
      // Delete locally
      const localPath = path.join(process.cwd(), 'public', folder, fileName)
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath)
      return NextResponse.json({ ok: true })
    }

    // Upload: save locally and push to GitHub
    const localPath = path.join(process.cwd(), 'public', folder, fileName)
    const buffer = Buffer.from(base64, 'base64')
    fs.writeFileSync(localPath, buffer)

    await pushBinaryFile(
      `public/${folder}/${fileName}`,
      base64,
      `📸 Admin: upload ${folder}/${fileName}`
    )

    return NextResponse.json({ ok: true, src: `/${folder}/${fileName}` })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
