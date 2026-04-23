import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isValidSession } from '@/lib/auth'
import { normalizeTaskTemplate } from '@/lib/normalize'

export async function PUT(
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
    const body = await request.json()
    const { serviceId, title, description, priority, deadlineDays, role, order } = body

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }
    if (serviceId) updateData.serviceId = serviceId
    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (priority) updateData.priority = priority
    if (deadlineDays !== undefined) updateData.deadlineDays = deadlineDays
    if (role !== undefined) updateData.role = role
    if (order !== undefined) updateData.order = order

    const { data: template, error: updateError } = await supabase
      .from('TaskTemplate')
      .update(updateData)
      .eq('id', id)
      .select('*, Service(*)')
      .single()

    if (updateError || !template) {
      console.error('Error updating task template:', updateError)
      return NextResponse.json({ error: 'Error updating task template' }, { status: 500 })
    }

    return NextResponse.json(normalizeTaskTemplate(template as Record<string, unknown>))
  } catch (error) {
    console.error('Error updating task template:', error)
    return NextResponse.json({ error: 'Error updating task template' }, { status: 500 })
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
    const { error } = await supabase.from('TaskTemplate').delete().eq('id', id)

    if (error) {
      console.error('Error deleting task template:', error)
      return NextResponse.json({ error: 'Error deleting task template' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task template:', error)
    return NextResponse.json({ error: 'Error deleting task template' }, { status: 500 })
  }
}
