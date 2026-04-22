import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: services, error } = await supabase
      .from('Service')
      .select('*, Plan(*)')
      .order('createdAt', { ascending: true })

    if (error) {
      console.error('Supabase error fetching services:', error)
      return NextResponse.json({ error: 'Error fetching services', details: error.message }, { status: 500 })
    }

    // Sort plans by order within each service
    const formatted = services.map((s: Record<string, unknown>) => ({
      ...s,
      plans: ((s.Plan as Record<string, unknown>[]) || []).sort((a: Record<string, unknown>, b: Record<string, unknown>) => (a.order as number) - (b.order as number))
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Error fetching services', details: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('suggestion_session='))
      ?.split('=')[1]

    if (!sessionCookie || sessionCookie !== 'sugg_admin_token_2024') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, icon, category, methodology, plans } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 })
    }

    // Generate next service ID
    const { data: lastService } = await supabase
      .from('Service')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)

    let nextNum = 17 // Default if no existing services
    if (lastService && lastService.length > 0) {
      const match = lastService[0].id.match(/svc(\d+)/)
      if (match) nextNum = parseInt(match[1]) + 1
    }
    const serviceId = `svc${String(nextNum).padStart(2, '0')}`

    // Create the service
    const { data: service, error: serviceError } = await supabase
      .from('Service')
      .insert({
        id: serviceId,
        name,
        slug,
        description: description || '',
        icon: icon || '',
        category: category || 'principal',
        methodology: methodology || null,
      })
      .select()
      .single()

    if (serviceError || !service) {
      console.error('Error creating service:', serviceError)
      return NextResponse.json({ error: 'Error creating service', details: serviceError?.message }, { status: 500 })
    }

    // Create plans if provided
    if (plans && plans.length > 0) {
      // Generate plan IDs
      const { data: lastPlan } = await supabase
        .from('Plan')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)

      let planNum = 17 // Default
      if (lastPlan && lastPlan.length > 0) {
        const match = lastPlan[0].id.match(/p(\d+)/)
        if (match) planNum = parseInt(match[1].substring(0, 2)) + 1
      }

      const planRecords = plans.map((p: Record<string, unknown>, i: number) => ({
        id: `p${String(planNum).padStart(2, '0')}${String(i + 1).padStart(2, '0')}`,
        serviceId: service.id,
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

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Error creating service' }, { status: 500 })
  }
}
