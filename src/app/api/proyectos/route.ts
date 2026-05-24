import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/api-utils'
import { normalizeProyecto } from '@/lib/normalize'

// GET /api/proyectos
// Query params: ?clienteId=<id>  (optional filter)
// Auth: required (admin only)
export async function GET(request: NextRequest) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const clienteId = searchParams.get('clienteId')

  let query = supabase
    .from('Proyecto')
    .select('*, Client(id, name)')
    .order('createdAt', { ascending: false })

  if (clienteId) {
    query = query.eq('clienteId', clienteId)
  }

  const { data, error } = await query

  if (error) {
    console.error('GET /api/proyectos error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json((data ?? []).map(normalizeProyecto))
}

// POST /api/proyectos
// Body: { clienteId, nombre, tipo, subtotal, igv?, moneda?, estado?, responsableInterno?,
//         fechaInicio, fechaFin?, notas?, clientServiceId? }
// Auth: required
// NOTE: 'total' is a GENERATED ALWAYS AS column — never include in INSERT.
export async function POST(request: NextRequest) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { clienteId, nombre, tipo, subtotal, igv, moneda, estado,
          responsableInterno, fechaInicio, fechaFin, notas, clientServiceId } = body

  // Required fields
  if (!clienteId || !nombre || !tipo || subtotal === undefined || !fechaInicio) {
    return NextResponse.json(
      { error: 'Campos requeridos: clienteId, nombre, tipo, subtotal, fechaInicio' },
      { status: 400 }
    )
  }

  const validTipos = ['retainer', 'proyecto', 'consultoria']
  if (!validTipos.includes(tipo as string)) {
    return NextResponse.json(
      { error: `tipo debe ser uno de: ${validTipos.join(', ')}` },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('Proyecto')
    .insert({
      id: uuidv4(),
      clienteId,
      clientServiceId: clientServiceId ?? null,
      nombre,
      tipo,
      subtotal: Number(subtotal),
      igv: Number(igv ?? 0),
      // total: GENERATED ALWAYS AS (subtotal + igv) — excluded intentionally
      moneda: moneda ?? 'PEN',
      estado: estado ?? 'propuesta',
      responsableInterno: responsableInterno ?? null,
      fechaInicio,
      fechaFin: fechaFin ?? null,
      notas: notas ?? null,
    })
    .select('*, Client(id, name)')
    .single()

  if (error) {
    console.error('POST /api/proyectos error:', error)
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'El clienteId o clientServiceId no existe' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(normalizeProyecto(data), { status: 201 })
}
