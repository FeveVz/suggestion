import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/api-utils'
import { normalizeGasto } from '@/lib/normalize'

// GET /api/gastos
// Query params:
//   ?proyectoId=<id>   (optional — filter by proyecto)
//   ?desde=YYYY-MM-DD  (optional — filter fechas >= desde)
//   ?hasta=YYYY-MM-DD  (optional — filter fechas <= hasta)
// Auth: required
export async function GET(request: NextRequest) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const proyectoId = searchParams.get('proyectoId')
  const desde      = searchParams.get('desde')
  const hasta      = searchParams.get('hasta')

  let query = supabase
    .from('Gasto')
    .select('*')
    .order('fecha', { ascending: false })

  if (proyectoId) query = query.eq('proyectoId', proyectoId)
  if (desde)      query = query.gte('fecha', desde)
  if (hasta)      query = query.lte('fecha', hasta)

  const { data, error } = await query

  if (error) {
    console.error('GET /api/gastos error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json((data ?? []).map(normalizeGasto))
}

// POST /api/gastos
// Body: { concepto, monto, fecha, moneda?, proyectoId?, categoria?, comprobante? }
// Auth: required
// NOTE: proyectoId is nullable — a gasto can be general (not tied to any proyecto).
export async function POST(request: NextRequest) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { concepto, monto, fecha, moneda, proyectoId, categoria, comprobante } = body

  if (!concepto || monto === undefined || !fecha) {
    return NextResponse.json(
      { error: 'Campos requeridos: concepto, monto, fecha' },
      { status: 400 }
    )
  }

  const montoNum = Number(monto)
  if (isNaN(montoNum) || montoNum <= 0) {
    return NextResponse.json(
      { error: 'monto debe ser un número positivo' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('Gasto')
    .insert({
      id: uuidv4(),
      proyectoId: proyectoId ?? null,
      concepto,
      monto: montoNum,
      moneda: moneda ?? 'PEN',
      fecha,
      categoria: categoria ?? null,
      comprobante: comprobante ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('POST /api/gastos error:', error)
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'El proyectoId no existe' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(normalizeGasto(data), { status: 201 })
}
