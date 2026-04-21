import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const services = [
  {
    name: "Marketing Digital",
    slug: "marketing-digital",
    description: "Estrategias integrales que transforman tu presencia digital en resultados medibles y sostenibles.",
    icon: "📈",
    category: "principal",
    methodology: JSON.stringify([
      {phase:"01",title:"Descubrimiento",description:"Analizamos tu negocio, competencia y mercado para identificar oportunidades.",iconBg:"#00C0FF25",iconColor:"#00C0FF",iconEmoji:"🔍"},
      {phase:"02",title:"Estrategia",description:"Diseñamos un plan personalizado con objetivos claros y medibles.",iconBg:"#FF8D0025",iconColor:"#FF8D00",iconEmoji:"📋"},
      {phase:"03",title:"Ejecución",description:"Implementamos la estrategia con agilidad y comunicación transparente.",iconBg:"rgba(255,255,255,0.1)",iconColor:"white",iconEmoji:"✨"},
      {phase:"04",title:"Optimización",description:"Medimos resultados y optimizamos continuamente para maximizar el ROI.",iconBg:"#00C0FF15",iconColor:"#00C0FF",iconEmoji:"📊"}
    ]),
    plans: [
      { name:"Starter", price:1500, originalPrice:3000, period:"/mes", description:"Estrategia básica", features:JSON.stringify(["Estrategia básica","2 redes sociales","8 publicaciones/mes","Reporte mensual","Soporte por email"]), badge:null, isRecommended:false, order:0 },
      { name:"Pro", price:2500, originalPrice:4170, period:"/mes", description:"Para negocios en crecimiento", features:JSON.stringify(["Estrategia avanzada","4 redes sociales","15 publicaciones/mes","1 campaña publicitaria","Reporte quincenal","Soporte prioritario"]), badge:"Más Popular", isRecommended:true, order:1 },
      { name:"Enterprise", price:4500, originalPrice:6430, period:"/mes", description:"Estrategias omnicanal y escalables", features:JSON.stringify(["Estrategia integral","Redes ilimitadas","Múltiples campañas","SEO avanzado","Reporte en tiempo real","Reunión semanal"]), badge:null, isRecommended:false, order:2 }
    ]
  },
  {
    name: "Redes Sociales",
    slug: "marketing-redes-sociales",
    description: "Gestión profesional de comunidades y contenido que conecta con tu audiencia de forma auténtica.",
    icon: "📱",
    category: "principal",
    methodology: JSON.stringify([
      {phase:"01",title:"Auditoría",description:"Analizamos tu presencia actual, competencia y oportunidades.",iconBg:"#00C0FF25",iconColor:"#00C0FF",iconEmoji:"🔍"},
      {phase:"02",title:"Estrategia",description:"Definimos tono, contenido y canales según tu audiencia.",iconBg:"#FF8D0025",iconColor:"#FF8D00",iconEmoji:"📋"},
      {phase:"03",title:"Creación",description:"Producimos contenido atractivo y relevante constantemente.",iconBg:"rgba(255,255,255,0.1)",iconColor:"white",iconEmoji:"🎨"},
      {phase:"04",title:"Optimización",description:"Medimos resultados y ajustamos para máximo impacto.",iconBg:"#00C0FF15",iconColor:"#00C0FF",iconEmoji:"📊"}
    ]),
    plans: [
      { name:"Starter", price:800, originalPrice:1600, period:"/mes", description:"", features:JSON.stringify(["2 redes sociales","12 publicaciones/mes","Diseño gráfico básico","Calendario editorial","Reporte mensual","1 revisión de contenido"]), badge:null, isRecommended:false, order:0 },
      { name:"Business", price:1500, originalPrice:2500, period:"/mes", description:"", features:JSON.stringify(["3 redes sociales","24 publicaciones/mes","Stories semanales (16/mes)","4 Reels/TikToks mensuales","Gestión de comunidad","Diseño profesional premium","Reporte quincenal","Respuesta a mensajes"]), badge:"Más Popular", isRecommended:true, order:1 },
      { name:"Premium", price:2800, originalPrice:4000, period:"/mes", description:"", features:JSON.stringify(["4+ redes sociales","Publicaciones diarias","Stories diarios","8 Reels/TikToks mensuales","Gestión de comunidad 24/7","Diseño premium animado","Reporte semanal","Estrategia personalizada"]), badge:null, isRecommended:false, order:2 }
    ]
  },
  {
    name: "Publicidad Digital",
    slug: "publicidad-digital",
    description: "Campañas en Meta Ads, Google Ads y más con ROI medible y optimización continua.",
    icon: "🎯",
    category: "principal",
    methodology: JSON.stringify([
      {phase:"01",title:"Estrategia",description:"Definimos objetivos, presupuesto y canales según tu negocio.",iconBg:"#00C0FF25",iconColor:"#00C0FF",iconEmoji:"🎯"},
      {phase:"02",title:"Setup",description:"Configuramos cuentas, píxeles, audiences y campañas.",iconBg:"#FF8D0025",iconColor:"#FF8D00",iconEmoji:"⚙️"},
      {phase:"03",title:"Lanzamiento",description:"Activamos campañas con testing inicial de variables.",iconBg:"rgba(255,255,255,0.1)",iconColor:"white",iconEmoji:"🚀"},
      {phase:"04",title:"Escala",description:"Optimizamos y escalamos lo que funciona, eliminamos lo que no.",iconBg:"#00C0FF15",iconColor:"#00C0FF",iconEmoji:"📈"}
    ]),
    plans: [
      { name:"Starter", price:800, originalPrice:1600, period:"/mes", description:"+ 15% ad spend", features:JSON.stringify(["1 plataforma","3 grupos de anuncios","Reporte semanal","Optimización básica"]), badge:null, isRecommended:false, order:0 },
      { name:"Business", price:1500, originalPrice:2500, period:"/mes", description:"+ 12% ad spend", features:JSON.stringify(["2 plataformas","Grupos ilimitados","Reporte en tiempo real","A/B testing","Landing page"]), badge:"Más Popular", isRecommended:true, order:1 },
      { name:"Enterprise", price:3000, originalPrice:4290, period:"/mes", description:"+ 10% ad spend", features:JSON.stringify(["Todas las plataformas","Campañas ilimitadas","Consultor dedicado","Funnel completo","Attribution modeling"]), badge:null, isRecommended:false, order:2 }
    ]
  },
  {
    name: "SEO",
    slug: "seo-posicionamiento",
    description: "Posicionamiento orgánico que te hace visible cuando tus clientes te buscan.",
    icon: "🔍",
    category: "principal",
    methodology: JSON.stringify([
      {phase:"01",title:"Auditoría",description:"Analizamos tu sitio, competencia y oportunidades de posicionamiento.",iconBg:"#00C0FF25",iconColor:"#00C0FF",iconEmoji:"🔍"},
      {phase:"02",title:"Estrategia",description:"Plan de palabras clave, contenido y optimización técnica.",iconBg:"#FF8D0025",iconColor:"#FF8D00",iconEmoji:"📋"},
      {phase:"03",title:"Implementación",description:"Ejecutamos optimizaciones y creamos contenido SEO.",iconBg:"rgba(255,255,255,0.1)",iconColor:"white",iconEmoji:"⚡"},
      {phase:"04",title:"Escalamiento",description:"Medimos resultados y escalamos lo que funciona.",iconBg:"#00C0FF15",iconColor:"#00C0FF",iconEmoji:"📈"}
    ]),
    plans: [
      { name:"Básico", price:1200, originalPrice:2400, period:"/mes", description:"Para webs pequeñas", features:JSON.stringify(["Auditoría inicial","Optimización on-page","5 keywords objetivo","Reporte mensual","Soporte email"]), badge:null, isRecommended:false, order:0 },
      { name:"Profesional", price:2500, originalPrice:4170, period:"/mes", description:"Para pymes", features:JSON.stringify(["Todo lo anterior","SEO técnico avanzado","15 keywords","Contenido mensual","Link building básico"]), badge:"Más Popular", isRecommended:true, order:1 },
      { name:"Enterprise", price:5000, originalPrice:7140, period:"/mes", description:"Para empresas", features:JSON.stringify(["Estrategia completa","Sin límite keywords","Contenido ilimitado","Link building premium","Consultoría dedicada"]), badge:null, isRecommended:false, order:2 }
    ]
  },
  {
    name: "Branding",
    slug: "branding-diseno",
    description: "Identidad visual y estratégica que deja huella en la mente de tu audiencia.",
    icon: "🎨",
    category: "principal",
    methodology: JSON.stringify([
      {phase:"01",title:"Descubrimiento",description:"Entendemos tu negocio, valores y audiencia objetivo.",iconBg:"#00C0FF25",iconColor:"#00C0FF",iconEmoji:"🔍"},
      {phase:"02",title:"Concepto",description:"Exploramos direcciones creativas y definimos el concepto.",iconBg:"#FF8D0025",iconColor:"#FF8D00",iconEmoji:"💡"},
      {phase:"03",title:"Diseño",description:"Desarrollamos el sistema visual completo.",iconBg:"rgba(255,255,255,0.1)",iconColor:"white",iconEmoji:"🎨"},
      {phase:"04",title:"Entrega",description:"Archivos finales, manual y acompañamiento en lanzamiento.",iconBg:"#00C0FF15",iconColor:"#00C0FF",iconEmoji:"📦"}
    ]),
    plans: [
      { name:"Starter", price:1800, originalPrice:3600, period:"(pago único)", description:"Para marcas que necesitan orden y una base sólida", features:JSON.stringify(["Diagnóstico de marca actual","Definición de propuesta de valor","Concepto de marca","Diseño de logotipo principal","Paleta de colores","Tipografías","Manual básico de marca","Entregables listos para uso digital"]), badge:null, isRecommended:false, order:0 },
      { name:"Business", price:3500, originalPrice:5830, period:"(pago único)", description:"", features:JSON.stringify(["Todo lo del plan Starter","Naming (si aplica)","Construcción de identidad de marca","Territorio y personalidad de marca","Sistema visual completo","Aplicaciones: redes sociales, papelería, piezas base","Manual de marca intermedio","Lineamientos de comunicación"]), badge:"Más Popular", isRecommended:true, order:1 },
      { name:"Enterprise", price:6500, originalPrice:9290, period:"(pago único)", description:"", features:JSON.stringify(["Todo lo del plan Business","Estrategia de marca completa","Definición de público y arquetipo","Storytelling de marca","Arquitectura de marca","Desarrollo de tono y voz","Aplicaciones avanzadas","Manual de marca completo","Acompañamiento estratégico"]), badge:null, isRecommended:false, order:2 }
    ]
  },
  {
    name: "Desarrollo Web",
    slug: "desarrollo-web",
    description: "Sitios web optimizados, rápidos y diseñados para convertir visitantes en clientes.",
    icon: "💻",
    category: "principal",
    methodology: JSON.stringify([
      {phase:"01",title:"Descubrimiento",description:"Definimos objetivos, funcionalidades y arquitectura del sitio.",iconBg:"#00C0FF25",iconColor:"#00C0FF",iconEmoji:"🔍"},
      {phase:"02",title:"Diseño UX/UI",description:"Wireframes, prototipos y diseño visual de toda la experiencia.",iconBg:"#FF8D0025",iconColor:"#FF8D00",iconEmoji:"🎨"},
      {phase:"03",title:"Desarrollo",description:"Programación con las mejores prácticas y tecnologías modernas.",iconBg:"rgba(255,255,255,0.1)",iconColor:"white",iconEmoji:"💻"},
      {phase:"04",title:"Lanzamiento",description:"Testing, optimización y puesta en producción con soporte.",iconBg:"#00C0FF15",iconColor:"#00C0FF",iconEmoji:"🚀"}
    ]),
    plans: [
      { name:"Landing Page", price:1500, originalPrice:3000, period:"", description:"Una sola página", features:JSON.stringify(["Diseño responsive","Formulario de contacto","Optimización SEO básica","1 revisión incluida"]), badge:null, isRecommended:false, order:0 },
      { name:"Web Corporativa", price:4000, originalPrice:6670, period:"", description:"Hasta 10 páginas", features:JSON.stringify(["Diseño personalizado","CMS incluido","SEO técnico","Formularios","Capacitación"]), badge:"Más Popular", isRecommended:true, order:1 },
      { name:"E-commerce", price:8000, originalPrice:11430, period:"", description:"Tienda online", features:JSON.stringify(["Catálogo ilimitado","Pasarela de pagos","Gestión de inventario","SEO avanzado","Soporte 3 meses"]), badge:null, isRecommended:false, order:2 }
    ]
  },
  {
    name: "Consultoría",
    slug: "consultoria-marketing",
    description: "Asesoría estratégica personalizada para potenciar tu marketing digital.",
    icon: "💡",
    category: "principal",
    methodology: JSON.stringify([
      {phase:"01",title:"Diagnóstico",description:"Entrevistas, auditoría y análisis de situación actual.",iconBg:"#00C0FF25",iconColor:"#00C0FF",iconEmoji:"🔍"},
      {phase:"02",title:"Análisis",description:"Identificación de oportunidades y áreas de mejora.",iconBg:"#FF8D0025",iconColor:"#FF8D00",iconEmoji:"📊"},
      {phase:"03",title:"Propuesta",description:"Documento con plan de acción y roadmap detallado.",iconBg:"rgba(255,255,255,0.1)",iconColor:"white",iconEmoji:"📋"},
      {phase:"04",title:"Implementación",description:"Acompañamiento en la ejecución de recomendaciones.",iconBg:"#00C0FF15",iconColor:"#00C0FF",iconEmoji:"🚀"}
    ]),
    plans: [
      { name:"Diagnóstico", price:1500, originalPrice:3000, period:"", description:"Una sola vez", features:JSON.stringify(["Análisis completo","Informe diagnóstico","Recomendaciones","1 sesión de presentación"]), badge:null, isRecommended:false, order:0 },
      { name:"Plan Completo", price:3500, originalPrice:5830, period:"", description:"", features:JSON.stringify(["Todo lo anterior","Plan de marketing","2 meses seguimiento","Sesiones quincenales"]), badge:"Más Popular", isRecommended:true, order:1 },
      { name:"Retainer Mensual", price:2000, originalPrice:2860, period:"/mes", description:"", features:JSON.stringify(["Consultor dedicado","Reuniones semanales","Ajustes continuos","Soporte ilimitado"]), badge:null, isRecommended:false, order:2 }
    ]
  },
  {
    name: "CRM y Automatización",
    slug: "crm-automatizacion",
    description: "Automatiza procesos y escala tu negocio con herramientas inteligentes.",
    icon: "⚡",
    category: "principal",
    methodology: JSON.stringify([
      {phase:"01",title:"Auditoría",description:"Revisamos tus procesos actuales y herramientas.",iconBg:"#00C0FF25",iconColor:"#00C0FF",iconEmoji:"🔍"},
      {phase:"02",title:"Arquitectura",description:"Diseñamos el flujo de datos y automatizaciones.",iconBg:"#FF8D0025",iconColor:"#FF8D00",iconEmoji:"🏗️"},
      {phase:"03",title:"Implementación",description:"Configuramos CRM, integraciones y workflows.",iconBg:"rgba(255,255,255,0.1)",iconColor:"white",iconEmoji:"⚙️"},
      {phase:"04",title:"Capacitación",description:"Entrenamos a tu equipo y documentamos todo.",iconBg:"#00C0FF15",iconColor:"#00C0FF",iconEmoji:"📚"}
    ]),
    plans: [
      { name:"Starter", price:1800, originalPrice:3600, period:"(pago único)", description:"", features:JSON.stringify(["Implementación de CRM básico","Organización de base de datos","Pipeline de ventas","Asignación de leads automática","Integración con formularios","Automatización básica de seguimiento","Capacitación inicial"]), badge:null, isRecommended:false, order:0 },
      { name:"Business", price:3500, originalPrice:5830, period:"(pago único)", description:"", features:JSON.stringify(["Todo lo del plan Starter","Automatización de tareas comerciales","Seguimiento automático por etapas","Integración con WhatsApp y email","Sistema de alertas y recordatorios","Panel de control","Optimización del flujo de ventas","Capacitación + acompañamiento"]), badge:"Más Popular", isRecommended:true, order:1 },
      { name:"Enterprise", price:6500, originalPrice:9290, period:"(pago único)", description:"", features:JSON.stringify(["Todo lo del plan Business","Automatizaciones avanzadas multi-canal","Secuencias completas de seguimiento","Lead scoring","Integraciones con herramientas externas","Dashboards de métricas","Optimización continua","Consultoría estratégica"]), badge:null, isRecommended:false, order:2 }
    ]
  },
  {
    name: "Producción Audiovisual",
    slug: "produccion-audiovisual",
    description: "Contenido visual de alto impacto que cuenta tu historia de manera memorable.",
    icon: "🎬",
    category: "principal",
    methodology: JSON.stringify([
      {phase:"01",title:"Concepto",description:"Definimos el mensaje, formato y enfoque creativo.",iconBg:"#00C0FF25",iconColor:"#00C0FF",iconEmoji:"💡"},
      {phase:"02",title:"Pre-producción",description:"Guión, locaciones, casting, planificación.",iconBg:"#FF8D0025",iconColor:"#FF8D00",iconEmoji:"📋"},
      {phase:"03",title:"Producción",description:"Grabación con equipo profesional y dirección.",iconBg:"rgba(255,255,255,0.1)",iconColor:"white",iconEmoji:"🎬"},
      {phase:"04",title:"Post-producción",description:"Edición, color, audio, motion graphics, entregables.",iconBg:"#00C0FF15",iconColor:"#00C0FF",iconEmoji:"✂️"}
    ]),
    plans: [
      { name:"Starter", price:1200, originalPrice:2400, period:"/mes", description:"", features:JSON.stringify(["1 jornada de grabación al mes","8 piezas audiovisuales/mes","Edición estándar de video","Adaptación para reels y stories","Entrega de archivos optimizados","Reunión mensual de planificación"]), badge:null, isRecommended:false, order:0 },
      { name:"Business", price:2500, originalPrice:4170, period:"/mes", description:"", features:JSON.stringify(["3 jornadas de grabación al mes","16 piezas audiovisuales/mes","Edición profesional de video","Reels, stories, piezas para pauta y corporativo","Cobertura de producto, servicio o marca","Motion graphics básicos","Reunión semanal de seguimiento"]), badge:"Más Popular", isRecommended:true, order:1 },
      { name:"Enterprise", price:4500, originalPrice:6430, period:"/mes", description:"", features:JSON.stringify(["5 jornadas de grabación al mes","31 piezas audiovisuales/mes","Edición avanzada y narrativa estratégica","Cobertura de campañas, eventos y lanzamientos","Motion graphics y animaciones avanzadas","Guiones y planificación creativa","Prioridad en entregas","Reunión semanal de estrategia y reportes"]), badge:null, isRecommended:false, order:2 }
    ]
  },
  {
    name: "Investigación de Mercado",
    slug: "investigacion-mercado",
    description: "Datos e insights que guían decisiones estratégicas informadas.",
    icon: "📊",
    category: "principal",
    methodology: JSON.stringify([
      {phase:"01",title:"Objetivos",description:"Definimos las preguntas clave que necesitas responder.",iconBg:"#00C0FF25",iconColor:"#00C0FF",iconEmoji:"🎯"},
      {phase:"02",title:"Metodología",description:"Seleccionamos los métodos óptimos para cada objetivo.",iconBg:"#FF8D0025",iconColor:"#FF8D00",iconEmoji:"📋"},
      {phase:"03",title:"Recolección",description:"Ejecutamos investigación de campo y análisis de datos.",iconBg:"rgba(255,255,255,0.1)",iconColor:"white",iconEmoji:"🔬"},
      {phase:"04",title:"Insights",description:"Entregamos hallazgos con recomendaciones accionables.",iconBg:"#00C0FF15",iconColor:"#00C0FF",iconEmoji:"💡"}
    ]),
    plans: [
      { name:"Starter", price:1500, originalPrice:3000, period:"/proyecto", description:"", features:JSON.stringify(["Análisis general del mercado","Perfil de tu cliente ideal","Análisis básico de competencia","50 encuestas a tu público objetivo","Conclusiones claras y accionables","Reporte ejecutivo"]), badge:null, isRecommended:false, order:0 },
      { name:"Business", price:3000, originalPrice:5000, period:"/proyecto", description:"", features:JSON.stringify(["Todo lo del plan Starter","Análisis profundo del cliente","Mapa de competencia","Identificación de oportunidades","150 encuestas a tu público objetivo","Recomendaciones estratégicas","Reporte + presentación"]), badge:"Más Popular", isRecommended:true, order:1 },
      { name:"Enterprise", price:6000, originalPrice:8570, period:"/proyecto", description:"", features:JSON.stringify(["Todo lo del plan Business","Segmentación avanzada del mercado","Customer journey","Análisis de precios y posicionamiento","300 encuestas a tu público objetivo","10-15 entrevistas a clientes reales","Estrategia basada en datos","Presentación + sesión de consultoría"]), badge:null, isRecommended:false, order:2 }
    ]
  },
  {
    name: "Merchandising",
    slug: "merchandising",
    description: "Productos que refuerzan tu marca. Artículos promocionales que la gente realmente quiere usar.",
    icon: "🛍️",
    category: "complementario",
    methodology: JSON.stringify([
      {phase:"01",title:"Briefing",description:"Definimos objetivos, presupuesto y productos ideales.",iconBg:"#00C0FF25",iconColor:"#00C0FF",iconEmoji:"📋"},
      {phase:"02",title:"Propuesta",description:"Catálogo curado con opciones y cotización detallada.",iconBg:"#FF8D0025",iconColor:"#FF8D00",iconEmoji:"📦"},
      {phase:"03",title:"Aprobación",description:"Muestras físicas y diseño final para aprobación.",iconBg:"rgba(255,255,255,0.1)",iconColor:"white",iconEmoji:"✅"},
      {phase:"04",title:"Entrega",description:"Producción y logística hasta tu puerta.",iconBg:"#00C0FF15",iconColor:"#00C0FF",iconEmoji:"🚚"}
    ]),
    plans: [
      { name:"Starter", price:1500, originalPrice:3000, period:"", description:"", features:JSON.stringify(["Catálogo curado de productos","Cotización detallada","Diseño de imprint","Muestra digital","Entrega estándar"]), badge:null, isRecommended:false, order:0 },
      { name:"Business", price:3500, originalPrice:5830, period:"", description:"", features:JSON.stringify(["Todo lo anterior","Muestra física","Personalización avanzada","Kit de productos","Diseño de empaque"]), badge:"Más Popular", isRecommended:true, order:1 },
      { name:"Enterprise", price:6500, originalPrice:9290, period:"", description:"", features:JSON.stringify(["Todo lo anterior","Producción express","Diseño de empaque premium","Logística nacional","Asesoría estratégica de marca"]), badge:null, isRecommended:false, order:2 }
    ]
  },
  {
    name: "Imprenta Corporativa",
    slug: "imprenta-corporativa",
    description: "Material impreso de calidad. Producción de materiales impresos con la calidad que tu marca merece.",
    icon: "🖨️",
    category: "complementario",
    methodology: JSON.stringify([
      {phase:"01",title:"Brief",description:"Definimos piezas, cantidades y acabados.",iconBg:"#00C0FF25",iconColor:"#00C0FF",iconEmoji:"📋"},
      {phase:"02",title:"Diseño",description:"Arte final con especificaciones técnicas.",iconBg:"#FF8D0025",iconColor:"#FF8D00",iconEmoji:"🎨"},
      {phase:"03",title:"Producción",description:"Impresión con acabados seleccionados.",iconBg:"rgba(255,255,255,0.1)",iconColor:"white",iconEmoji:"🖨️"},
      {phase:"04",title:"Entrega",description:"Control de calidad y entrega.",iconBg:"#00C0FF15",iconColor:"#00C0FF",iconEmoji:"📦"}
    ]),
    plans: [
      { name:"Starter", price:1500, originalPrice:3000, period:"", description:"", features:JSON.stringify(["Tarjetas de presentación","Papelería básica","Diseño incluido","Impresión digital","Entrega estándar"]), badge:null, isRecommended:false, order:0 },
      { name:"Business", price:3500, originalPrice:5830, period:"", description:"", features:JSON.stringify(["Todo lo anterior","Folletos y flyers","Catálogos","Acabados especiales","Impresión offset"]), badge:"Más Popular", isRecommended:true, order:1 },
      { name:"Enterprise", price:6500, originalPrice:9290, period:"", description:"", features:JSON.stringify(["Todo lo anterior","Catálogos de alta gama","Encuadernación profesional","Acabados premium","Entrega express"]), badge:null, isRecommended:false, order:2 }
    ]
  },
  {
    name: "Estructuras Publicitarias",
    slug: "estructuras-publicitarias",
    description: "Publicidad de gran impacto. Billboards, espectaculares, mupis y pantallas LED que capturan la atención.",
    icon: "📐",
    category: "complementario",
    methodology: JSON.stringify([
      {phase:"01",title:"Análisis",description:"Definimos ubicaciones según tu target y presupuesto.",iconBg:"#00C0FF25",iconColor:"#00C0FF",iconEmoji:"🗺️"},
      {phase:"02",title:"Propuesta",description:"Mapa con ubicaciones, fotos, tráfico y precios.",iconBg:"#FF8D0025",iconColor:"#FF8D00",iconEmoji:"📋"},
      {phase:"03",title:"Producción",description:"Diseño e impresión del material publicitario.",iconBg:"rgba(255,255,255,0.1)",iconColor:"white",iconEmoji:"🖨️"},
      {phase:"04",title:"Instalación",description:"Colocación y monitoreo durante la campaña.",iconBg:"#00C0FF15",iconColor:"#00C0FF",iconEmoji:"🏗️"}
    ]),
    plans: [
      { name:"Starter", price:3000, originalPrice:6000, period:"/mes", description:"", features:JSON.stringify(["1 ubicación estratégica","Mupi o cartelería","Diseño incluido","Instalación","Reporte mensual"]), badge:null, isRecommended:false, order:0 },
      { name:"Business", price:6000, originalPrice:10000, period:"/mes", description:"", features:JSON.stringify(["3 ubicaciones","Billboard o pantalla LED","Diseño incluido","Instalación y monitoreo","Reporte quincenal"]), badge:"Más Popular", isRecommended:true, order:1 },
      { name:"Enterprise", price:12000, originalPrice:20000, period:"/mes", description:"", features:JSON.stringify(["Cobertura multi-ciudad","Múltiples formatos","Campaña integrada","Monitoreo 24/7","Reporte semanal","Consultor dedicado"]), badge:null, isRecommended:false, order:2 }
    ]
  },
  {
    name: "Publicidad Móvil",
    slug: "publicidad-movil",
    description: "Tu marca en movimiento. Publicidad que va donde está tu audiencia.",
    icon: "🚛",
    category: "complementario",
    methodology: JSON.stringify([
      {phase:"01",title:"Estrategia",description:"Definimos zonas objetivo y rutas óptimas.",iconBg:"#00C0FF25",iconColor:"#00C0FF",iconEmoji:"🗺️"},
      {phase:"02",title:"Producción",description:"Diseño e impresión del material publicitario.",iconBg:"#FF8D0025",iconColor:"#FF8D00",iconEmoji:"🎨"},
      {phase:"03",title:"Instalación",description:"Aplicación profesional en vehículos o pantallas.",iconBg:"rgba(255,255,255,0.1)",iconColor:"white",iconEmoji:"🔧"},
      {phase:"04",title:"Operación",description:"Ejecución de rutas con tracking y reportes.",iconBg:"#00C0FF15",iconColor:"#00C0FF",iconEmoji:"📍"}
    ]),
    plans: [
      { name:"Starter", price:70, originalPrice:140, period:"por día", description:"Contrato mínimo: 15 días", features:JSON.stringify(["1 Bicivalla luminosa","Activación de 4 horas diarias","Recorrido en zonas estratégicas","Visibilidad diurna y nocturna"]), badge:null, isRecommended:false, order:0 },
      { name:"Business", price:120, originalPrice:200, period:"por día", description:"Contrato mínimo: 15 días", features:JSON.stringify(["1 Bicivalla luminosa + 1 Bicipluma","Activación de 4 horas diarias","Mayor cobertura en campo","Refuerzo de impacto visual"]), badge:"Más Popular", isRecommended:true, order:1 },
      { name:"Enterprise", price:150, originalPrice:210, period:"por día", description:"Contrato mínimo: 15 días", features:JSON.stringify(["1 Bicivalla luminosa + 2 Biciplumas","Activación de 4 horas diarias","Alta visibilidad en todo momento","Mayor recordación de marca"]), badge:null, isRecommended:false, order:2 }
    ]
  },
  {
    name: "BTL y Activaciones",
    slug: "btl-activaciones",
    description: "Experiencias que conectan. Creamos experiencias presenciales que dejan huella.",
    icon: "✨",
    category: "complementario",
    methodology: JSON.stringify([
      {phase:"01",title:"Concepto",description:"Idea creativa alineada a objetivos de marca.",iconBg:"#00C0FF25",iconColor:"#00C0FF",iconEmoji:"💡"},
      {phase:"02",title:"Planificación",description:"Logística, permisos, recursos y cronograma.",iconBg:"#FF8D0025",iconColor:"#FF8D00",iconEmoji:"📋"},
      {phase:"03",title:"Producción",description:"Montaje, staff, materiales y ejecución.",iconBg:"rgba(255,255,255,0.1)",iconColor:"white",iconEmoji:"🎪"},
      {phase:"04",title:"Informe",description:"Métricas, fotos, videos y learnings.",iconBg:"#00C0FF15",iconColor:"#00C0FF",iconEmoji:"📊"}
    ]),
    plans: [
      { name:"Starter", price:1050, originalPrice:2100, period:"/activación", description:"", features:JSON.stringify(["Activación de 3 horas","1 anfitriona/publiman","1 animador","1 volantero","1 supervisor","Captación básica de leads","Reporte fotográfico"]), badge:null, isRecommended:false, order:0 },
      { name:"Business", price:1800, originalPrice:3000, period:"/activación", description:"", features:JSON.stringify(["Activación de 3 horas","3 anfitrionas/publiman","1 animador + 2 volanteros","1 personaje","1 supervisor","Dinámica de interacción","Captación estructurada de leads","Base de datos entregable","Reporte fotográfico"]), badge:"Más Popular", isRecommended:true, order:1 },
      { name:"Enterprise", price:2400, originalPrice:3430, period:"/activación", description:"", features:JSON.stringify(["Activación de 3 horas","2 anfitrionas/publiman","1 animador + 1 volantero","1 personaje","1 supervisor","Experiencia de marca completa","Alta captación de leads","Base de datos lista para ventas","Reporte fotográfico"]), badge:null, isRecommended:false, order:2 }
    ]
  },
  {
    name: "Material POP",
    slug: "material-pop",
    description: "Destaca en el punto de venta. Diseñamos y producimos materiales POP que capturan la atención.",
    icon: "🏷️",
    category: "complementario",
    methodology: JSON.stringify([
      {phase:"01",title:"Brief",description:"Objetivos, puntos de venta, productos a exhibir.",iconBg:"#00C0FF25",iconColor:"#00C0FF",iconEmoji:"📋"},
      {phase:"02",title:"Diseño",description:"Concepto, renders y aprobación visual.",iconBg:"#FF8D0025",iconColor:"#FF8D00",iconEmoji:"🎨"},
      {phase:"03",title:"Producción",description:"Fabricación con materiales de calidad.",iconBg:"rgba(255,255,255,0.1)",iconColor:"white",iconEmoji:"🏭"},
      {phase:"04",title:"Instalación",description:"Logística y colocación en tiendas.",iconBg:"#00C0FF15",iconColor:"#00C0FF",iconEmoji:"🏪"}
    ]),
    plans: [
      { name:"Starter", price:2000, originalPrice:4000, period:"", description:"", features:JSON.stringify(["Displays de mostrador","Diseño incluido","Producción estándar","Entrega coordinada"]), badge:null, isRecommended:false, order:0 },
      { name:"Business", price:4500, originalPrice:7500, period:"", description:"", features:JSON.stringify(["Todo lo anterior","Displays de piso","Cabeceras de góndola","Cartelería completa","Instalación en tiendas"]), badge:"Más Popular", isRecommended:true, order:1 },
      { name:"Enterprise", price:8000, originalPrice:13000, period:"", description:"", features:JSON.stringify(["Todo lo anterior","Islas y shop-in-shop","Mobiliario personalizado","Producción premium","Instalación nacional","Seguimiento y reporte"]), badge:null, isRecommended:false, order:2 }
    ]
  }
]

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.clientService.deleteMany()
  await prisma.plan.deleteMany()
  await prisma.client.deleteMany()
  await prisma.service.deleteMany()

  for (const svc of services) {
    const { plans, ...svcData } = svc
    const service = await prisma.service.create({
      data: {
        ...svcData,
        plans: {
          create: plans
        }
      }
    })
    console.log(`✅ Created service: ${service.name} with ${plans.length} plans`)
  }

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
