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
