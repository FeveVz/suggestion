import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'
import { getAdminSession, computeCobroEstado } from '@/lib/api-utils'
import { normalizePago } from '@/lib/normalize'

// GET /api/pagos
// Query params: ?cobroId=<id>  (required)
// Auth: required
//
// NOTA: Actualmente requiere ?cobroId. Para vista de dashboard "pagos del mes",
// agregar filtros ?desde=&hasta= en Fase 3.
export async function GET(request: NextRequest) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const cobroId = searchParams.get('cobroId')

  if (!cobroId) {
    return NextResponse.json(
      { error: 'El parámetro cobroId es requerido' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('Pago')
    .select('*')
    .eq('cobroId', cobroId)
    .order('fecha', { ascending: true })

  if (error) {
    console.error('GET /api/pagos error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json((data ?? []).map(normalizePago))
}

// POST /api/pagos
// Body: { cobroId, monto, fecha, metodo, referencia?, notas? }
// Auth: required
//
// Critical sequence:
//   1. Fetch cobro (verify it exists and is not 'anulado')
//   2. Sum existing pagos → derive saldoPendiente
//   3. Validate new monto <= saldoPendiente (400 with detail if exceeded)
//   4. INSERT pago
//   5. Re-sum pagos → compute new estado → UPDATE cobro.estado
//   6. Return 201 with { pago, cobroEstado }
//
// NOTE on race conditions: this system is single-admin (hardcoded credentials).
// Concurrent inserts are not a practical risk at current scale.
// If multiple users are added in the future, migrate this sequence to a
// Supabase RPC (PostgreSQL function) for atomic check-and-insert.
export async function POST(request: NextRequest) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { cobroId, monto, fecha, metodo, referencia, notas } = body

  if (!cobroId || monto === undefined || !fecha || !metodo) {
    return NextResponse.json(
      { error: 'Campos requeridos: cobroId, monto, fecha, metodo' },
      { status: 400 }
    )
  }

  const validMetodos = ['yape', 'plin', 'transferencia', 'efectivo', 'deposito']
  if (!validMetodos.includes(metodo as string)) {
    return NextResponse.json(
      { error: `metodo debe ser uno de: ${validMetodos.join(', ')}` },
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

  // Step 1: Fetch cobro
  const { data: cobro, error: cobroError } = await supabase
    .from('Cobro')
    .select('id, total, estado, fechaVencimiento')
    .eq('id', cobroId as string)
    .single()

  if (cobroError) {
    if (cobroError.code === 'PGRST116') {
      return NextResponse.json({ error: 'Cobro no encontrado' }, { status: 404 })
    }
    console.error('POST /api/pagos — fetch cobro error:', cobroError)
    return NextResponse.json({ error: cobroError.message }, { status: 500 })
  }

  if (cobro.estado === 'anulado') {
    return NextResponse.json(
      { error: 'No se pueden registrar pagos en un cobro anulado' },
      { status: 409 }
    )
  }

  if (cobro.estado === 'pagado') {
    return NextResponse.json(
      { error: 'Este cobro ya está completamente pagado' },
      { status: 409 }
    )
  }

  // Step 2: Sum existing pagos
  const { data: pagosData, error: pagosError } = await supabase
    .from('Pago')
    .select('monto')
    .eq('cobroId', cobroId as string)

  if (pagosError) {
    console.error('POST /api/pagos — fetch pagos error:', pagosError)
    return NextResponse.json({ error: pagosError.message }, { status: 500 })
  }

  const montoPagadoActual = (pagosData ?? []).reduce((sum, p) => sum + Number(p.monto), 0)
  const cobroTotal = Number(cobro.total)
  const saldoPendiente = cobroTotal - montoPagadoActual

  // Step 3: Validate monto <= saldoPendiente
  if (montoNum > saldoPendiente + 0.001) { // +0.001 tolerance for floating point
    return NextResponse.json(
      {
        error: `El monto (${montoNum}) supera el saldo pendiente del cobro (${saldoPendiente.toFixed(2)})`,
        detail: {
          cobroTotal,
          montoPagado: montoPagadoActual,
          saldoPendiente: Number(saldoPendiente.toFixed(2)),
        },
      },
      { status: 400 }
    )
  }

  // Step 4: INSERT pago
  const { data: nuevoPago, error: insertError } = await supabase
    .from('Pago')
    .insert({
      id: uuidv4(),
      cobroId,
      monto: montoNum,
      fecha,
      metodo,
      referencia: referencia ?? null,
      notas: notas ?? null,
    })
    .select()
    .single()

  if (insertError) {
    console.error('POST /api/pagos — insert error:', insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Step 5: Re-sum and compute new estado
  const montoPagadoNuevo = montoPagadoActual + montoNum
  const nuevoEstado = computeCobroEstado(cobroTotal, montoPagadoNuevo, cobro.fechaVencimiento)

  const { error: updateError } = await supabase
    .from('Cobro')
    .update({ estado: nuevoEstado })
    .eq('id', cobroId as string)

  if (updateError) {
    // Pago was inserted but estado update failed — log and surface to caller
    console.error('POST /api/pagos — update cobro estado error:', updateError)
    return NextResponse.json(
      {
        error: 'Pago registrado pero no se pudo actualizar el estado del cobro',
        pago: normalizePago(nuevoPago),
      },
      { status: 207 }
    )
  }

  // Step 6: Return 201
  return NextResponse.json(
    {
      pago: normalizePago(nuevoPago),
      cobroEstado: nuevoEstado,
    },
    { status: 201 }
  )
}
