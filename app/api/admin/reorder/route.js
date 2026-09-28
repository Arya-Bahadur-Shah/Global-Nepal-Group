import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import {
  reorderIndustrialSolutions,
  reorderIndustries,
  reorderSolutions,
} from '@/lib/admin-data'

const HANDLERS = {
  'industrial-solutions': reorderIndustrialSolutions,
  industries: reorderIndustries,
  solutions: reorderSolutions,
}

export async function POST(request) {
  try {
    await requireSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { table, ids } = body ?? {}
  const handler = HANDLERS[table]

  if (!handler) {
    return NextResponse.json(
      { error: `Unknown table "${table}". Expected one of: ${Object.keys(HANDLERS).join(', ')}` },
      { status: 400 }
    )
  }

  if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'number')) {
    return NextResponse.json({ error: '`ids` must be an array of numbers' }, { status: 400 })
  }

  await handler(ids)

  return NextResponse.json({ ok: true })
}
