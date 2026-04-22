import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateProformaHtml } from '@/lib/proforma-template'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params

    // Fetch client
    const { data: client, error: clientError } = await supabase
      .from('Client')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Fetch client services with service and plan details
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
      const service = cs.Service as Record<string, unknown>
      const plans = ((service?.Plan as Record<string, unknown>[]) || []).sort(
        (a: Record<string, unknown>, b: Record<string, unknown>) => (a.order as number) - (b.order as number)
      )
      return {
        name: service?.name,
        slug: service?.slug,
        description: service?.description,
        icon: service?.icon,
        category: service?.category,
        methodology: service?.methodology,
        plans: plans.map((p: Record<string, unknown>) => ({
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
      }
    })

    const html = generateProformaHtml(clientData, servicesData)

    // Return HTML that triggers print dialog for PDF saving
    const printHtml = html.replace('</body>', `
<script>
  window.onload = function() {
    window.print();
  }
</script>
</body>`)

    const serviceSlug = servicesData.length === 1 ? servicesData[0].slug : 'servicios'
    const filename = `Proforma-SUGGESTION-${serviceSlug}-${clientData.name.replace(/\s+/g, '-')}.html`

    return new NextResponse(printHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 })
  }
}
