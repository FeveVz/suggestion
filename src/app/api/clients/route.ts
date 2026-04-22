import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isValidSession } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    // Fetch clients
    const { data: clients, error: clientsError } = await supabase
      .from('Client')
      .select('*')
      .order('createdAt', { ascending: false })

    if (clientsError) {
      console.error('Error fetching clients:', clientsError)
      return NextResponse.json({ error: 'Error fetching clients' }, { status: 500 })
    }

    if (!clients || clients.length === 0) {
      return NextResponse.json([])
    }

    // Fetch all ClientService records with Service and Plan data
    const clientIds = clients.map((c: Record<string, unknown>) => c.id)

    const { data: clientServices, error: csError } = await supabase
      .from('ClientService')
      .select('*, Service(*, Plan(*)), SelectedPlan:Plan!selectedPlanId(*)')
      .in('clientId', clientIds)

    if (csError) {
      console.error('Error fetching client services:', csError)
    }

    // Merge data
    const csMap = new Map<string, unknown[]>()
    if (clientServices) {
      for (const cs of clientServices) {
        const cid = cs.clientId as string
        if (!csMap.has(cid)) csMap.set(cid, [])
        csMap.get(cid)!.push(cs)
      }
    }

    const result = clients.map((client: Record<string, unknown>) => ({
      ...client,
      services: (csMap.get(client.id as string) || []).map((cs: Record<string, unknown>) => ({
        ...cs,
        service: cs.Service,
        selectedPlan: cs.SelectedPlan,
        Service: undefined,
        SelectedPlan: undefined,
      })),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Error fetching clients' }, { status: 500 })
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
    const { name, activity, startDate, location, phone, email, serviceIds } = body

    if (!name || !activity) {
      return NextResponse.json({ error: 'Nombre y actividad son requeridos' }, { status: 400 })
    }

    // Generate client ID (UUID)
    const clientId = uuidv4()

    // Create the client
    const { data: client, error: clientError } = await supabase
      .from('Client')
      .insert({
        id: clientId,
        name,
        activity,
        startDate: startDate || '',
        location: location || '',
        phone: phone || '',
        email: email || '',
      })
      .select()
      .single()

    if (clientError || !client) {
      console.error('Error creating client:', clientError)
      return NextResponse.json({ error: 'Error creating client', details: clientError?.message }, { status: 500 })
    }

    // Create ClientService connections if serviceIds provided
    if (serviceIds && serviceIds.length > 0) {
      const csRecords = serviceIds.map((serviceId: string) => ({
        id: uuidv4(),
        clientId: client.id,
        serviceId,
      }))

      const { error: csError } = await supabase
        .from('ClientService')
        .insert(csRecords)

      if (csError) {
        console.error('Error creating client services:', csError)
      }
    }

    // Fetch the complete client with services
    const { data: clientServices } = await supabase
      .from('ClientService')
      .select('*, Service(*, Plan(*)), SelectedPlan:Plan!selectedPlanId(*)')
      .eq('clientId', client.id)

    client.services = (clientServices || []).map((cs: Record<string, unknown>) => ({
      ...cs,
      service: cs.Service,
      selectedPlan: cs.SelectedPlan,
      Service: undefined,
      SelectedPlan: undefined,
    }))

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Error creating client' }, { status: 500 })
  }
}
