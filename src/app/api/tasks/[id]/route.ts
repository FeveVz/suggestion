import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isValidSession, parseTalentSessionToken } from '@/lib/auth'
import { normalizeTask } from '@/lib/normalize'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: task, error } = await supabase
      .from('Task')
      .select('*, Talent(*), Service(*), Client(id, name)')
      .eq('id', id)
      .single()

    if (error || !task) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })
    }

    return NextResponse.json(normalizeTask(task as Record<string, unknown>))
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Error fetching task' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const adminCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('suggestion_session='))
      ?.split('=')[1]

    const talentCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('suggestion_talent_session='))
      ?.split('=')[1]

    const isAdmin = isValidSession(adminCookie)
    const talentId = parseTalentSessionToken(talentCookie)

    if (!isAdmin && !talentId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verify task exists
    const { data: existing } = await supabase
      .from('Task')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })
    }

    // If talent (not admin), only allow status change on their own tasks
    if (talentId && !isAdmin) {
      if (existing.talentId !== talentId) {
        return NextResponse.json({ error: 'No autorizado para modificar esta tarea' }, { status: 403 })
      }
      // Talent can only update status and additionalInfo
      const { status, additionalInfo } = body
      const { data: task, error: updateError } = await supabase
        .from('Task')
        .update({
          status: status || existing.status,
          additionalInfo: additionalInfo !== undefined ? additionalInfo : existing.additionalInfo,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, Talent(*), Service(*), Client(id, name)')
        .single()

      if (updateError || !task) {
        return NextResponse.json({ error: 'Error updating task' }, { status: 500 })
      }

      return NextResponse.json(normalizeTask(task as Record<string, unknown>))
    }

    // Admin can update all fields
    const { title, description, status, priority, deadline, talentId: newTalentId, clientServiceId, serviceId, clientId, additionalInfo } = body

    const updateData: Record<string, unknown> = {
      title: title || existing.title,
      description: description !== undefined ? description : existing.description,
      status: status || existing.status,
      priority: priority || existing.priority,
      deadline: deadline !== undefined ? deadline : existing.deadline,
      talentId: newTalentId !== undefined ? newTalentId : existing.talentId,
      clientServiceId: clientServiceId !== undefined ? clientServiceId : existing.clientServiceId,
      serviceId: serviceId || existing.serviceId,
      clientId: clientId || existing.clientId,
      additionalInfo: additionalInfo !== undefined ? additionalInfo : existing.additionalInfo,
      updatedAt: new Date().toISOString(),
    }

    const { data: task, error: updateError } = await supabase
      .from('Task')
      .update(updateData)
      .eq('id', id)
      .select('*, Talent(*), Service(*), Client(id, name)')
      .single()

    if (updateError || !task) {
      console.error('Error updating task:', updateError)
      return NextResponse.json({ error: 'Error updating task' }, { status: 500 })
    }

    return NextResponse.json(normalizeTask(task as Record<string, unknown>))
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Error updating task' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('suggestion_session='))
      ?.split('=')[1]

    if (!isValidSession(sessionCookie)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const { error } = await supabase.from('Task').delete().eq('id', id)

    if (error) {
      console.error('Error deleting task:', error)
      return NextResponse.json({ error: 'Error deleting task' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Error deleting task' }, { status: 500 })
  }
}
