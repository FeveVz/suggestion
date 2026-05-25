import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/api-utils'
import { normalizeCobro } from '@/lib/normalize'

// GET /api/cobros/[id]
// Auth: required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  const { id } = await params

  const { data, error } = await supabase
    .from('Cobro')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Cobro no encontrado' }, { status: 404 })
    }
    console.error(`GET /api/cobros/${id} error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(normalizeCobro(data))
}

// PUT /api/cobros/[id]
// Body: any subset of Cobro fields (except generated: total, fechaVencimiento)
// Auth: required
//
// AJUSTE 2: If body includes fechaEmision OR diasCredito, and cobro has pagos registered,
// return 409 — changing the due date when payments exist would corrupt history.
//
// NOTE: 'total' and 'fechaVencimiento' are GENERATED ALWAYS AS columns — excluded from UPDATE.
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

  // Strip generated/immutable columns
  const { total: _t, fechaVencimiento: _fv, id: _id, createdAt: _ca, ...updateFields } = body

  // Validate enums if present
  if (updateFields.tipoDocumento !== undefined && updateFields.tipoDocumento !== null) {
    const validTipos = ['factura', 'boleta', 'recibo']
    if (!validTipos.includes(updateFields.tipoDocumento as string)) {
      return NextResponse.json(
        { error: `tipoDocumento debe ser uno de: ${validTipos.join(', ')}` },
        { status: 400 }
      )
    }
  }

  if (updateFields.estado !== undefined) {
    const validEstados = ['pendiente', 'parcial', 'pagado', 'vencido', 'anulado']
    if (!validEstados.includes(updateFields.estado as string)) {
      return NextResponse.json(
        { error: `estado debe ser uno de: ${validEstados.join(', ')}` },
        { status: 400 }
      )
    }
  }

  // AJUSTE 2: Block date edits if pagos exist
  if ('fechaEmision' in updateFields || 'diasCredito' in updateFields) {
    const { count, error: countError } = await supabase
      .from('Pago')
      .select('id', { count: 'exact', head: true })
      .eq('cobroId', id)

    if (countError) {
      console.error(`PUT /api/cobros/${id} — pagos count error:`, countError)
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            'No se pueden modificar las fechas de un cobro con pagos registrados. Anule los pagos primero.',
        },
        { status: 409 }
      )
    }
  }

  // Coerce numeric fields
  if (updateFields.subtotal !== undefined) updateFields.subtotal = Number(updateFields.subtotal)
  if (updateFields.igv !== undefined)      updateFields.igv = Number(updateFields.igv)
  if (updateFields.diasCredito !== undefined) updateFields.diasCredito = Number(updateFields.diasCredito)

  const { data, error } = await supabase
    .from('Cobro')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Cobro no encontrado' }, { status: 404 })
    }
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Ya existe un cobro con ese tipoDocumento y numeroDocumento' },
        { status: 409 }
      )
    }
    console.error(`PUT /api/cobros/${id} error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(normalizeCobro(data))
}

// DELETE /api/cobros/[id]
// Auth: required
// NOTE: ON DELETE RESTRICT on Pago.cobroId — returns 409 if pagos exist.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  const { id } = await params

  const { error } = await supabase
    .from('Cobro')
    .delete()
    .eq('id', id)

  if (error) {
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'No se puede eliminar un cobro con pagos registrados. Elimine los pagos primero.' },
        { status: 409 }
      )
    }
    console.error(`DELETE /api/cobros/${id} error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
