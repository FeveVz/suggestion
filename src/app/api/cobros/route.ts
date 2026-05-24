import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/api-utils'
import { normalizeCobro } from '@/lib/normalize'

// GET /api/cobros
// Query params: ?proyectoId=<id>  (optional filter)
// Auth: required
//
// NOTA: Este UPDATE en lote dentro de un GET es un side-effect intencional
// para mantener la DB consistente sin cron job. Aceptable para el volumen actual
// (< 1000 cobros). Para volúmenes mayores, migrar a job nocturno.
export async function GET(request: NextRequest) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const proyectoId = searchParams.get('proyectoId')

  // Lazy vencidos update: mark overdue cobros that still have estado='pendiente'
  // (montoPagado == 0 is implied — parcial/pagado cobros are never 'pendiente')
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const vencidosQuery = supabase
    .from('Cobro')
    .update({ estado: 'vencido' })
    .eq('estado', 'pendiente')
    .lt('fechaVencimiento', today)

  // Apply proyectoId filter to the lazy update too, to keep scope narrow
  if (proyectoId) {
    await vencidosQuery.eq('proyectoId', proyectoId)
  } else {
    await vencidosQuery
  }

  // Now fetch the (updated) list
  let query = supabase
    .from('Cobro')
    .select('*')
    .order('fechaEmision', { ascending: false })

  if (proyectoId) {
    query = query.eq('proyectoId', proyectoId)
  }

  const { data, error } = await query

  if (error) {
    console.error('GET /api/cobros error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json((data ?? []).map(normalizeCobro))
}

// POST /api/cobros
// Body: { proyectoId, concepto, subtotal, igv?, moneda?, tipoDocumento?, numeroDocumento?,
//         fechaEmision, diasCredito? }
// Auth: required
// NOTE: 'total' and 'fechaVencimiento' are GENERATED ALWAYS AS columns — excluded from INSERT.
export async function POST(request: NextRequest) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { proyectoId, concepto, subtotal, igv, moneda,
          tipoDocumento, numeroDocumento, fechaEmision, diasCredito } = body

  if (!proyectoId || !concepto || subtotal === undefined || !fechaEmision) {
    return NextResponse.json(
      { error: 'Campos requeridos: proyectoId, concepto, subtotal, fechaEmision' },
      { status: 400 }
    )
  }

  if (tipoDocumento !== undefined && tipoDocumento !== null) {
    const validTipos = ['factura', 'boleta', 'recibo']
    if (!validTipos.includes(tipoDocumento as string)) {
      return NextResponse.json(
        { error: `tipoDocumento debe ser uno de: ${validTipos.join(', ')}` },
        { status: 400 }
      )
    }
  }

  const { data, error } = await supabase
    .from('Cobro')
    .insert({
      id: uuidv4(),
      proyectoId,
      concepto,
      subtotal: Number(subtotal),
      igv: Number(igv ?? 0),
      // total: GENERATED ALWAYS AS (subtotal + igv) — excluded intentionally
      moneda: moneda ?? 'PEN',
      tipoDocumento: tipoDocumento ?? null,
      numeroDocumento: numeroDocumento ?? null,
      fechaEmision,
      diasCredito: Number(diasCredito ?? 0),
      // fechaVencimiento: GENERATED ALWAYS AS (fechaEmision + diasCredito) — excluded
      estado: 'pendiente',
    })
    .select()
    .single()

  if (error) {
    console.error('POST /api/cobros error:', error)
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'El proyectoId no existe' },
        { status: 400 }
      )
    }
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Ya existe un cobro con ese tipoDocumento y numeroDocumento' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(normalizeCobro(data), { status: 201 })
}
