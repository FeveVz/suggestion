import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const service = await db.service.findUnique({
      where: { id },
      include: { plans: { orderBy: { order: 'asc' } } }
    })

    if (!service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

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

    // Delete existing plans and recreate
    await db.plan.deleteMany({
      where: { serviceId: id }
    })

    const service = await db.service.update({
      where: { id },
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
      include: { plans: { orderBy: { order: 'asc' } } }
    })

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

    await db.plan.deleteMany({
      where: { serviceId: id }
    })

    await db.clientService.deleteMany({
      where: { serviceId: id }
    })

    await db.service.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: 'Error deleting service' }, { status: 500 })
  }
}
