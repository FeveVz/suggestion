import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isValidSession } from '@/lib/auth'
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

  client.services = (clientServices || []).map((cs: Record<string, unknown>) => ({
    ...cs,
    service: cs.Service,
    selectedPlan: cs.SelectedPlan,
    Service: undefined,
    SelectedPlan: undefined,
  }))

  return client
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
    // Auth check
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
            // New fields for acceptance flow
            status, anticipoPagado, descuento, fechaAceptacion,
            // Plan selections: array of { serviceId, selectedPlanId }
            planSelections } = body

    // Verify client exists
    const { data: existingClient, error: fetchError } = await supabase
      .from('Client')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingClient) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // If this is an acceptance update (has planSelections or status change)
    if (status === 'aceptado' && planSelections && Array.isArray(planSelections)) {
      // Update client status fields
      const { error: updateError } = await supabase
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

      if (updateError) {
        console.error('Error updating client status:', updateError)
      }

      // Update plan selections for each service
      for (const selection of planSelections as Array<{ serviceId: string; selectedPlanId: string | null }>) {
        try {
          // Find the ClientService record
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
          } else {
            console.warn(`ClientService not found for clientId=${id}, serviceId=${selection.serviceId}`)
          }
        } catch (planError) {
          console.error(`Error updating plan selection for service ${selection.serviceId}:`, planError)
        }
      }

      // Refetch with updated data
      const refreshedClient = await getClientWithServices(id)
      return NextResponse.json(refreshedClient)
    }

    // Standard client update (edit form)
    // Delete existing service connections
    await supabase.from('ClientService').delete().eq('clientId', id)

    // Update the client
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

    // Create new service connections
    if (serviceIds && serviceIds.length > 0) {
      const csRecords = serviceIds.map((serviceId: string) => ({
        id: uuidv4(),
        clientId: id,
        serviceId,
      }))

      await supabase.from('ClientService').insert(csRecords)
    }

    // Fetch the complete updated client
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

    // Delete client services first
    await supabase.from('ClientService').delete().eq('clientId', id)

    // Delete the client
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
