import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir }          from 'fs/promises'
import path                          from 'path'
import { getCurrentUser }            from '@/lib/audit'

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
}

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  // Must be authenticated
  const actor = await getCurrentUser()
  if (!actor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await req.formData()
  const file = form.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate MIME type against allowlist
  const ext = ALLOWED[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WebP and GIF are allowed' }, { status: 400 })
  }

  // Enforce size limit
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 5 MB limit' }, { status: 413 })
  }

  // Use extension derived from MIME type, never from the client filename
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const dir      = path.join(process.cwd(), 'public', 'uploads', 'items')
  const filepath = path.join(dir, filename)

  await mkdir(dir, { recursive: true })
  await writeFile(filepath, Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ url: `/uploads/items/${filename}` })
}
