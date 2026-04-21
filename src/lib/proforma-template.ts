import { LOGO_NEGRO_BASE64 } from '@/lib/logo-negro'
import { LOGO_BLANCO_BASE64 } from '@/lib/logo-blanco'

interface ServiceData {
  name: string
  slug: string
  description: string
  icon: string
  category: string
  methodology: string | null
  plans: Array<{
    name: string
    price: number
    originalPrice: number | null
    period: string
    description: string
    features: string
    badge: string | null
    isRecommended: boolean
    order: number
  }>
}

interface ClientData {
  name: string
  activity: string
  startDate: string
  location: string
  phone: string
  email: string
}

function formatPrice(price: number): string {
  return price.toLocaleString('es-PE')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function generateServiceCards(service: ServiceData): string {
  const methodology = service.methodology ? JSON.parse(service.methodology) : []
  const whatIncludesItems: Array<{icon: string, title: string, description: string, items?: string[]}> = [
    { icon: service.icon, title: service.name, description: service.description, items: methodology.map((m: {title: string, description: string}) => m.title + ': ' + m.description) }
  ]

  // Split into 2 or 4 cards
  const cards = whatIncludesItems.length <= 2 ? whatIncludesItems : whatIncludesItems

  let html = ''
  cards.forEach((item, i) => {
    const color = i % 2 === 0 ? 'blue' : 'orange'
    html += `
      <div class="service-card ${color}">
        <div class="service-icon ${color}">${item.icon}</div>
        <div class="service-title">${escapeHtml(item.title)}</div>
        <div class="service-desc">${escapeHtml(item.description)}</div>
        <ul class="service-list">
          ${(item.items || []).map(it => `
            <li><svg class="check ${color}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>${escapeHtml(it)}</li>
          `).join('')}
        </ul>
      </div>`
  })

  // If only 1 card, add methodology-based cards
  if (whatIncludesItems.length < 2 && methodology.length >= 2) {
    const methCards = [
      {
        icon: methodology[0]?.iconEmoji || '📋',
        title: 'Conceptualización',
        description: methodology[0]?.title + ': ' + methodology[0]?.description,
        items: methodology.slice(0, 2).map((m: {title: string, description: string}) => m.title)
      },
      {
        icon: methodology[2]?.iconEmoji || '✨',
        title: 'Ejecución y Entrega',
        description: methodology[2]?.title + ': ' + methodology[2]?.description,
        items: methodology.slice(2).map((m: {title: string, description: string}) => m.title)
      }
    ]
    methCards.forEach((item, i) => {
      const color = (i + 1) % 2 === 0 ? 'blue' : 'orange'
      html += `
        <div class="service-card ${color}">
          <div class="service-icon ${color}">${item.icon}</div>
          <div class="service-title">${escapeHtml(item.title)}</div>
          <div class="service-desc">${escapeHtml(item.description)}</div>
          <ul class="service-list">
            ${item.items.map((it: string) => `
              <li><svg class="check ${color}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>${escapeHtml(it)}</li>
            `).join('')}
          </ul>
        </div>`
    })
  }

  return html
}

function generateMethodology(service: ServiceData): string {
  const methodology = service.methodology ? JSON.parse(service.methodology) : []
  if (methodology.length === 0) return ''

  return methodology.map((step: {phase: string, title: string, description: string, iconBg: string, iconColor: string, iconEmoji: string}) => `
      <div class="method-step">
        <div class="method-header">
          <div class="method-icon" style="background:${step.iconBg};color:${step.iconColor}">${step.iconEmoji}</div>
          <div>
            <div class="method-label">FASE ${step.phase}</div>
            <div class="method-title">${escapeHtml(step.title)}</div>
          </div>
        </div>
        <div class="method-desc">${escapeHtml(step.description)}</div>
      </div>`).join('\n')
}

function generatePricingCards(service: ServiceData): string {
  const sortedPlans = [...service.plans].sort((a, b) => a.order - b.order)

  return sortedPlans.map((plan, i) => {
    const features: string[] = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features
    const isRecommended = plan.isRecommended
    const colorClass = isRecommended ? 'orange' : (i === 2 ? 'black' : 'blue')
    const borderColor = isRecommended ? 'border:2px solid #FF8D00;' : ''

    let badgeHtml = ''
    if (plan.badge) {
      const badgeClass = isRecommended ? 'recommended' : 'premium'
      badgeHtml = `<div class="pricing-badge ${badgeClass}">${escapeHtml(plan.badge)}</div>`
    }

    const typeLabelColor = isRecommended ? 'orange' : (i === 0 ? 'blue' : '')
    const priceColor = isRecommended ? 'color:#FF8D00;' : ''
    const checkColor = isRecommended ? '#FF8D00' : (i === 0 ? '#00C0FF' : '#000')

    const originalPriceHtml = plan.originalPrice
      ? `<span style="font-size:14px;color:#696969;text-decoration:line-through;margin-left:8px;">S/${formatPrice(plan.originalPrice)}</span>`
      : ''

    return `
      <div class="pricing-card" style="${borderColor}">
        ${badgeHtml}
        <div class="pricing-type-row">
          <span class="pricing-type-icon">${service.icon}</span>
          <span class="pricing-type-label ${typeLabelColor}">${escapeHtml(plan.name.toUpperCase())}</span>
        </div>
        <div class="pricing-name">${escapeHtml(plan.name)}</div>
        ${plan.description ? `<div class="pricing-desc">${escapeHtml(plan.description)}</div>` : ''}
        <div>
          <span class="pricing-price" style="${priceColor}"><span class="currency">S/</span>${formatPrice(plan.price)}</span>${originalPriceHtml}
          <span class="pricing-period">${escapeHtml(plan.period)}</span>
        </div>
        <div class="pricing-separator"></div>
        <ul class="pricing-list">
          ${features.map(f => `
            <li><svg viewBox="0 0 24 24" fill="none" stroke="${checkColor}" stroke-width="3" style="width:14px;height:14px;flex-shrink:0;margin-top:2px"><path d="M5 13l4 4L19 7"/></svg>${escapeHtml(f)}</li>
          `).join('')}
        </ul>
      </div>`
  }).join('\n')
}

function generateComparisonTable(service: ServiceData): string {
  const sortedPlans = [...service.plans].sort((a, b) => a.order - b.order)

  let rows = ''
  sortedPlans.forEach((plan, i) => {
    const features: string[] = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features
    const color = i === 1 ? '#FF8D00' : '#00C0FF'
    const bg = i % 2 === 0 ? 'white' : '#FAFAFA'

    rows += `
      <div class="table-row bordered" style="background:${bg}">
        <div class="item" style="font-family:monospace;font-size:10px">0${i + 1}</div>
        <div class="package">Plan ${escapeHtml(plan.name)}</div>
        <div class="desc"><span style="font-weight:700;color:${color}">${features.slice(0, 3).join(' + ')}</span></div>
        <div class="value" style="color:${color}">S/${formatPrice(plan.price)}</div>
      </div>
      <div class="table-row bordered table-sub" style="background:#FAFAFA">
        <div></div>
        <div class="item">${features.join(' · ')}</div>
      </div>`
  })

  // Savings note
  const recommended = sortedPlans.find(p => p.isRecommended)
  let savingsHtml = ''
  if (recommended && recommended.originalPrice) {
    const savings = recommended.originalPrice - recommended.price
    savingsHtml = `
      <div class="savings-note">
        <strong>💡 Ahorro:</strong> Con el plan <strong>${escapeHtml(recommended.name)}</strong> ahorras <span class="highlight">S/${formatPrice(savings)}</span> respecto al precio regular.
      </div>`
  }

  return `
    <div class="table-wrapper">
      <div class="table-row table-header">
        <div>#</div>
        <div>Característica</div>
        <div>Detalle</div>
        <div style="text-align:right">Precio</div>
      </div>
      ${rows}
    </div>
    ${savingsHtml}`
}

function generateTimeline(service: ServiceData): string {
  const methodology = service.methodology ? JSON.parse(service.methodology) : []
  if (methodology.length === 0) return ''

  const colors = ['#00C0FF', '#FF8D00', '#696969', '#00C0FF']
  const bgs = ['#00C0FF08', '#FF8D0008', '#69696908', '#00C0FF08']

  return `
    <div class="timeline-grid">
      ${methodology.map((step: {phase: string, title: string, description: string}, i: number) => `
        <div class="timeline-card" style="border-color:${colors[i]};background:${bgs[i]}">
          <span class="timeline-phase" style="color:${colors[i]}">Fase ${step.phase}</span>
          <div class="timeline-title">${escapeHtml(step.title)}</div>
          <div class="timeline-desc">${escapeHtml(step.description)}</div>
        </div>
      `).join('')}
    </div>
    <div class="note-box">
      <strong>📌 Nota:</strong> Los tiempos pueden variar según la complejidad del proyecto y la disponibilidad del cliente.
    </div>`
}

function generateTerms(): string {
  const terms = [
    { q: '¿Cuál es la vigencia de esta proforma?', a: 'Esta proforma tiene una vigencia de 15 días hábiles desde la fecha de emisión. Pasado este periodo, los precios y condiciones pueden variar.' },
    { q: '¿Qué formas de pago aceptan?', a: 'Aceptamos transferencias bancarias, depósitos y pagos con tarjeta. Para proyectos con pago único, se requiere un adelanto del 50% al inicio y el 50% restante al momento de la entrega. Para servicios mensuales, el pago se realiza al inicio de cada mes.' },
    { q: '¿Puedo personalizar los planes?', a: 'Sí, todos nuestros planes son personalizables. Podemos ajustar las características, duración y precio según tus necesidades específicas. Contáctanos para una cotización personalizada.' },
    { q: '¿Qué incluye el soporte?', a: 'El soporte varía según el plan contratado. Incluye desde soporte por email hasta reuniones semanales y consultor dedicado, según el nivel de servicio elegido.' },
    { q: '¿Cómo inician los servicios?', a: 'Una vez aceptada la proforma y recibido el pago inicial, programamos una reunión de kickoff para definir los detalles del proyecto y comenzar a trabajar inmediatamente.' }
  ]

  return terms.map(t => `
      <div class="term-item">
        <div class="term-question">${escapeHtml(t.q)}</div>
        <div class="term-answer">${escapeHtml(t.a)}</div>
      </div>`).join('\n')
}

export function generateProformaHtml(client: ClientData, services: ServiceData[]): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })
  const codePrefix = services.length > 0 ? services[0].slug.substring(0, 2).toUpperCase() : 'SRV'
  const codeSuffix = client.name.substring(0, 2).toUpperCase()
  const proformaCode = `${codePrefix}-${codeSuffix}${now.getMonth() + 1}${now.getFullYear().toString().slice(2)}`

  const servicesSections = services.map(service => `
<!-- SERVICE: ${service.name} -->
<div class="section">
  <div class="container">
    <div class="section-header">
      <span class="section-tag" style="color:#00C0FF">Qué incluye</span>
      <h2 class="section-title">Servicios de ${escapeHtml(service.name)}</h2>
      <p class="section-desc">${escapeHtml(service.description)}</p>
    </div>
    <div class="services-grid">
      ${generateServiceCards(service)}
    </div>
  </div>
</div>

<!-- METHODOLOGY: ${service.name} -->
<div class="methodology">
  <div class="container">
    <div class="section-header">
      <span class="section-tag" style="color:#FF8D00">Proceso</span>
      <h2 class="section-title">Nuestra Metodología</h2>
      <p class="section-desc">Proceso diseñado para maximizar resultados y entregar valor desde el primer día.</p>
    </div>
    <div class="method-grid">
      ${generateMethodology(service)}
    </div>
  </div>
</div>

<!-- PRICING: ${service.name} -->
<div class="section">
  <div class="container">
    <div class="section-header" style="text-align:center;">
      <span class="section-tag" style="color:#FF8D00">Planes</span>
      <h2 class="section-title" style="max-width:480px;margin:0 auto 8px;">Elige tu Plan de ${escapeHtml(service.name)}</h2>
      <p class="section-desc" style="margin:0 auto;max-width:560px;text-align:center;">Tres opciones diseñadas para diferentes necesidades y presupuestos. Todos incluyen soporte profesional.</p>
    </div>
    <div class="pricing-grid">
      ${generatePricingCards(service)}
    </div>
  </div>
</div>

<!-- COMPARISON: ${service.name} -->
<div class="table-section">
  <div class="container">
    <div class="section-header">
      <span class="section-tag" style="color:#00C0FF">Comparativa</span>
      <h2 class="section-title">Resumen de Planes</h2>
      <p class="section-desc">Compara las características de cada plan para elegir la opción que mejor se adapte a tus necesidades.</p>
    </div>
    ${generateComparisonTable(service)}
  </div>
</div>

<!-- TIMELINE: ${service.name} -->
<div class="section">
  <div class="container">
    <div class="section-header">
      <span class="section-tag" style="color:#00C0FF">Cronograma</span>
      <h2 class="section-title">Etapas del Proyecto</h2>
      <p class="section-desc">Cada fase está diseñada para asegurar la calidad y eficiencia del proyecto.</p>
    </div>
    ${generateTimeline(service)}
  </div>
</div>
  `).join('\n')

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Proforma ${services.map(s => s.name).join(', ')} — ${escapeHtml(client.name)} | SUGGESTION</title>
<style>

  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #FFFFFF;
    color: #696969;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .container { max-width: 1024px; margin: 0 auto; padding: 0 24px; }

  /* Header */
  .header { position: relative; overflow: hidden; padding: 48px 0 64px; }
  .header::before {
    content: ''; position: absolute; top: -80px; right: -80px;
    width: 288px; height: 288px; border-radius: 50%;
    background: #00C0FF; opacity: 0.1;
  }
  .header::after {
    content: ''; position: absolute; bottom: -40px; left: -40px;
    width: 192px; height: 192px; border-radius: 50%;
    background: #FF8D00; opacity: 0.1;
  }
  .header-inner { position: relative; z-index: 1; }
  .logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 48px; }
  .logo-row img { height: 36px; width: auto; }
  .logo-subtitle {
    font-size: 11px; font-weight: 500;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: #696969;
  }
  .tag-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
  .tag-bar { height: 4px; width: 32px; border-radius: 4px; background: #FF8D00; }
  .tag-text {
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.3em; text-transform: uppercase;
    color: #FF8D00;
  }
  .hero-title {
    font-size: 40px; font-weight: 900; line-height: 1.15;
    color: #000000; margin-bottom: 16px;
  }
  .hero-desc { font-size: 15px; line-height: 1.7; color: #696969; max-width: 512px; }
  .hero-desc strong { color: #000000; }

  .hero-meta {
    display: flex; flex-direction: column; align-items: flex-end;
    gap: 4px; text-align: right; margin-top: 24px;
  }
  .meta-label {
    font-size: 11px; letter-spacing: 0.15em;
    text-transform: uppercase; font-weight: 600;
    color: #696969;
  }
  .meta-code { font-size: 24px; font-weight: 900; color: #000000; }
  .meta-date { font-size: 12px; color: #696969; }

  @media (min-width: 1024px) {
    .hero-grid { display: flex; justify-content: space-between; align-items: flex-end; }
    .hero-meta { margin-top: 0; }
    .hero-title { font-size: 48px; }
  }

  /* Client Bar */
  .client-bar {
    border-top: 1px solid #D4D4D4;
    border-bottom: 1px solid #D4D4D4;
    background: #FAFAFA; padding: 32px 0;
  }
  .client-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
  @media (min-width: 640px) { .client-grid { grid-template-columns: 1fr 1fr; gap: 48px; } }
  .client-label {
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.25em; text-transform: uppercase;
    margin-bottom: 8px; display: block;
  }
  .client-name { font-size: 24px; font-weight: 900; color: #000000; }
  .client-sub { font-size: 13px; margin-top: 4px; color: #696969; }

  /* Sections */
  .section { padding: 48px 0; }
  .section-header { margin-bottom: 40px; }
  .section-tag {
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.25em; text-transform: uppercase;
    display: block; margin-bottom: 8px;
  }
  .section-title { font-size: 28px; font-weight: 900; color: #000000; }
  .section-desc { font-size: 14px; margin-top: 8px; max-width: 640px; line-height: 1.6; }

  /* Service Cards */
  .services-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
  @media (min-width: 768px) { .services-grid { grid-template-columns: 1fr 1fr; } }
  .service-card {
    background: #FFFFFF; border: none; border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06); padding: 24px;
  }
  .service-card.blue { border-top: 4px solid #00C0FF; }
  .service-card.orange { border-top: 4px solid #FF8D00; }
  .service-icon {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px; font-size: 20px;
  }
  .service-icon.blue { background: #00C0FF15; color: #00C0FF; }
  .service-icon.orange { background: #FF8D0015; color: #FF8D00; }
  .service-title { font-size: 16px; font-weight: 700; color: #000000; margin-bottom: 8px; }
  .service-desc { font-size: 12px; line-height: 1.6; color: #696969; margin-bottom: 16px; }
  .service-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .service-list li {
    display: flex; align-items: flex-start; gap: 8px;
    font-size: 12px; color: #696969;
  }
  .check { width: 14px; height: 14px; flex-shrink: 0; margin-top: 2px; }
  .check.blue { color: #00C0FF; }
  .check.orange { color: #FF8D00; }

  /* Methodology */
  .methodology {
    background: #000000; color: #FFFFFF; padding: 64px 0;
  }
  .methodology .section-title { color: #FFFFFF; }
  .methodology .section-desc { color: #999; }
  .method-grid { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 40px; }
  @media (min-width: 640px) { .method-grid { grid-template-columns: 1fr 1fr; } }
  @media (min-width: 1024px) { .method-grid { grid-template-columns: 1fr 1fr 1fr 1fr; } }
  .method-step {}
  .method-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .method-icon {
    width: 40px; height: 40px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .method-label {
    font-size: 10px; font-family: monospace;
    letter-spacing: 0.15em; color: #696969;
  }
  .method-title { font-size: 15px; font-weight: 700; color: #FFFFFF; margin-bottom: 4px; }
  .method-desc { font-size: 12px; line-height: 1.6; color: #999; }

  /* Pricing */
  .pricing-grid { display: grid; grid-template-columns: 1fr; gap: 24px; max-width: 820px; margin: 0 auto; }
  @media (min-width: 768px) { .pricing-grid { grid-template-columns: 1fr 1fr 1fr; } }
  .pricing-card {
    background: #FFFFFF; border: 2px solid #D4D4D4;
    border-radius: 12px; padding: 32px; position: relative;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .pricing-badge {
    position: absolute; top: 0; right: 0; padding: 6px 12px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; border-radius: 0 12px 0 8px;
  }
  .pricing-badge.recommended {
    color: #FF8D00; border: 1px solid #FF8D0040;
    background: #FF8D0008;
  }
  .pricing-badge.premium {
    color: #00C0FF; border: 1px solid #00C0FF40;
    background: #00C0FF08;
  }
  .pricing-type-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
  .pricing-type-icon { font-size: 18px; }
  .pricing-type-label { font-size: 13px; font-weight: 700; letter-spacing: 0.05em; }
  .pricing-type-label.blue { color: #00C0FF; }
  .pricing-type-label.orange { color: #FF8D00; }
  .pricing-name { font-size: 16px; font-weight: 700; color: #000000; margin-bottom: 4px; }
  .pricing-desc { font-size: 12px; line-height: 1.6; color: #696969; margin-bottom: 20px; }
  .pricing-price { font-size: 48px; font-weight: 900; color: #000000; display: inline-block; }
  .pricing-price .currency { font-size: 24px; vertical-align: super; margin-right: 2px; }
  .pricing-period { font-size: 14px; color: #696969; margin-left: 4px; }
  .pricing-separator { height: 1px; background: #D4D4D4; margin: 20px 0; }
  .pricing-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .pricing-list li {
    display: flex; align-items: flex-start; gap: 8px;
    font-size: 12px; color: #696969;
  }

  /* Table */
  .table-section {
    border-top: 1px solid #D4D4D4;
    border-bottom: 1px solid #D4D4D4;
    background: #FAFAFA; padding: 48px 0;
  }
  .table-wrapper {
    border: 1px solid #D4D4D4;
    border-radius: 12px; overflow: hidden;
  }
  .table-row {
    display: grid; grid-template-columns: 40px 1fr 1fr 100px;
    gap: 8px; padding: 12px 24px; align-items: center;
    font-size: 12px;
  }
  .table-header {
    background: #000000; color: white;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 12px 24px;
  }
  .table-row.bordered { border-bottom: 1px solid #D4D4D4; }
  .table-row .item { color: #696969; }
  .table-row .package { font-weight: 600; font-size: 13px; color: #000000; }
  .table-row .value { font-weight: 700; text-align: right; }
  .table-row .desc { text-align: center; }
  .table-sub { padding-left: 16px; }

  .savings-note {
    margin-top: 24px; padding: 12px 16px; border-radius: 8px;
    font-size: 12px; color: #696969;
    background: #00C0FF08;
    border-left: 3px solid #00C0FF;
    display: flex; align-items: flex-start; gap: 8px;
  }
  .savings-note strong { color: #000000; }
  .savings-note .highlight { color: #00C0FF; }

  /* Timeline */
  .timeline-grid { display: grid; grid-template-columns: 1fr; gap: 16px; max-width: 896px; }
  @media (min-width: 640px) { .timeline-grid { grid-template-columns: 1fr 1fr 1fr 1fr; } }
  .timeline-card {
    padding: 20px; border-radius: 12px; border: 1px solid;
  }
  .timeline-phase {
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    display: block; margin-bottom: 4px;
  }
  .timeline-title { font-size: 15px; font-weight: 700; color: #000000; margin-bottom: 8px; }
  .timeline-desc { font-size: 12px; line-height: 1.6; color: #696969; }

  .note-box {
    margin-top: 24px; padding: 12px 16px; border-radius: 8px;
    font-size: 12px; color: #696969;
    background: #FF8D0008;
    border-left: 3px solid #FF8D00;
    display: flex; align-items: flex-start; gap: 8px;
    max-width: 896px;
  }
  .note-box strong { color: #000000; }

  /* Terms */
  .terms-section {
    border-top: 1px solid #D4D4D4;
    background: #FAFAFA; padding: 48px 0;
  }
  .terms-list { max-width: 720px; display: flex; flex-direction: column; gap: 8px; }
  .term-item {
    background: #FFFFFF;
    border: 1px solid #D4D4D4;
    border-radius: 8px; overflow: hidden;
  }
  .term-question {
    padding: 12px 16px; font-size: 13px; font-weight: 600;
    color: #000000; cursor: default;
  }
  .term-answer {
    padding: 0 16px 16px; font-size: 12px;
    line-height: 1.7; color: #696969;
  }

  /* CTA */
  .cta-section { padding: 48px 0; }
  .cta-box {
    background: #000000; border-radius: 16px;
    padding: 48px; text-align: center; position: relative; overflow: hidden;
  }
  .cta-box::before {
    content: ''; position: absolute; top: -40px; right: -40px;
    width: 160px; height: 160px; border-radius: 50%;
    background: #00C0FF; opacity: 0.1;
  }
  .cta-box::after {
    content: ''; position: absolute; bottom: -32px; left: -32px;
    width: 128px; height: 128px; border-radius: 50%;
    background: #FF8D00; opacity: 0.1;
  }
  .cta-inner { position: relative; z-index: 1; }
  .cta-dots { display: flex; justify-content: center; gap: 4px; margin-bottom: 16px; }
  .cta-dot { width: 8px; height: 8px; border-radius: 50%; }
  .cta-title { font-size: 28px; font-weight: 900; color: white; margin-bottom: 12px; }
  .cta-desc { font-size: 14px; color: #999; max-width: 448px; margin: 0 auto 32px; }

  /* Footer */
  .footer {
    border-top: 1px solid #D4D4D4; padding: 32px 0;
  }
  .footer-inner {
    display: flex; flex-direction: column; align-items: center;
    gap: 16px;
  }
  @media (min-width: 640px) {
    .footer-inner { flex-direction: row; justify-content: space-between; }
  }
  .footer-brand { display: flex; align-items: center; gap: 12px; }
  .footer-brand-text {
    font-size: 10px; letter-spacing: 0.15em;
    text-transform: uppercase; color: #696969;
  }
  .footer-meta { display: flex; align-items: center; gap: 16px; }
  .footer-code { font-size: 10px; color: #D4D4D4; }
  .footer-dots { display: flex; gap: 4px; }
  .footer-dot { width: 6px; height: 6px; border-radius: 50%; }

  /* Print styles */
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .header::before, .header::after, .cta-box::before, .cta-box::after { display: none; }
  }

</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div class="container header-inner">
    <div class="logo-row">
      <img src="${LOGO_NEGRO_BASE64}" alt="SUGGESTION" style="height:32px;width:auto;">
      <div class="logo-subtitle">Agencia de Marketing &amp; Publicidad</div>
    </div>
    <div class="hero-grid">
      <div>
        <div class="tag-row">
          <div class="tag-bar"></div>
          <div class="tag-text">Proforma de Servicios</div>
        </div>
        <h1 class="hero-title">${services.length === 1 ? escapeHtml(services[0].name) : services.map(s => escapeHtml(s.name)).join(' + ')} para ${escapeHtml(client.name)}</h1>
        <p class="hero-desc">Propuesta profesional de servicios de marketing y publicidad para <strong>${escapeHtml(client.name)}</strong>. Inicio de servicios: <strong>${client.startDate || dateStr}</strong>${client.location ? ` en <strong>${escapeHtml(client.location)}</strong>` : ''}.</p>
      </div>
      <div class="hero-meta">
        <span class="meta-label">Código</span>
        <span class="meta-code">${proformaCode}</span>
        <span class="meta-date">${dateStr}${client.location ? ' · ' + escapeHtml(client.location) : ''}</span>
      </div>
    </div>
  </div>
</div>

<!-- CLIENT BAR -->
<div class="client-bar">
  <div class="container">
    <div class="client-grid">
      <div>
        <span class="client-label" style="color:#00C0FF">Cliente</span>
        <div class="client-name">${escapeHtml(client.name)}</div>
        <div class="client-sub">${escapeHtml(client.activity)}${client.startDate ? ' · ' + escapeHtml(client.startDate) : ''}${client.location ? ' · ' + escapeHtml(client.location) : ''}</div>
      </div>
      <div>
        <span class="client-label" style="color:#FF8D00">Agencia</span>
        <div class="client-name">SUGGESTION</div>
        <div class="client-sub">Agencia de Marketing &amp; Publicidad</div>
      </div>
    </div>
  </div>
</div>

${servicesSections}

<!-- TERMS -->
<div class="terms-section">
  <div class="container">
    <div class="section-header">
      <span class="section-tag" style="color:#696969">Legal</span>
      <h2 class="section-title">Términos y Condiciones</h2>
      <p class="section-desc">Información importante sobre la contratación de nuestros servicios.</p>
    </div>
    <div class="terms-list">
      ${generateTerms()}
    </div>
  </div>
</div>

<!-- CTA -->
<div class="cta-section">
  <div class="container">
    <div class="cta-box">
      <div class="cta-inner">
        <div class="cta-dots">
          <div class="cta-dot" style="background:#00C0FF"></div>
          <div class="cta-dot" style="background:#FF8D00"></div>
          <div class="cta-dot" style="background:#00C0FF"></div>
        </div>
        <div class="cta-title">¿Listo para empezar?</div>
        <div class="cta-desc">Contáctanos para validar esta propuesta y dar inicio a tu proyecto con SUGGESTION.</div>
        <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:8px;background:#00C0FF;color:white;font-size:13px;font-weight:700;">📧 hola@suggestion.pe</div>
          <div style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:8px;border:1px solid #FF8D00;color:#FF8D00;font-size:13px;font-weight:700;">📱 +51 999 888 777</div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- FOOTER -->
<div class="footer">
  <div class="container">
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="${LOGO_NEGRO_BASE64}" alt="SUGGESTION" style="height:24px;width:auto;">
        <div class="footer-brand-text">SUGGESTION — Agencia de Marketing &amp; Publicidad</div>
      </div>
      <div class="footer-meta">
        <div class="footer-code">${proformaCode}</div>
        <div class="footer-dots">
          <div class="footer-dot" style="background:#00C0FF"></div>
          <div class="footer-dot" style="background:#FF8D00"></div>
          <div class="footer-dot" style="background:#00C0FF"></div>
        </div>
      </div>
    </div>
  </div>
</div>

</body>
</html>`
}
