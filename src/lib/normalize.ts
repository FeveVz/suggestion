/**
 * Normalize Supabase data to match the frontend's expected structure.
 * Supabase returns related tables with PascalCase names (e.g., Plan, Service),
 * but the frontend expects camelCase (plans, service).
 */

interface Plan {
  id: string
  name: string
  price: number
  originalPrice: number | null
  period: string
  description: string
  features: string
  badge: string | null
  isRecommended: boolean
  order: number
}

interface Service {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  category: string
  methodology: string | null
  plans: Plan[]
}

interface ClientService {
  id: string
  clientId: string
  serviceId: string
  selectedPlanId: string | null
  service: Service
  selectedPlan: Plan | null
}

/**
 * Normalize a Service object from Supabase format
 * Converts Service.Plan[] -> Service.plans[] and sorts by order
 */
export function normalizeService(raw: Record<string, unknown>): Service {
  const plans = ((raw.Plan || raw.plans || []) as Record<string, unknown>[])
    .sort((a, b) => (a.order as number) - (b.order as number))
    .map(p => ({
      id: p.id as string,
      name: p.name as string,
      price: p.price as number,
      originalPrice: p.originalPrice as number | null,
      period: p.period as string,
      description: p.description as string,
      features: p.features as string,
      badge: p.badge as string | null,
      isRecommended: p.isRecommended as boolean,
      order: p.order as number,
    }))

  return {
    id: raw.id as string,
    name: raw.name as string,
    slug: raw.slug as string,
    description: raw.description as string,
    icon: raw.icon as string,
    category: raw.category as string,
    methodology: raw.methodology as string | null,
    plans,
  }
}

/**
 * Normalize a ClientService object from Supabase format
 * Converts cs.Service -> cs.service, cs.SelectedPlan -> cs.selectedPlan
 * and normalizes the nested Service.plans
 */
export function normalizeClientService(raw: Record<string, unknown>): ClientService {
  const service = normalizeService((raw.Service || raw.service || {}) as Record<string, unknown>)

  let selectedPlan: Plan | null = null
  const rawPlan = raw.SelectedPlan || raw.selectedPlan
  if (rawPlan && typeof rawPlan === 'object' && Object.keys(rawPlan as object).length > 0) {
    const sp = rawPlan as Record<string, unknown>
    selectedPlan = {
      id: sp.id as string,
      name: sp.name as string,
      price: sp.price as number,
      originalPrice: sp.originalPrice as number | null,
      period: sp.period as string,
      description: sp.description as string,
      features: sp.features as string,
      badge: sp.badge as string | null,
      isRecommended: sp.isRecommended as boolean,
      order: sp.order as number,
    }
  }

  return {
    id: raw.id as string,
    clientId: raw.clientId as string,
    serviceId: raw.serviceId as string,
    selectedPlanId: raw.selectedPlanId as string | null,
    service,
    selectedPlan,
  }
}

// Talent interface
export interface Talent {
  id: string
  name: string
  email: string
  role: string
  phone: string
  active: boolean
  createdAt: string
  updatedAt: string
}

// Task interface
export interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  deadline: string | null
  talentId: string | null
  clientServiceId: string | null
  serviceId: string
  clientId: string
  additionalInfo: string
  createdAt: string
  updatedAt: string
  // Joined relations (optional, when fetched with includes)
  talent?: Talent
  service?: Service
  client?: { id: string; name: string }
}

// TaskTemplate interface
export interface TaskTemplate {
  id: string
  serviceId: string
  title: string
  description: string
  priority: string
  deadlineDays: number
  role: string
  order: number
  createdAt: string
  updatedAt: string
  // Joined relation
  service?: Service
}

/**
 * Normalize a Talent object from Supabase format
 * Removes password for safety
 */
export function normalizeTalent(raw: Record<string, unknown>): Talent {
  return {
    id: raw.id as string,
    name: raw.name as string,
    email: raw.email as string,
    role: raw.role as string,
    phone: (raw.phone as string) || '',
    active: raw.active as boolean,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  }
}

/**
 * Normalize a Task object from Supabase format
 * Converts Task.Talent -> task.talent, Task.Service -> task.service, Task.Client -> task.client
 */
export function normalizeTask(raw: Record<string, unknown>): Task {
  const task: Task = {
    id: raw.id as string,
    title: raw.title as string,
    description: (raw.description as string) || '',
    status: (raw.status as string) || 'pendiente',
    priority: (raw.priority as string) || 'media',
    deadline: (raw.deadline as string) || null,
    talentId: (raw.talentId as string) || null,
    clientServiceId: (raw.clientServiceId as string) || null,
    serviceId: raw.serviceId as string,
    clientId: raw.clientId as string,
    additionalInfo: (raw.additionalInfo as string) || '',
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  }

  // Normalize joined relations
  const rawTalent = raw.Talent || raw.talent
  if (rawTalent && typeof rawTalent === 'object' && Object.keys(rawTalent as object).length > 0) {
    task.talent = normalizeTalent(rawTalent as Record<string, unknown>)
  }

  const rawService = raw.Service || raw.service
  if (rawService && typeof rawService === 'object' && Object.keys(rawService as object).length > 0) {
    task.service = normalizeService(rawService as Record<string, unknown>)
  }

  const rawClient = raw.Client || raw.client
  if (rawClient && typeof rawClient === 'object' && Object.keys(rawClient as object).length > 0) {
    const c = rawClient as Record<string, unknown>
    task.client = { id: c.id as string, name: c.name as string }
  }

  return task
}

/**
 * Normalize a TaskTemplate object from Supabase format
 */
export function normalizeTaskTemplate(raw: Record<string, unknown>): TaskTemplate {
  const template: TaskTemplate = {
    id: raw.id as string,
    serviceId: raw.serviceId as string,
    title: raw.title as string,
    description: (raw.description as string) || '',
    priority: (raw.priority as string) || 'media',
    deadlineDays: (raw.deadlineDays as number) ?? 7,
    role: (raw.role as string) || '',
    order: (raw.order as number) ?? 0,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  }

  const rawService = raw.Service || raw.service
  if (rawService && typeof rawService === 'object' && Object.keys(rawService as object).length > 0) {
    template.service = normalizeService(rawService as Record<string, unknown>)
  }

  return template
}

// ─── New Spanish-named entities (Phase 2) ────────────────────────────────────

// Proyecto

export interface Proyecto {
  id: string
  clienteId: string
  clientServiceId: string | null
  nombre: string
  tipo: 'retainer' | 'proyecto' | 'consultoria'
  subtotal: number
  igv: number
  total: number
  moneda: 'PEN' | 'USD'
  estado: 'propuesta' | 'activo' | 'pausado' | 'cerrado' | 'perdido'
  responsableInterno: string | null
  fechaInicio: string
  fechaFin: string | null
  notas: string | null
  createdAt: string
  updatedAt: string
  // Joined relations (optional, when fetched with includes)
  cliente?: { id: string; name: string }
}

/**
 * Normalize a Proyecto object from Supabase format.
 * Converts numeric strings to numbers for subtotal/igv/total.
 */
export function normalizeProyecto(raw: Record<string, unknown>): Proyecto {
  const proyecto: Proyecto = {
    id: raw.id as string,
    clienteId: raw.clienteId as string,
    clientServiceId: (raw.clientServiceId as string) || null,
    nombre: raw.nombre as string,
    tipo: raw.tipo as Proyecto['tipo'],
    subtotal: Number(raw.subtotal),
    igv: Number(raw.igv),
    total: Number(raw.total),
    moneda: (raw.moneda as 'PEN' | 'USD') || 'PEN',
    estado: raw.estado as Proyecto['estado'],
    responsableInterno: (raw.responsableInterno as string) || null,
    fechaInicio: raw.fechaInicio as string,
    fechaFin: (raw.fechaFin as string) || null,
    notas: (raw.notas as string) || null,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  }

  const rawCliente = raw.Client || raw.cliente
  if (rawCliente && typeof rawCliente === 'object' && Object.keys(rawCliente as object).length > 0) {
    const c = rawCliente as Record<string, unknown>
    proyecto.cliente = { id: c.id as string, name: c.name as string }
  }

  return proyecto
}

// Entregable

export interface Entregable {
  id: string
  proyectoId: string
  nombre: string
  descripcion: string | null
  fechaCompromiso: string
  fechaEntrega: string | null
  estado: 'pendiente' | 'en_proceso' | 'entregado' | 'aprobado' | 'rechazado'
  responsable: string | null
  evidenciaUrl: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Normalize an Entregable object from Supabase format.
 */
export function normalizeEntregable(raw: Record<string, unknown>): Entregable {
  return {
    id: raw.id as string,
    proyectoId: raw.proyectoId as string,
    nombre: raw.nombre as string,
    descripcion: (raw.descripcion as string) || null,
    fechaCompromiso: raw.fechaCompromiso as string,
    fechaEntrega: (raw.fechaEntrega as string) || null,
    estado: raw.estado as Entregable['estado'],
    responsable: (raw.responsable as string) || null,
    evidenciaUrl: (raw.evidenciaUrl as string) || null,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  }
}

// Cobro

export interface Cobro {
  id: string
  proyectoId: string
  concepto: string
  subtotal: number
  igv: number
  total: number
  moneda: 'PEN' | 'USD'
  tipoDocumento: 'factura' | 'boleta' | 'recibo' | null
  numeroDocumento: string | null
  fechaEmision: string
  diasCredito: number
  fechaVencimiento: string
  estado: 'pendiente' | 'parcial' | 'pagado' | 'vencido' | 'anulado'
  createdAt: string
  updatedAt: string
}

/**
 * Normalize a Cobro object from Supabase format.
 * Converts numeric strings to numbers.
 */
export function normalizeCobro(raw: Record<string, unknown>): Cobro {
  return {
    id: raw.id as string,
    proyectoId: raw.proyectoId as string,
    concepto: raw.concepto as string,
    subtotal: Number(raw.subtotal),
    igv: Number(raw.igv),
    total: Number(raw.total),
    moneda: (raw.moneda as 'PEN' | 'USD') || 'PEN',
    tipoDocumento: (raw.tipoDocumento as Cobro['tipoDocumento']) || null,
    numeroDocumento: (raw.numeroDocumento as string) || null,
    fechaEmision: raw.fechaEmision as string,
    diasCredito: Number(raw.diasCredito ?? 0),
    fechaVencimiento: raw.fechaVencimiento as string,
    estado: raw.estado as Cobro['estado'],
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  }
}

// Pago

export interface Pago {
  id: string
  cobroId: string
  monto: number
  fecha: string
  metodo: 'yape' | 'plin' | 'transferencia' | 'efectivo' | 'deposito'
  referencia: string | null
  notas: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Normalize a Pago object from Supabase format.
 */
export function normalizePago(raw: Record<string, unknown>): Pago {
  return {
    id: raw.id as string,
    cobroId: raw.cobroId as string,
    monto: Number(raw.monto),
    fecha: raw.fecha as string,
    metodo: raw.metodo as Pago['metodo'],
    referencia: (raw.referencia as string) || null,
    notas: (raw.notas as string) || null,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  }
}

// Gasto

export interface Gasto {
  id: string
  proyectoId: string | null
  concepto: string
  monto: number
  moneda: 'PEN' | 'USD'
  fecha: string
  categoria: string | null
  comprobante: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Normalize a Gasto object from Supabase format.
 */
export function normalizeGasto(raw: Record<string, unknown>): Gasto {
  return {
    id: raw.id as string,
    proyectoId: (raw.proyectoId as string) || null,
    concepto: raw.concepto as string,
    monto: Number(raw.monto),
    moneda: (raw.moneda as 'PEN' | 'USD') || 'PEN',
    fecha: raw.fecha as string,
    categoria: (raw.categoria as string) || null,
    comprobante: (raw.comprobante as string) || null,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  }
}
