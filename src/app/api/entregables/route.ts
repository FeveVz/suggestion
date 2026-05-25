import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/api-utils'
import { normalizeEntregable } from '@/lib/normalize'

// GET /api/entregables
// Query params: ?proyectoId=<id>  (required — entregables are always scoped to a proyecto)
// Auth: required
export async function GET(request: NextRequest) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const proyectoId = searchParams.get('proyectoId')

  // proyectoId es opcional:
  //   - Con ?proyectoId=x  → filtrar por proyecto (comportamiento original)
  //   - Sin ?proyectoId    → devolver todos, limitado a 100 para rendimiento
  let query = supabase
    .from('Entregable')
    .select('*')
    .order('fechaCompromiso', { ascending: true })

  if (proyectoId) {
    query = query.eq('proyectoId', proyectoId)
  } else {
    query = query.limit(100)
  }

  const { data, error } = await query

  if (error) {
    console.error('GET /api/entregables error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json((data ?? []).map(normalizeEntregable))
}

// POST /api/entregables
// Body: { proyectoId, nombre, fechaCompromiso, descripcion?, estado?, responsable?, evidenciaUrl? }
// Auth: required
export async function POST(request: NextRequest) {
  const auth = getAdminSession(request)
  if (!auth.ok) return auth.response

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { proyectoId, nombre, fechaCompromiso, descripcion,
          estado, responsable, evidenciaUrl } = body

  if (!proyectoId || !nombre || !fechaCompromiso) {
    return NextResponse.json(
      { error: 'Campos requeridos: proyectoId, nombre, fechaCompromiso' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('Entregable')
    .insert({
      id: uuidv4(),
      proyectoId,
      nombre,
      descripcion: descripcion ?? null,
      fechaCompromiso,
      estado: estado ?? 'pendiente',
      responsable: responsable ?? null,
      evidenciaUrl: evidenciaUrl ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('POST /api/entregables error:', error)
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'El proyectoId no existe' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(normalizeEntregable(data), { status: 201 })
}
