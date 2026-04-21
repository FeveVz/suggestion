import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateProformaHtml } from '@/lib/proforma-template'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params

    const client = await db.client.findUnique({
      where: { id: clientId },
      include: {
        services: {
          include: {
            service: {
              include: {
                plans: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    if (client.services.length === 0) {
      return NextResponse.json({ error: 'El cliente no tiene servicios asignados' }, { status: 400 })
    }

    const clientData = {
      name: client.name,
      activity: client.activity,
      startDate: client.startDate,
      location: client.location,
      phone: client.phone,
      email: client.email
    }

    const servicesData = client.services.map(cs => ({
      name: cs.service.name,
      slug: cs.service.slug,
      description: cs.service.description,
      icon: cs.service.icon,
      category: cs.service.category,
      methodology: cs.service.methodology,
      plans: cs.service.plans.map(p => ({
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        period: p.period,
        description: p.description,
        features: p.features,
        badge: p.badge,
        isRecommended: p.isRecommended,
        order: p.order
      }))
    }))

    const html = generateProformaHtml(clientData, servicesData)

    // Check if this is a download request
    const url = new URL(request.url)
    const isDownload = url.searchParams.get('download') === 'true'

    if (isDownload) {
      const serviceSlug = servicesData.length === 1 ? servicesData[0].slug : 'servicios'
      const filename = `Proforma-SUGGESTION-${serviceSlug}-${clientData.name.replace(/\s+/g, '-')}.html`

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        },
      })
    }

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error generating proforma:', error)
    return NextResponse.json({ error: 'Error generating proforma' }, { status: 500 })
  }
}
