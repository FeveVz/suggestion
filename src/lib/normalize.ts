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
