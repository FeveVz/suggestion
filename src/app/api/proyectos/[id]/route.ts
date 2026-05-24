import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/api-utils'
import { normalizeProyecto } from '@/lib/normalize'

// GET /api/proyectos/[id]
// Auth: required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  const { id } = await params

  const { data, error } = await supabase
    .from('Proyecto')
    .select('*, Client(id, name)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }
    console.error(`GET /api/proyectos/${id} error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(normalizeProyecto(data))
}

// PUT /api/proyectos/[id]
// Body: any subset of Proyecto fields (except generated: total)
// Auth: required
// NOTE: 'total' is a GENERATED ALWAYS AS column — never include in UPDATE.
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

  // Strip generated/immutable columns that must never be written
  const { total: _total, id: _id, createdAt: _ca, ...updateFields } = body

  if (updateFields.tipo !== undefined) {
    const validTipos = ['retainer', 'proyecto', 'consultoria']
    if (!validTipos.includes(updateFields.tipo as string)) {
      return NextResponse.json(
        { error: `tipo debe ser uno de: ${validTipos.join(', ')}` },
        { status: 400 }
      )
    }
  }

  if (updateFields.estado !== undefined) {
    const validEstados = ['propuesta', 'activo', 'pausado', 'cerrado', 'perdido']
    if (!validEstados.includes(updateFields.estado as string)) {
      return NextResponse.json(
        { error: `estado debe ser uno de: ${validEstados.join(', ')}` },
        { status: 400 }
      )
    }
  }

  // Coerce numeric fields
  if (updateFields.subtotal !== undefined) updateFields.subtotal = Number(updateFields.subtotal)
  if (updateFields.igv !== undefined)      updateFields.igv = Number(updateFields.igv)

  const { data, error } = await supabase
    .from('Proyecto')
    .update(updateFields)
    .eq('id', id)
    .select('*, Client(id, name)')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }
    console.error(`PUT /api/proyectos/${id} error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(normalizeProyecto(data))
}

// DELETE /api/proyectos/[id]
// Auth: required
// NOTE: ON DELETE RESTRICT on Cobro.proyectoId — Supabase returns 23503 if cobros exist.
//       ON DELETE CASCADE on Entregable.proyectoId — entregables are deleted automatically.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  const { id } = await params

  const { error } = await supabase
    .from('Proyecto')
    .delete()
    .eq('id', id)

  if (error) {
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'No se puede eliminar un proyecto con cobros registrados. Elimine los cobros primero.' },
        { status: 409 }
      )
    }
    console.error(`DELETE /api/proyectos/${id} error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
