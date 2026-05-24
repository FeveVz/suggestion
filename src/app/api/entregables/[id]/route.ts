import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/api-utils'
import { normalizeEntregable } from '@/lib/normalize'

// GET /api/entregables/[id]
// Auth: required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  const { id } = await params

  const { data, error } = await supabase
    .from('Entregable')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Entregable no encontrado' }, { status: 404 })
    }
    console.error(`GET /api/entregables/${id} error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(normalizeEntregable(data))
}

// PUT /api/entregables/[id]
// Body: any subset of Entregable fields (except id, proyectoId, createdAt)
// Auth: required
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
  const { id: _id, proyectoId: _pid, createdAt: _ca, ...updateFields } = body

  if (updateFields.estado !== undefined) {
    const validEstados = ['pendiente', 'en_proceso', 'entregado', 'aprobado', 'rechazado']
    if (!validEstados.includes(updateFields.estado as string)) {
      return NextResponse.json(
        { error: `estado debe ser uno de: ${validEstados.join(', ')}` },
        { status: 400 }
      )
    }
  }

  const { data, error } = await supabase
    .from('Entregable')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Entregable no encontrado' }, { status: 404 })
    }
    console.error(`PUT /api/entregables/${id} error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(normalizeEntregable(data))
}

// DELETE /api/entregables/[id]
// Auth: required
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  const { id } = await params

  const { error } = await supabase
    .from('Entregable')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`DELETE /api/entregables/${id} error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
