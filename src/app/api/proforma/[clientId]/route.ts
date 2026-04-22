import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { normalizeService } from '@/lib/normalize'
import { generateProformaHtml } from '@/lib/proforma-template'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params

    const { data: client, error: clientError } = await supabase
      .from('Client')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const { data: clientServices, error: csError } = await supabase
      .from('ClientService')
      .select('*, Service(*, Plan(*))')
      .eq('clientId', clientId)

    if (csError) {
      console.error('Error fetching client services:', csError)
      return NextResponse.json({ error: 'Error fetching client services' }, { status: 500 })
    }

    if (!clientServices || clientServices.length === 0) {
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

    const servicesData = clientServices.map((cs: Record<string, unknown>) => {
      const service = normalizeService((cs.Service || {}) as Record<string, unknown>)
      return {
        name: service.name,
        slug: service.slug,
        description: service.description,
        icon: service.icon,
        category: service.category,
        methodology: service.methodology,
        plans: service.plans
      }
    })

    const html = generateProformaHtml(clientData, servicesData)

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
