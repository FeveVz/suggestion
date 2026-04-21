import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const services = await db.service.findMany({
      include: {
        plans: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(services)
  } catch {
    return NextResponse.json({ error: 'Error fetching services' }, { status: 500 })
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

    const service = await db.service.create({
      data: {
        name,
        slug,
        description: description || '',
        icon: icon || '',
        category: category || 'principal',
        methodology: methodology || null,
        plans: plans && plans.length > 0 ? {
          create: plans.map((p: Record<string, unknown>, i: number) => ({
            name: p.name as string,
            price: p.price as number,
            originalPrice: p.originalPrice as number | null,
            period: p.period as string,
            description: p.description as string,
            features: typeof p.features === 'string' ? p.features : JSON.stringify(p.features),
            badge: (p.badge as string) || null,
            isRecommended: (p.isRecommended as boolean) || false,
            order: i
          }))
        } : undefined
      },
      include: { plans: true }
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Error creating service' }, { status: 500 })
  }
}
