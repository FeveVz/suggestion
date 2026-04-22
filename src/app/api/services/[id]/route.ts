import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: service, error } = await supabase
      .from('Service')
      .select('*, Plan(*)')
      .eq('id', id)
      .single()

    if (error || !service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    // Sort plans by order
    service.plans = ((service.Plan as Record<string, unknown>[]) || []).sort(
      (a: Record<string, unknown>, b: Record<string, unknown>) => (a.order as number) - (b.order as number)
    )

    return NextResponse.json(service)
  } catch {
    return NextResponse.json({ error: 'Error fetching service' }, { status: 500 })
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

    if (!sessionCookie || sessionCookie !== 'sugg_admin_token_2024') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, slug, description, icon, category, methodology, plans } = body

    // Delete existing plans
    const { error: deletePlansError } = await supabase
      .from('Plan')
      .delete()
      .eq('serviceId', id)

    if (deletePlansError) {
      console.error('Error deleting existing plans:', deletePlansError)
    }

    // Update the service
    const { data: service, error: updateError } = await supabase
      .from('Service')
      .update({
        name,
        slug,
        description: description || '',
        icon: icon || '',
        category: category || 'principal',
        methodology: methodology || null,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError || !service) {
      console.error('Error updating service:', updateError)
      return NextResponse.json({ error: 'Error updating service', details: updateError?.message }, { status: 500 })
    }

    // Create new plans
    if (plans && plans.length > 0) {
      const planRecords = plans.map((p: Record<string, unknown>, i: number) => ({
        serviceId: id,
        name: p.name as string,
        price: p.price as number,
        originalPrice: p.originalPrice as number | null,
        period: p.period as string,
        description: p.description as string,
        features: typeof p.features === 'string' ? p.features : JSON.stringify(p.features),
        badge: (p.badge as string) || null,
        isRecommended: (p.isRecommended as boolean) || false,
        order: i,
      }))

      const { data: createdPlans, error: plansError } = await supabase
        .from('Plan')
        .insert(planRecords)
        .select()

      if (plansError) {
        console.error('Error creating plans:', plansError)
      }

      service.plans = (createdPlans || []).sort(
        (a: Record<string, unknown>, b: Record<string, unknown>) => (a.order as number) - (b.order as number)
      )
    } else {
      service.plans = []
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json({ error: 'Error updating service' }, { status: 500 })
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

    if (!sessionCookie || sessionCookie !== 'sugg_admin_token_2024') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Delete plans for this service
    await supabase.from('Plan').delete().eq('serviceId', id)

    // Delete client service connections
    await supabase.from('ClientService').delete().eq('serviceId', id)

    // Delete the service
    const { error } = await supabase.from('Service').delete().eq('id', id)

    if (error) {
      console.error('Error deleting service:', error)
      return NextResponse.json({ error: 'Error deleting service' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: 'Error deleting service' }, { status: 500 })
  }
}
