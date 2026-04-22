import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { normalizeService } from '@/lib/normalize'

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

    return NextResponse.json(normalizeService(service as Record<string, unknown>))
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
    await supabase.from('Plan').delete().eq('serviceId', id)

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
    let createdPlans: Record<string, unknown>[] = []
    if (plans && plans.length > 0) {
      const { data: lastPlan } = await supabase
        .from('Plan')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)

      let planNum = 17
      if (lastPlan && lastPlan.length > 0) {
        const match = lastPlan[0].id.match(/p(\d+)/)
        if (match) planNum = parseInt(match[1].substring(0, 2)) + 1
      }

      const planRecords = plans.map((p: Record<string, unknown>, i: number) => ({
        id: `p${String(planNum).padStart(2, '0')}${String(i + 1).padStart(2, '0')}`,
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

      const { data: insertedPlans, error: plansError } = await supabase
        .from('Plan')
        .insert(planRecords)
        .select()

      if (plansError) {
        console.error('Error creating plans:', plansError)
      }

      createdPlans = (insertedPlans || []) as Record<string, unknown>[]
    }

    const result = normalizeService({ ...service, Plan: createdPlans })
    return NextResponse.json(result)
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

    await supabase.from('Plan').delete().eq('serviceId', id)
    await supabase.from('ClientService').delete().eq('serviceId', id)

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
