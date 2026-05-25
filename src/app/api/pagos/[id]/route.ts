import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAdminSession, computeCobroEstado } from '@/lib/api-utils'
import { normalizePago } from '@/lib/normalize'

// GET /api/pagos/[id]
// Auth: required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  const { id } = await params

  const { data, error } = await supabase
    .from('Pago')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }
    console.error(`GET /api/pagos/${id} error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(normalizePago(data))
}

// PUT /api/pagos/[id]
// Body: any subset of { monto, fecha, metodo, referencia, notas }
// Auth: required
// NOTE: cobroId is immutable after creation. monto changes recalculate cobro.estado.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  const { id } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // Strip immutable fields
  const { id: _id, cobroId: _cid, createdAt: _ca, ...updateFields } = body

  if (updateFields.metodo !== undefined) {
    const validMetodos = ['yape', 'plin', 'transferencia', 'efectivo', 'deposito']
    if (!validMetodos.includes(updateFields.metodo as string)) {
      return NextResponse.json(
        { error: `metodo debe ser uno de: ${validMetodos.join(', ')}` },
        { status: 400 }
      )
    }
  }

  if (updateFields.monto !== undefined) {
    const montoNum = Number(updateFields.monto)
    if (isNaN(montoNum) || montoNum <= 0) {
      return NextResponse.json(
        { error: 'monto debe ser un número positivo' },
        { status: 400 }
      )
    }
    updateFields.monto = montoNum
  }

  // Fetch the existing pago to know its cobroId
  const { data: existingPago, error: fetchError } = await supabase
    .from('Pago')
    .select('id, cobroId, monto')
    .eq('id', id)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }
    console.error(`PUT /api/pagos/${id} — fetch error:`, fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  // If monto is changing, validate it doesn't exceed saldo
  if (updateFields.monto !== undefined) {
    const { data: cobro, error: cobroError } = await supabase
      .from('Cobro')
      .select('total, fechaVencimiento')
      .eq('id', existingPago.cobroId)
      .single()

    if (cobroError) {
      console.error(`PUT /api/pagos/${id} — fetch cobro error:`, cobroError)
      return NextResponse.json({ error: cobroError.message }, { status: 500 })
    }

    const { data: allPagos } = await supabase
      .from('Pago')
      .select('monto')
      .eq('cobroId', existingPago.cobroId)
      .neq('id', id) // exclude current pago — we're replacing its monto

    const otrosPagos = (allPagos ?? []).reduce((sum, p) => sum + Number(p.monto), 0)
    const cobroTotal = Number(cobro.total)
    const saldoDisponible = cobroTotal - otrosPagos

    if ((updateFields.monto as number) > saldoDisponible + 0.001) {
      return NextResponse.json(
        {
          error: `El monto (${updateFields.monto}) supera el saldo disponible del cobro (${saldoDisponible.toFixed(2)})`,
          detail: {
            cobroTotal,
            otrosPagos: Number(otrosPagos.toFixed(2)),
            saldoDisponible: Number(saldoDisponible.toFixed(2)),
          },
        },
        { status: 400 }
      )
    }
  }

  // Apply update
  const { data: updatedPago, error: updateError } = await supabase
    .from('Pago')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    console.error(`PUT /api/pagos/${id} error:`, updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // If monto changed, recompute cobro.estado
  if (updateFields.monto !== undefined) {
    const { data: cobro } = await supabase
      .from('Cobro')
      .select('total, fechaVencimiento')
      .eq('id', existingPago.cobroId)
      .single()

    const { data: allPagos } = await supabase
      .from('Pago')
      .select('monto')
      .eq('cobroId', existingPago.cobroId)

    const montoPagadoTotal = (allPagos ?? []).reduce((sum, p) => sum + Number(p.monto), 0)
    const nuevoEstado = computeCobroEstado(
      Number(cobro?.total ?? 0),
      montoPagadoTotal,
      cobro?.fechaVencimiento ?? ''
    )

    await supabase
      .from('Cobro')
      .update({ estado: nuevoEstado })
      .eq('id', existingPago.cobroId)
  }

  return NextResponse.json(normalizePago(updatedPago))
}

// DELETE /api/pagos/[id]
// Auth: required
// After deleting, recomputes cobro.estado based on remaining pagos.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  const { id } = await params

  // Fetch pago before deletion to know its cobroId
  const { data: pago, error: fetchError } = await supabase
    .from('Pago')
    .select('id, cobroId')
    .eq('id', id)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }
    console.error(`DELETE /api/pagos/${id} — fetch error:`, fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const { error: deleteError } = await supabase
    .from('Pago')
    .delete()
    .eq('id', id)

  if (deleteError) {
    console.error(`DELETE /api/pagos/${id} error:`, deleteError)
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  // Recompute cobro.estado after deletion
  const { data: cobro } = await supabase
    .from('Cobro')
    .select('total, fechaVencimiento, estado')
    .eq('id', pago.cobroId)
    .single()

  if (cobro && cobro.estado !== 'anulado') {
    const { data: remainingPagos } = await supabase
      .from('Pago')
      .select('monto')
      .eq('cobroId', pago.cobroId)

    const montoPagado = (remainingPagos ?? []).reduce((sum, p) => sum + Number(p.monto), 0)
    const nuevoEstado = computeCobroEstado(
      Number(cobro.total),
      montoPagado,
      cobro.fechaVencimiento
    )

    await supabase
      .from('Cobro')
      .update({ estado: nuevoEstado })
      .eq('id', pago.cobroId)
  }

  return new NextResponse(null, { status: 204 })
}
