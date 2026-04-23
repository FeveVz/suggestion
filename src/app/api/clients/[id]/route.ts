import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isValidSession } from '@/lib/auth'
import { normalizeClientService } from '@/lib/normalize'
import { v4 as uuidv4 } from 'uuid'

async function getClientWithServices(clientId: string) {
  const { data: client, error: clientError } = await supabase
    .from('Client')
    .select('*')
    .eq('id', clientId)
    .single()

  if (clientError || !client) return null

  const { data: clientServices } = await supabase
    .from('ClientService')
    .select('*, Service(*, Plan(*)), SelectedPlan:Plan!selectedPlanId(*)')
    .eq('clientId', clientId)

  client.services = (clientServices || [])
    .map((cs: Record<string, unknown>) => normalizeClientService(cs))

  return client
}

/**
 * Auto-generate tasks from templates when a proforma is accepted.
 * For each service in the planSelections, find TaskTemplates,
 * then create Task records assigning talents by role match.
 */
async function generateTasksFromTemplates(
  clientId: string,
  planSelections: Array<{ serviceId: string; selectedPlanId: string | null }>,
  fechaAceptacion?: string
) {
  const acceptanceDate = fechaAceptacion || new Date().toISOString().split('T')[0]

  // Get the current max task ID to increment from
  const { data: lastTask } = await supabase
    .from('Task')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)

  let taskNum = 1
  if (lastTask && lastTask.length > 0) {
    const match = lastTask[0].id.match(/tsk(\d+)/)
    if (match) taskNum = parseInt(match[1]) + 1
  }

  // Get all active talents for role matching
  const { data: allTalents } = await supabase
    .from('Talent')
    .select('id, role')
    .eq('active', true)

  const talentsByRole = new Map<string, string>()
  if (allTalents) {
    for (const t of allTalents) {
      // Map first talent found per role
      if (t.role && !talentsByRole.has(t.role)) {
        talentsByRole.set(t.role, t.id)
      }
    }
  }

  const tasksToCreate: Array<Record<string, unknown>> = []

  for (const selection of planSelections) {
    const { serviceId } = selection

    // Find the ClientService record for this service
    const { data: csRecord } = await supabase
      .from('ClientService')
      .select('id')
      .eq('clientId', clientId)
      .eq('serviceId', serviceId)
      .maybeSingle()

    // Get task templates for this service
    const { data: templates } = await supabase
      .from('TaskTemplate')
      .select('*')
      .eq('serviceId', serviceId)
      .order('order', { ascending: true })

    if (!templates || templates.length === 0) continue

    for (const template of templates) {
      // Calculate deadline based on acceptance date + deadlineDays
      const deadlineDate = new Date(acceptanceDate)
      deadlineDate.setDate(deadlineDate.getDate() + (template.deadlineDays || 7))
      const deadlineStr = deadlineDate.toISOString().split('T')[0]

      // Find a matching talent by role
      const matchedTalentId = template.role ? (talentsByRole.get(template.role) || null) : null

      const taskId = `tsk${String(taskNum).padStart(3, '0')}`
      taskNum++

      // Get service info for description enrichment
      const { data: serviceInfo } = await supabase
        .from('Service')
        .select('name, icon')
        .eq('id', serviceId)
        .single()

      const enrichedDescription = template.description 
        ? `${template.description}` 
        : ''

      const additionalInfo = serviceInfo 
        ? `Servicio: ${serviceInfo.icon || ''} ${serviceInfo.name}` 
        : ''

      tasksToCreate.push({
        id: taskId,
        title: template.title,
        description: enrichedDescription,
        status: 'pendiente',
        priority: template.priority || 'media',
        deadline: deadlineStr,
        talentId: matchedTalentId,
        clientServiceId: csRecord?.id || null,
        serviceId,
        clientId,
        additionalInfo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }

  // Batch insert all tasks
  if (tasksToCreate.length > 0) {
    const { error: insertError } = await supabase
      .from('Task')
      .insert(tasksToCreate)

    if (insertError) {
      console.error('Error batch inserting tasks:', insertError)
    }
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await getClientWithServices(id)

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json({ error: 'Error fetching client' }, { status: 500 })
  }
}

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
    const { name, activity, startDate, location, phone, email, serviceIds,
            status, anticipoPagado, descuento, fechaAceptacion,
            planSelections } = body

    const { data: existingClient, error: fetchError } = await supabase
      .from('Client')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingClient) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Acceptance flow
    if (status === 'aceptado' && planSelections && Array.isArray(planSelections)) {
      await supabase
        .from('Client')
        .update({
          status: 'aceptado',
          anticipoPagado: anticipoPagado ?? false,
          descuento: descuento ?? 0,
          fechaAceptacion: fechaAceptacion || new Date().toISOString().split('T')[0],
          startDate: startDate || undefined,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id)

      for (const selection of planSelections as Array<{ serviceId: string; selectedPlanId: string | null }>) {
        try {
          const { data: cs } = await supabase
            .from('ClientService')
            .select('id')
            .eq('clientId', id)
            .eq('serviceId', selection.serviceId)
            .maybeSingle()

          if (cs) {
            await supabase
              .from('ClientService')
              .update({ selectedPlanId: selection.selectedPlanId || null })
              .eq('id', cs.id)
          }
        } catch (planError) {
          console.error(`Error updating plan selection for service ${selection.serviceId}:`, planError)
        }
      }

      // === AUTO-GENERATE TASKS FROM TEMPLATES ===
      // Only generate if this is a new acceptance (client was not already accepted)
      if (existingClient.status !== 'aceptado') {
        try {
          await generateTasksFromTemplates(id, planSelections as Array<{ serviceId: string; selectedPlanId: string | null }>, fechaAceptacion)
        } catch (taskError) {
          console.error('Error auto-generating tasks:', taskError)
          // Don't fail the acceptance if task generation fails
        }
      }

      const refreshedClient = await getClientWithServices(id)
      return NextResponse.json(refreshedClient)
    }

    // Standard client update
    await supabase.from('ClientService').delete().eq('clientId', id)

    const { data: client, error: updateError } = await supabase
      .from('Client')
      .update({
        name: name || existingClient.name,
        activity: activity || existingClient.activity,
        startDate: startDate !== undefined ? startDate : existingClient.startDate,
        location: location !== undefined ? location : existingClient.location,
        phone: phone !== undefined ? phone : existingClient.phone,
        email: email !== undefined ? email : existingClient.email,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError || !client) {
      console.error('Error updating client:', updateError)
      return NextResponse.json({ error: 'Error updating client', details: updateError?.message }, { status: 500 })
    }

    if (serviceIds && serviceIds.length > 0) {
      const csRecords = serviceIds.map((serviceId: string) => ({
        id: uuidv4(),
        clientId: id,
        serviceId,
      }))
      await supabase.from('ClientService').insert(csRecords)
    }

    const fullClient = await getClientWithServices(id)
    return NextResponse.json(fullClient)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json({ error: 'Error updating client', details: String(error) }, { status: 500 })
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

    await supabase.from('ClientService').delete().eq('clientId', id)
    const { error } = await supabase.from('Client').delete().eq('id', id)

    if (error) {
      console.error('Error deleting client:', error)
      return NextResponse.json({ error: 'Error deleting client' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Error deleting client' }, { status: 500 })
  }
}
