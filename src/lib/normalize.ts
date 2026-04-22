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
