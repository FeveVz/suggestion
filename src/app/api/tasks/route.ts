import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isValidSession, parseTalentSessionToken } from '@/lib/auth'
import { normalizeTask } from '@/lib/normalize'

export async function GET(request: Request) {
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

    // Parse query params for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const serviceId = searchParams.get('serviceId')
    const clientId = searchParams.get('clientId')
    const priority = searchParams.get('priority')

    let query = supabase
      .from('Task')
      .select('*, Talent(*), Service(*), Client(id, name)')
      .order('createdAt', { ascending: false })

    // If talent, only show their tasks
    if (talentId && !isAdmin) {
      query = query.eq('talentId', talentId)
    } else if (talentId) {
      // Admin viewing a specific talent's tasks
      const talentFilter = searchParams.get('talentId')
      if (talentFilter) query = query.eq('talentId', talentFilter)
    }

    if (status) query = query.eq('status', status)
    if (serviceId) query = query.eq('serviceId', serviceId)
    if (clientId) query = query.eq('clientId', clientId)
    if (priority) query = query.eq('priority', priority)

    const { data: tasks, error } = await query

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 })
    }

    const result = (tasks || []).map((t: Record<string, unknown>) => normalizeTask(t))
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 })
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
    const { title, description, status, priority, deadline, talentId, clientServiceId, serviceId, clientId, additionalInfo } = body

    if (!title || !serviceId || !clientId) {
      return NextResponse.json({ error: 'Título, servicio y cliente son requeridos' }, { status: 400 })
    }

    // Generate next task ID
    const { data: lastTask } = await supabase
      .from('Task')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)

    let nextNum = 1
    if (lastTask && lastTask.length > 0) {
      const match = lastTask[0].id.match(/tsk(\d+)/)
      if (match) nextNum = parseInt(match[1]) + 1
    }
    const taskId = `tsk${String(nextNum).padStart(3, '0')}`

    const { data: task, error: insertError } = await supabase
      .from('Task')
      .insert({
        id: taskId,
        title,
        description: description || '',
        status: status || 'pendiente',
        priority: priority || 'media',
        deadline: deadline || null,
        talentId: talentId || null,
        clientServiceId: clientServiceId || null,
        serviceId,
        clientId,
        additionalInfo: additionalInfo || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select('*, Talent(*), Service(*), Client(id, name)')
      .single()

    if (insertError || !task) {
      console.error('Error creating task:', insertError)
      return NextResponse.json({ error: 'Error creating task', details: insertError?.message }, { status: 500 })
    }

    return NextResponse.json(normalizeTask(task as Record<string, unknown>), { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Error creating task' }, { status: 500 })
  }
}
