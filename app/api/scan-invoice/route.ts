import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { getCurrentUser } from '@/lib/audit'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
const MAX_BYTES = 20 * 1024 * 1024

const TODAY = new Date().toISOString().slice(0, 10)

const EXTRACTION_PROMPT = `You are an inventory management assistant. Analyze this invoice or packing list image and extract all line items.

For each item return a JSON object with these exact fields:
- name: full product name (string)
- brand: manufacturer/brand name (string, empty string if unknown)
- model: model or part number (string, empty string if unknown)
- quantity: numeric quantity ordered or delivered (number, default 1)
- condition: "NEW", "USED", or "FAULTY" — default "NEW" unless stated otherwise
- category: best-match from: LAPTOP, DESKTOP, MONITOR, KEYBOARD, MOUSE, PERIPHERAL, PHONE, TABLET, SSD, HDD, PRINTER, SCANNER, CAMERA, NETWORKING, CABLE, ACCESSORY, SOFTWARE, FURNITURE, OTHER
- supplier: vendor/supplier name from the document header (string, empty string if not visible)
- purchaseDate: date in YYYY-MM-DD from the document (invoice or delivery date), default "${TODAY}" if none found
- description: one-line description (string, can be empty)
- serials: array of serial numbers listed for this item, otherwise []
- threshold: suggested low-stock threshold (number, default 5)

Return ONLY a valid JSON array. No markdown, no explanation, no code fences.`

export interface ScannedItem {
  name:         string
  brand:        string
  model:        string
  quantity:     number
  condition:    'NEW' | 'USED' | 'FAULTY'
  category:     string
  supplier:     string
  purchaseDate: string
  description:  string
  serials:      string[]
  threshold:    number
}

export async function POST(req: NextRequest) {
  const actor = await getCurrentUser()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WebP and PDF files are supported' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 20 MB limit' }, { status: 413 })
  }

  const bytes  = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { inlineData: { mimeType: file.type, data: base64 } },
        { text: EXTRACTION_PROMPT },
      ],
    })

    let text = (response.text ?? '').trim()
    // Strip markdown code fences if model wraps output anyway
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')

    const raw = JSON.parse(text)
    if (!Array.isArray(raw)) throw new Error('Response is not an array')

    const items: ScannedItem[] = raw.map((r: Record<string, unknown>) => ({
      name:         String(r.name         ?? '').trim(),
      brand:        String(r.brand        ?? '').trim(),
      model:        String(r.model        ?? '').trim(),
      quantity:     Math.max(1, Number(r.quantity) || 1),
      condition:    (['NEW', 'USED', 'FAULTY'] as const).includes(
                      String(r.condition).toUpperCase() as 'NEW' | 'USED' | 'FAULTY'
                    )
                      ? (String(r.condition).toUpperCase() as 'NEW' | 'USED' | 'FAULTY')
                      : 'NEW',
      category:     String(r.category     ?? 'OTHER').toUpperCase().trim(),
      supplier:     String(r.supplier     ?? '').trim(),
      purchaseDate: /^\d{4}-\d{2}-\d{2}$/.test(String(r.purchaseDate))
                      ? String(r.purchaseDate)
                      : TODAY,
      description:  String(r.description ?? '').trim(),
      serials:      Array.isArray(r.serials)
                      ? (r.serials as unknown[]).map(s => String(s).trim().toUpperCase()).filter(Boolean)
                      : [],
      threshold:    Math.max(1, Number(r.threshold) || 5),
    }))

    return NextResponse.json({ items })
  } catch (err) {
    console.error('[scan-invoice] extraction error:', err)
    return NextResponse.json(
      { error: 'Failed to extract items from image. Make sure the image is clear and try again.' },
      { status: 500 },
    )
  }
}
