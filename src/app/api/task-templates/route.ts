import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isValidSession } from '@/lib/auth'
import { normalizeTaskTemplate } from '@/lib/normalize'

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('suggestion_session='))
      ?.split('=')[1]

    if (!isValidSession(sessionCookie)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    let query = supabase
      .from('TaskTemplate')
      .select('*, Service(*)')
      .order('serviceId', { ascending: true })
      .order('order', { ascending: true })

    if (serviceId) {
      query = query.eq('serviceId', serviceId)
    }

    const { data: templates, error } = await query

    if (error) {
      console.error('Error fetching task templates:', error)
      return NextResponse.json({ error: 'Error fetching task templates' }, { status: 500 })
    }

    const result = (templates || []).map((t: Record<string, unknown>) => normalizeTaskTemplate(t))
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching task templates:', error)
    return NextResponse.json({ error: 'Error fetching task templates' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('suggestion_session='))
      ?.split('=')[1]

    if (!isValidSession(sessionCookie)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { serviceId, title, description, priority, deadlineDays, role, order } = body

    if (!serviceId || !title) {
      return NextResponse.json({ error: 'Servicio y título son requeridos' }, { status: 400 })
    }

    // Generate next template ID
    const { data: lastTemplate } = await supabase
      .from('TaskTemplate')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)

    let nextNum = 1
    if (lastTemplate && lastTemplate.length > 0) {
      const match = lastTemplate[0].id.match(/tpl(\d+)/)
      if (match) nextNum = parseInt(match[1]) + 1
    }
    const templateId = `tpl${String(nextNum).padStart(2, '0')}`

    const { data: template, error: insertError } = await supabase
      .from('TaskTemplate')
      .insert({
        id: templateId,
        serviceId,
        title,
        description: description || '',
        priority: priority || 'media',
        deadlineDays: deadlineDays ?? 7,
        role: role || '',
        order: order ?? 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select('*, Service(*)')
      .single()

    if (insertError || !template) {
      console.error('Error creating task template:', insertError)
      return NextResponse.json({ error: 'Error creating task template', details: insertError?.message }, { status: 500 })
    }

    return NextResponse.json(normalizeTaskTemplate(template as Record<string, unknown>), { status: 201 })
  } catch (error) {
    console.error('Error creating task template:', error)
    return NextResponse.json({ error: 'Error creating task template' }, { status: 500 })
  }
}
