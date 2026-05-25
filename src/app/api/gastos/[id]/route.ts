import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/api-utils'
import { normalizeGasto } from '@/lib/normalize'

// GET /api/gastos/[id]
// Auth: required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  const { id } = await params

  const { data, error } = await supabase
    .from('Gasto')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 })
    }
    console.error(`GET /api/gastos/${id} error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(normalizeGasto(data))
}

// PUT /api/gastos/[id]
// Body: any subset of Gasto fields (except id, createdAt)
// Auth: required
// NOTE: proyectoId CAN be changed (or set to null to make it a gasto general).
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
  const { id: _id, createdAt: _ca, ...updateFields } = body

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

  if (updateFields.moneda !== undefined) {
    if (!['PEN', 'USD'].includes(updateFields.moneda as string)) {
      return NextResponse.json(
        { error: 'moneda debe ser PEN o USD' },
        { status: 400 }
      )
    }
  }

  const { data, error } = await supabase
    .from('Gasto')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 })
    }
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'El proyectoId no existe' },
        { status: 400 }
      )
    }
    console.error(`PUT /api/gastos/${id} error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(normalizeGasto(data))
}

// DELETE /api/gastos/[id]
// Auth: required
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  const { id } = await params

  const { error } = await supabase
    .from('Gasto')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`DELETE /api/gastos/${id} error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
