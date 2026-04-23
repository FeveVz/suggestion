'use client'

import { useState, useEffect } from 'react'
import { LOGO_NEGRO_BASE64 } from '@/lib/logo-negro'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  FileText,
  Search,
  LogOut,
  Package,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  Percent,
  Star,
  ListTodo,
  ClipboardList,
  UserCog,
  AlertCircle,
  Calendar,
  ArrowRight,
} from 'lucide-react'

// ===================== TYPES =====================
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
  serviceId: string
  selectedPlanId: string | null
  service: Service
  selectedPlan: Plan | null
}

interface Client {
  id: string
  name: string
  activity: string
  startDate: string
  location: string
  phone: string
  email: string
  status: string
  anticipoPagado: boolean
  descuento: number
  fechaAceptacion: string | null
  services: ClientService[]
}

interface Talent {
  id: string
  name: string
  email: string
  role: string
  phone: string
  active: boolean
  createdAt: string
  updatedAt: string
}

interface Task {
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
  talent?: Talent
  service?: Service
  client?: { id: string; name: string }
}

interface TaskTemplate {
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
  service?: Service
}

// ===================== CLIENT FORM =====================
function ClientForm({ client, services, onSave, onCancel }: {
  client?: Client | null
  services: Service[]
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(client?.name || '')
  const [activity, setActivity] = useState(client?.activity || '')
  const [startDate, setStartDate] = useState(client?.startDate || '')
  const [location, setLocation] = useState(client?.location || '')
  const [phone, setPhone] = useState(client?.phone || '')
  const [email, setEmail] = useState(client?.email || '')
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(client?.services.map(s => s.serviceId) || [])
  const [saving, setSaving] = useState(false)

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds(prev => prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({ name, activity, startDate, location, phone, email, serviceIds: selectedServiceIds })
    setSaving(false)
  }

  const principalServices = services.filter(s => s.category === 'principal')
  const complementarioServices = services.filter(s => s.category === 'complementario')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Nombre del cliente o empresa *</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
        <div className="space-y-2"><Label>Actividad o rubro *</Label><Input value={activity} onChange={e => setActivity(e.target.value)} required /></div>
        <div className="space-y-2"><Label>Fecha de inicio</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
        <div className="space-y-2"><Label>Ubicación</Label><Input value={location} onChange={e => setLocation(e.target.value)} /></div>
        <div className="space-y-2"><Label>Teléfono</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
        <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
      </div>
      <div className="space-y-2">
        <Label>Servicios requeridos</Label>
        <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-4">
          {principalServices.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Servicios Principales</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {principalServices.map(s => (
                  <label key={s.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={selectedServiceIds.includes(s.id)} onChange={() => toggleService(s.id)} className="rounded border-gray-300" style={{ accentColor: '#00C0FF' }} />
                    <span className="text-sm">{s.icon} {s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {complementarioServices.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Servicios Complementarios</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {complementarioServices.map(s => (
                  <label key={s.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={selectedServiceIds.includes(s.id)} onChange={() => toggleService(s.id)} className="rounded border-gray-300" style={{ accentColor: '#FF8D00' }} />
                    <span className="text-sm">{s.icon} {s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving} style={{ background: '#00C0FF' }} className="text-white">{saving ? 'Guardando...' : client ? 'Actualizar' : 'Crear Cliente'}</Button>
      </div>
    </form>
  )
}

// ===================== SERVICE FORM =====================
function ServiceForm({ service, onSave, onCancel }: {
  service?: Service | null
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(service?.name || '')
  const [slug, setSlug] = useState(service?.slug || '')
  const [description, setDescription] = useState(service?.description || '')
  const [icon, setIcon] = useState(service?.icon || '')
  const [category, setCategory] = useState(service?.category || 'principal')
  const [plans, setPlans] = useState<Array<{
    name: string; price: number; originalPrice: number | null; period: string; description: string; features: string[]; badge: string | null; isRecommended: boolean
  }>>(service?.plans.map(p => ({ name: p.name, price: p.price, originalPrice: p.originalPrice, period: p.period, description: p.description, features: typeof p.features === 'string' ? JSON.parse(p.features) : [], badge: p.badge, isRecommended: p.isRecommended })) || [
    { name: '', price: 0, originalPrice: null, period: '/mes', description: '', features: [], badge: null, isRecommended: false },
    { name: '', price: 0, originalPrice: null, period: '/mes', description: '', features: [], badge: 'Más Popular', isRecommended: true },
    { name: '', price: 0, originalPrice: null, period: '/mes', description: '', features: [], badge: null, isRecommended: false },
  ])
  const [saving, setSaving] = useState(false)

  const handleNameChange = (value: string) => { setName(value); setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) }
  const updatePlan = (index: number, field: string, value: unknown) => { setPlans(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p)) }
  const updatePlanFeatures = (index: number, featuresText: string) => { updatePlan(index, 'features', featuresText.split('\n').filter(f => f.trim())) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({ name, slug, description, icon, category, methodology: service?.methodology || null, plans: plans.map((p, i) => ({ ...p, features: JSON.stringify(p.features), order: i })) })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Nombre del servicio *</Label><Input value={name} onChange={e => handleNameChange(e.target.value)} required /></div>
        <div className="space-y-2"><Label>Slug *</Label><Input value={slug} onChange={e => setSlug(e.target.value)} required /></div>
        <div className="space-y-2"><Label>Icono (emoji)</Label><Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="📈" /></div>
        <div className="space-y-2"><Label>Categoría</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="principal">Principal</SelectItem><SelectItem value="complementario">Complementario</SelectItem></SelectContent></Select></div>
      </div>
      <div className="space-y-2"><Label>Descripción</Label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3} /></div>
      <Separator className="my-4" />
      <h3 className="font-semibold text-gray-900">Planes</h3>
      {plans.map((plan, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: plan.isRecommended ? '#FF8D00' : '#00C0FF' }}>Plan {i + 1} {plan.isRecommended ? '(Recomendado)' : ''}</span>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={plan.isRecommended} onChange={e => updatePlan(i, 'isRecommended', e.target.checked)} style={{ accentColor: '#FF8D00' }} />Recomendado</label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Nombre" value={plan.name} onChange={e => updatePlan(i, 'name', e.target.value)} />
            <Input placeholder="Periodo" value={plan.period} onChange={e => updatePlan(i, 'period', e.target.value)} />
            <Input type="number" placeholder="Precio" value={plan.price || ''} onChange={e => updatePlan(i, 'price', Number(e.target.value))} />
            <Input type="number" placeholder="Precio original" value={plan.originalPrice || ''} onChange={e => updatePlan(i, 'originalPrice', e.target.value ? Number(e.target.value) : null)} />
          </div>
          <Input placeholder="Descripción" value={plan.description} onChange={e => updatePlan(i, 'description', e.target.value)} />
          <Input placeholder="Badge" value={plan.badge || ''} onChange={e => updatePlan(i, 'badge', e.target.value || null)} />
          <div className="space-y-1"><Label className="text-xs">Features (una por línea)</Label><textarea value={plan.features.join('\n')} onChange={e => updatePlanFeatures(i, e.target.value)} className="w-full min-h-[60px] rounded-md border border-input bg-white px-3 py-2 text-xs" rows={3} /></div>
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving} style={{ background: '#00C0FF' }} className="text-white">{saving ? 'Guardando...' : service ? 'Actualizar' : 'Crear Servicio'}</Button>
      </div>
    </form>
  )
}

// ===================== TALENT ROLES =====================
// Roles predefinidos que coinciden con los usados en las plantillas de tareas (TaskTemplate)
// para garantizar la auto-asignación correcta de tareas cuando se acepta una proforma.
const TALENT_ROLES = [
  'Community Manager',
  'Diseñador Gráfico',
  'Desarrollador Web',
  'Diseñador UI/UX',
  'Productor Audiovisual',
  'Editor de Video',
  'Especialista SEO',
  'Media Planner',
  'Branding Strategist',
  'Consultor Digital',
  'Analista de Datos',
  'Email Marketing Specialist',
  'Copywriter',
  'Content Strategist',
  'Influencer Manager',
  'Fotógrafo',
]

// ===================== TALENT FORM =====================
function TalentForm({ talent, onSave, onCancel }: {
  talent?: Talent | null
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(talent?.name || '')
  const [email, setEmail] = useState(talent?.email || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(talent?.role || '')
  const [phone, setPhone] = useState(talent?.phone || '')
  const [active, setActive] = useState(talent?.active ?? true)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const data: Record<string, unknown> = { name, email, role, phone, active }
    if (password) data.password = password
    if (!talent && !password) { alert('La contraseña es requerida para nuevos talentos'); setSaving(false); return }
    await onSave(data)
    setSaving(false)
  }

  // Si el talento tiene un rol que no está en la lista predefinida, lo agregamos temporalmente
  const availableRoles = talent?.role && !TALENT_ROLES.includes(talent.role)
    ? [talent.role, ...TALENT_ROLES]
    : TALENT_ROLES

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Nombre completo *</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
        <div className="space-y-2"><Label>Email *</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
        <div className="space-y-2">
          <Label>Contraseña {talent ? '(dejar vacío para no cambiar)' : '*'}</Label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!talent} />
        </div>
        <div className="space-y-2">
          <Label>Especialidad / Rol *</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar especialidad" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Teléfono</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
        <div className="space-y-2 flex items-end">
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 w-full">
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="h-5 w-5 rounded border-gray-300" style={{ accentColor: '#8B5CF6' }} />
            <div>
              <span className="text-sm font-medium">{active ? 'Activo' : 'Inactivo'}</span>
              <p className="text-xs text-gray-500">Los talentos inactivos no pueden iniciar sesión</p>
            </div>
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving} style={{ background: '#8B5CF6' }} className="text-white">{saving ? 'Guardando...' : talent ? 'Actualizar' : 'Crear Talento'}</Button>
      </div>
    </form>
  )
}

// ===================== TASK TEMPLATE FORM =====================
function TaskTemplateForm({ template, services, onSave, onCancel }: {
  template?: TaskTemplate | null
  services: Service[]
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const [serviceId, setServiceId] = useState(template?.serviceId || '')
  const [title, setTitle] = useState(template?.title || '')
  const [description, setDescription] = useState(template?.description || '')
  const [priority, setPriority] = useState(template?.priority || 'media')
  const [deadlineDays, setDeadlineDays] = useState(template?.deadlineDays ?? 7)
  const [role, setRole] = useState(template?.role || '')
  const [order, setOrder] = useState(template?.order ?? 0)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({ serviceId, title, description, priority, deadlineDays, role, order })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Servicio *</Label>
          <Select value={serviceId} onValueChange={setServiceId}>
            <SelectTrigger><SelectValue placeholder="Seleccionar servicio" /></SelectTrigger>
            <SelectContent>
              {services.map(s => <SelectItem key={s.id} value={s.id}>{s.icon} {s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Título de la tarea *</Label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
        <div className="space-y-2"><Label>Prioridad</Label><Select value={priority} onValueChange={setPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="alta">Alta</SelectItem><SelectItem value="media">Media</SelectItem><SelectItem value="baja">Baja</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label>Días para deadline</Label><Input type="number" min={1} value={deadlineDays} onChange={e => setDeadlineDays(Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Rol/Especialidad requerida</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
            <SelectContent>
              {TALENT_ROLES.map(r => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Orden</Label><Input type="number" min={0} value={order} onChange={e => setOrder(Number(e.target.value))} /></div>
      </div>
      <div className="space-y-2"><Label>Descripción</Label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3} /></div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving} style={{ background: '#EC4899' }} className="text-white">{saving ? 'Guardando...' : template ? 'Actualizar' : 'Crear Plantilla'}</Button>
      </div>
    </form>
  )
}

// ===================== ACCEPT PROFORMA DIALOG =====================
function AcceptProformaDialog({ client, open, onOpenChange, onSave }: {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Record<string, unknown>) => void
}) {
  const [selectedPlans, setSelectedPlans] = useState<Record<string, string | null>>({})
  const [startDate, setStartDate] = useState(client.startDate || new Date().toISOString().split('T')[0])
  const [anticipoPagado, setAnticipoPagado] = useState(client.anticipoPagado || false)
  const [descuento, setDescuento] = useState(client.descuento || 0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      const existing: Record<string, string | null> = {}
      client.services.forEach(cs => { existing[cs.serviceId] = cs.selectedPlanId || null })
      setSelectedPlans(existing)
      setStartDate(client.startDate || new Date().toISOString().split('T')[0])
      setAnticipoPagado(client.anticipoPagado || false)
      setDescuento(client.descuento || 0)
    }
  }, [open, client])

  const selectPlan = (serviceId: string, planId: string) => { setSelectedPlans(prev => ({ ...prev, [serviceId]: prev[serviceId] === planId ? null : planId })) }
  const subtotal = client.services.reduce((sum, cs) => { const planId = selectedPlans[cs.serviceId]; if (!planId) return sum; const plan = cs.service.plans.find(p => p.id === planId); return sum + (plan?.price || 0) }, 0)
  const descuentoPct = subtotal > 0 ? (descuento / subtotal) * 100 : 0
  const total = Math.max(0, subtotal - descuento)
  const allPlansSelected = client.services.every(cs => selectedPlans[cs.serviceId])

  const handleSubmit = async () => {
    setSaving(true)
    const planSelections = client.services.map(cs => ({ serviceId: cs.serviceId, selectedPlanId: selectedPlans[cs.serviceId] || null }))
    await onSave({ status: 'aceptado', startDate, anticipoPagado, descuento, fechaAceptacion: new Date().toISOString().split('T')[0], planSelections })
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5" style={{ color: '#22c55e' }} />Aceptar Proforma — {client.name}</DialogTitle></DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="font-semibold">Fecha de inicio designada</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
            <div className="space-y-2"><Label className="font-semibold">Anticipo de confirmación</Label><label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"><input type="checkbox" checked={anticipoPagado} onChange={e => setAnticipoPagado(e.target.checked)} className="h-5 w-5 rounded border-gray-300" style={{ accentColor: '#22c55e' }} /><div><span className="text-sm font-medium">{anticipoPagado ? '✅ Anticipo abonado' : '⬜ Anticipo no abonado'}</span><p className="text-xs text-gray-500">Marca si el cliente ya abonó el anticipo</p></div></label></div>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Selecciona el plan elegido por cada servicio</h3>
            <div className="space-y-6">
              {client.services.map(cs => {
                const plans = cs.service.plans.sort((a, b) => a.order - b.order)
                return (
                  <div key={cs.serviceId} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cs.service.icon}</span>
                      <h4 className="font-semibold text-gray-900">{cs.service.name}</h4>
                      {selectedPlans[cs.serviceId] && <Badge className="text-xs" style={{ background: '#22c55e20', color: '#16a34a', borderColor: 'transparent' }}>Plan seleccionado</Badge>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {plans.map(plan => {
                        const isSelected = selectedPlans[cs.serviceId] === plan.id
                        const features: string[] = typeof plan.features === 'string' ? (() => { try { return JSON.parse(plan.features) } catch { return [] } })() : []
                        return (
                          <div key={plan.id} onClick={() => selectPlan(cs.serviceId, plan.id)} className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            {plan.badge && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: plan.isRecommended ? '#FF8D00' : '#00C0FF' }}>{plan.badge}</div>}
                            <div className="absolute top-2 right-2"><div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>{isSelected && <CheckCircle className="h-3 w-3 text-white" />}</div></div>
                            <div className="text-center mt-2">
                              <p className="font-bold text-gray-900 text-sm">{plan.name}</p>
                              <div className="mt-2">
                                {plan.originalPrice && plan.originalPrice > plan.price && <span className="text-xs text-gray-400 line-through mr-1">S/{plan.originalPrice.toLocaleString()}</span>}
                                <span className="text-2xl font-black" style={{ color: isSelected ? '#16a34a' : '#00C0FF' }}>S/{plan.price.toLocaleString()}</span>
                                <span className="text-xs text-gray-500 ml-1">{plan.period}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                            </div>
                            {features.length > 0 && <div className="mt-3 pt-3 border-t border-gray-100"><ul className="space-y-1">{features.slice(0, 4).map((f, i) => <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1"><span className="text-green-500 mt-0.5">✓</span><span className="line-clamp-1">{f}</span></li>)}{features.length > 4 && <li className="text-[11px] text-gray-400">+{features.length - 4} más</li>}</ul></div>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <Separator />
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Resumen</h3>
            <div className="space-y-2">{client.services.map(cs => { const planId = selectedPlans[cs.serviceId]; const plan = planId ? cs.service.plans.find(p => p.id === planId) : null; return <div key={cs.serviceId} className="flex items-center justify-between text-sm"><span className="text-gray-600">{cs.service.icon} {cs.service.name}{plan ? ` — ${plan.name}` : ' — Sin seleccionar'}</span><span className={`font-semibold ${plan ? 'text-gray-900' : 'text-gray-400'}`}>{plan ? `S/${plan.price.toLocaleString()}` : '—'}</span></div> })}</div>
            <Separator />
            <div className="flex items-center justify-between font-semibold"><span>Subtotal</span><span>S/{subtotal.toLocaleString()}</span></div>
            <div className="space-y-2"><Label className="font-semibold flex items-center gap-1"><DollarSign className="h-4 w-4" />Descuento (opcional — monto en soles)</Label><div className="flex items-center gap-3"><Input type="number" min="0" max={subtotal} value={descuento || ''} onChange={e => setDescuento(Math.max(0, Math.min(Number(e.target.value) || 0, subtotal)))} placeholder="0" className="max-w-[160px]" />{descuento > 0 && <div className="flex items-center gap-1 text-sm text-orange-600 font-medium"><Percent className="h-3.5 w-3.5" />{descuentoPct.toFixed(1)}% de descuento</div>}</div></div>
            <Separator />
            <div className="flex items-center justify-between text-lg font-black"><span>Total</span><span style={{ color: '#00C0FF' }}>S/{total.toLocaleString()}</span></div>
            <div className="flex items-center gap-2 text-sm">{anticipoPagado ? <span className="text-green-600 font-medium">✅ Anticipo de confirmación abonado</span> : <span className="text-gray-500">⬜ Anticipo de confirmación pendiente</span>}</div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving || !allPlansSelected} className="text-white" style={{ background: allPlansSelected ? '#22c55e' : '#9ca3af' }}>{saving ? 'Guardando...' : 'Confirmar Aceptación'}</Button>
          </div>
          {!allPlansSelected && <p className="text-xs text-center text-gray-500">Debes seleccionar un plan para cada servicio antes de confirmar.</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ===================== CLIENT CARD =====================
function ClientCard({ client, onEdit, onDelete, onDownloadProforma, onAcceptProforma }: {
  client: Client; onEdit: () => void; onDelete: () => void; onDownloadProforma: () => void; onAcceptProforma: () => void
}) {
  const isAccepted = client.status === 'aceptado'
  const isPending = client.status === 'pendiente'
  const subtotal = client.services.reduce((sum, cs) => sum + (cs.selectedPlan?.price || 0), 0)
  const total = Math.max(0, subtotal - client.descuento)
  const descuentoPct = subtotal > 0 ? (client.descuento / subtotal) * 100 : 0

  return (
    <Card className={`hover:shadow-md transition-shadow ${isAccepted ? 'border-green-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold text-gray-900 truncate">{client.name}</CardTitle>
              {isPending && <Badge className="text-[10px] px-1.5 py-0" style={{ background: '#f59e0b20', color: '#d97706', borderColor: 'transparent' }}><Clock className="h-3 w-3 inline mr-0.5" />Pendiente</Badge>}
              {isAccepted && <Badge className="text-[10px] px-1.5 py-0" style={{ background: '#22c55e20', color: '#16a34a', borderColor: 'transparent' }}><CheckCircle className="h-3 w-3 inline mr-0.5" />Aceptado</Badge>}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{client.activity}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {client.services.length > 0 && <div className="flex flex-wrap gap-1.5">{client.services.map(cs => <Badge key={cs.serviceId} variant="secondary" className="text-xs" style={{ background: cs.service.category === 'principal' ? '#00C0FF15' : '#FF8D0015', color: cs.service.category === 'principal' ? '#00C0FF' : '#FF8D00', borderColor: 'transparent' }}>{cs.service.icon} {cs.service.name}</Badge>)}</div>}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {client.startDate && <span>📅 {client.startDate}</span>}
            {client.location && <span>📍 {client.location}</span>}
          </div>
          {isAccepted && (
            <div className="bg-green-50 rounded-lg p-3 space-y-1.5 text-xs border border-green-100">
              {client.services.map(cs => <div key={cs.serviceId} className="flex items-center justify-between"><span className="text-gray-600">{cs.service.icon} {cs.selectedPlan?.name || '—'}</span><span className="font-semibold text-gray-900">{cs.selectedPlan ? `S/${cs.selectedPlan.price.toLocaleString()}` : '—'}</span></div>)}
              {client.descuento > 0 && <div className="flex items-center justify-between text-orange-600"><span>Descuento ({descuentoPct.toFixed(1)}%)</span><span>-S/{client.descuento.toLocaleString()}</span></div>}
              <Separator />
              <div className="flex items-center justify-between font-bold text-sm"><span>Total</span><span style={{ color: '#00C0FF' }}>S/{total.toLocaleString()}</span></div>
              <div className="flex items-center gap-2 mt-1">{client.anticipoPagado ? <span className="text-green-600">✅ Anticipo abonado</span> : <span className="text-gray-500">⬜ Anticipo pendiente</span>}</div>
            </div>
          )}
          <div className="flex items-center gap-2 pt-2">
            {isPending && <Button onClick={onAcceptProforma} size="sm" className="flex-1 text-white text-xs h-9" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}><CheckCircle className="h-3.5 w-3.5 mr-1" />Aceptar Proforma</Button>}
            {isAccepted && <Button onClick={onAcceptProforma} size="sm" variant="outline" className="flex-1 text-xs h-9 border-green-300 text-green-700 hover:bg-green-50"><Pencil className="h-3.5 w-3.5 mr-1" />Editar Selección</Button>}
            <Button onClick={onDownloadProforma} size="sm" className="text-white text-xs h-9" style={{ background: 'linear-gradient(135deg, #00C0FF, #0098cc)' }}><Download className="h-3.5 w-3.5 mr-1" />Proforma</Button>
            <Button onClick={() => window.open(`/api/proforma/${client.id}/pdf`, '_blank')} size="sm" variant="outline" className="text-xs h-9" title="Ver PDF"><FileText className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ===================== STATUS BADGE HELPER =====================
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    pendiente: { bg: '#f59e0b20', color: '#d97706', icon: <Clock className="h-3 w-3 inline mr-0.5" /> },
    en_progreso: { bg: '#3b82f620', color: '#2563eb', icon: <ArrowRight className="h-3 w-3 inline mr-0.5" /> },
    completada: { bg: '#22c55e20', color: '#16a34a', icon: <CheckCircle className="h-3 w-3 inline mr-0.5" /> },
  }
  const c = config[status] || config.pendiente
  return <Badge className="text-[10px] px-1.5 py-0" style={{ background: c.bg, color: c.color, borderColor: 'transparent' }}>{c.icon}{status.replace('_', ' ')}</Badge>
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { bg: string; color: string }> = {
    alta: { bg: '#ef444420', color: '#dc2626' },
    media: { bg: '#f59e0b20', color: '#d97706' },
    baja: { bg: '#22c55e20', color: '#16a34a' },
  }
  const c = config[priority] || config.media
  return <Badge className="text-[10px] px-1.5 py-0" style={{ background: c.bg, color: c.color, borderColor: 'transparent' }}>{priority}</Badge>
}

// ===================== MAIN DASHBOARD =====================
export function Dashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [talents, setTalents] = useState<Talent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('clientes')
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog states
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [talentDialogOpen, setTalentDialogOpen] = useState(false)
  const [editingTalent, setEditingTalent] = useState<Talent | null>(null)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null)
  const [deleteClientOpen, setDeleteClientOpen] = useState(false)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [deleteServiceOpen, setDeleteServiceOpen] = useState(false)
  const [deletingService, setDeletingService] = useState<Service | null>(null)
  const [deleteTalentOpen, setDeleteTalentOpen] = useState(false)
  const [deletingTalent, setDeletingTalent] = useState<Talent | null>(null)
  const [deleteTemplateOpen, setDeleteTemplateOpen] = useState(false)
  const [deletingTemplate, setDeletingTemplate] = useState<TaskTemplate | null>(null)
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [acceptingClient, setAcceptingClient] = useState<Client | null>(null)

  // Task filters
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all')
  const [taskTalentFilter, setTaskTalentFilter] = useState<string>('all')
  const [taskServiceFilter, setTaskServiceFilter] = useState<string>('all')

  const fetchData = async () => {
    try {
      const [clientsRes, servicesRes, talentsRes, tasksRes, templatesRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/services'),
        fetch('/api/talents').catch(() => new Response('[]', { status: 200 })),
        fetch('/api/tasks').catch(() => new Response('[]', { status: 200 })),
        fetch('/api/task-templates').catch(() => new Response('[]', { status: 200 })),
      ])
      const clientsData = await clientsRes.json()
      const servicesData = await servicesRes.json()
      const talentsData = await talentsRes.json()
      const tasksData = await tasksRes.json()
      const templatesData = await templatesRes.json()
      setClients(Array.isArray(clientsData) ? clientsData : [])
      setServices(Array.isArray(servicesData) ? servicesData : [])
      setTalents(Array.isArray(talentsData) ? talentsData : [])
      setTasks(Array.isArray(tasksData) ? tasksData : [])
      setTaskTemplates(Array.isArray(templatesData) ? templatesData : [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // ============ HANDLERS ============
  const handleSaveClient = async (data: Record<string, unknown>) => {
    try {
      const res = editingClient ? await fetch(`/api/clients/${editingClient.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }) : await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const errData = await res.json().catch(() => ({})); alert(`Error: ${errData.error || 'Error desconocido'}`); return }
      setClientDialogOpen(false); setEditingClient(null); await fetchData()
    } catch (error) { console.error('Error saving client:', error); alert('Error de conexión') }
  }

  const handleDeleteClient = async () => {
    if (!deletingClient) return
    try { await fetch(`/api/clients/${deletingClient.id}`, { method: 'DELETE' }); setDeleteClientOpen(false); setDeletingClient(null); await fetchData() } catch (error) { console.error('Error deleting client:', error) }
  }

  const handleSaveService = async (data: Record<string, unknown>) => {
    try {
      const res = editingService ? await fetch(`/api/services/${editingService.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }) : await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const errData = await res.json().catch(() => ({})); alert(`Error: ${errData.error || 'Error desconocido'}`); return }
      setServiceDialogOpen(false); setEditingService(null); await fetchData()
    } catch (error) { console.error('Error saving service:', error); alert('Error de conexión') }
  }

  const handleDeleteService = async () => {
    if (!deletingService) return
    try { await fetch(`/api/services/${deletingService.id}`, { method: 'DELETE' }); setDeleteServiceOpen(false); setDeletingService(null); await fetchData() } catch (error) { console.error('Error deleting service:', error) }
  }

  const handleSaveTalent = async (data: Record<string, unknown>) => {
    try {
      const res = editingTalent ? await fetch(`/api/talents/${editingTalent.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }) : await fetch('/api/talents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const errData = await res.json().catch(() => ({})); alert(`Error: ${errData.error || 'Error desconocido'}`); return }
      setTalentDialogOpen(false); setEditingTalent(null); await fetchData()
    } catch (error) { console.error('Error saving talent:', error); alert('Error de conexión') }
  }

  const handleDeleteTalent = async () => {
    if (!deletingTalent) return
    try { await fetch(`/api/talents/${deletingTalent.id}`, { method: 'DELETE' }); setDeleteTalentOpen(false); setDeletingTalent(null); await fetchData() } catch (error) { console.error('Error deleting talent:', error) }
  }

  const handleSaveTemplate = async (data: Record<string, unknown>) => {
    try {
      const res = editingTemplate ? await fetch(`/api/task-templates/${editingTemplate.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }) : await fetch('/api/task-templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const errData = await res.json().catch(() => ({})); alert(`Error: ${errData.error || 'Error desconocido'}`); return }
      setTemplateDialogOpen(false); setEditingTemplate(null); await fetchData()
    } catch (error) { console.error('Error saving template:', error); alert('Error de conexión') }
  }

  const handleDeleteTemplate = async () => {
    if (!deletingTemplate) return
    try { await fetch(`/api/task-templates/${deletingTemplate.id}`, { method: 'DELETE' }); setDeleteTemplateOpen(false); setDeletingTemplate(null); await fetchData() } catch (error) { console.error('Error deleting template:', error) }
  }

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
      await fetchData()
    } catch (error) { console.error('Error updating task:', error) }
  }

  const handleTaskTalentAssign = async (taskId: string, talentId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ talentId: talentId || null }) })
      await fetchData()
    } catch (error) { console.error('Error assigning talent:', error) }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return
    try { await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' }); await fetchData() } catch (error) { console.error('Error deleting task:', error) }
  }

  const handleDownloadProforma = (client: Client) => { window.open(`/api/proforma/${client.id}?download=true`, '_blank') }

  const handleAcceptProforma = async (data: Record<string, unknown>) => {
    if (!acceptingClient) return
    try {
      const res = await fetch(`/api/clients/${acceptingClient.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const errData = await res.json().catch(() => ({})); alert(`Error: ${errData.error || 'Error desconocido'}`); return }
      setAcceptDialogOpen(false); setAcceptingClient(null); await fetchData()
    } catch (error) { console.error('Error accepting proforma:', error); alert('Error de conexión') }
  }

  const handleLogout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.reload() }

  // ============ FILTERS ============
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.activity.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredServices = services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredTasks = tasks.filter(t => {
    if (taskStatusFilter !== 'all' && t.status !== taskStatusFilter) return false
    if (taskTalentFilter !== 'all' && t.talentId !== taskTalentFilter) return false
    if (taskServiceFilter !== 'all' && t.serviceId !== taskServiceFilter) return false
    return true
  })

  // ============ TAB CONFIG ============
  const tabs = [
    { key: 'clientes', label: 'Clientes', icon: Users, color: '#00C0FF' },
    { key: 'servicios', label: 'Servicios', icon: Package, color: '#FF8D00' },
    { key: 'talentos', label: 'Talentos', icon: UserCog, color: '#8B5CF6' },
    { key: 'tareas', label: 'Tareas', icon: ListTodo, color: '#22c55e' },
    { key: 'plantillas', label: 'Plantillas', icon: ClipboardList, color: '#EC4899' },
  ]

  // ============ TASK STATS ============
  const taskStats = {
    total: tasks.length,
    pendiente: tasks.filter(t => t.status === 'pendiente').length,
    en_progreso: tasks.filter(t => t.status === 'en_progreso').length,
    completada: tasks.filter(t => t.status === 'completada').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#00C0FF' }}></div>
          <p className="mt-4 text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <img src={LOGO_NEGRO_BASE64} alt="SUGGESTION" className="h-8 w-auto" />
              <nav className="hidden lg:flex items-center gap-1">
                {tabs.map(tab => (
                  <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSearchQuery('') }} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`} style={activeTab === tab.key ? { background: tab.color } : {}}>
                    <tab.icon className="h-4 w-4 inline mr-1.5" />{tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-gray-500">Administrador</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-600"><LogOut className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="lg:hidden flex items-center gap-1 pb-2 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSearchQuery('') }} className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === tab.key ? 'text-white' : 'text-gray-600 bg-gray-100'}`} style={activeTab === tab.key ? { background: tab.color } : {}}>
                <tab.icon className="h-3 w-3 inline mr-1" />{tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder={`Buscar en ${tabs.find(t => t.key === activeTab)?.label.toLowerCase() || ''}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>

          {/* Clientes actions */}
          {activeTab === 'clientes' && (
            <Dialog open={clientDialogOpen} onOpenChange={(open) => { setClientDialogOpen(open); if (!open) setEditingClient(null) }}>
              <DialogTrigger asChild><Button className="text-white" style={{ background: '#00C0FF' }}><Plus className="h-4 w-4 mr-1.5" />Crear nuevo cliente</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle></DialogHeader><ClientForm client={editingClient} services={services} onSave={handleSaveClient} onCancel={() => { setClientDialogOpen(false); setEditingClient(null) }} /></DialogContent>
            </Dialog>
          )}

          {/* Servicios actions */}
          {activeTab === 'servicios' && (
            <Dialog open={serviceDialogOpen} onOpenChange={(open) => { setServiceDialogOpen(open); if (!open) setEditingService(null) }}>
              <DialogTrigger asChild><Button className="text-white" style={{ background: '#FF8D00' }}><Plus className="h-4 w-4 mr-1.5" />Crear nuevo servicio</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle></DialogHeader><ServiceForm service={editingService} onSave={handleSaveService} onCancel={() => { setServiceDialogOpen(false); setEditingService(null) }} /></DialogContent>
            </Dialog>
          )}

          {/* Talentos actions */}
          {activeTab === 'talentos' && (
            <Dialog open={talentDialogOpen} onOpenChange={(open) => { setTalentDialogOpen(open); if (!open) setEditingTalent(null) }}>
              <DialogTrigger asChild><Button className="text-white" style={{ background: '#8B5CF6' }}><Plus className="h-4 w-4 mr-1.5" />Crear nuevo talento</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingTalent ? 'Editar Talento' : 'Nuevo Talento'}</DialogTitle></DialogHeader><TalentForm talent={editingTalent} onSave={handleSaveTalent} onCancel={() => { setTalentDialogOpen(false); setEditingTalent(null) }} /></DialogContent>
            </Dialog>
          )}

          {/* Plantillas actions */}
          {activeTab === 'plantillas' && (
            <Dialog open={templateDialogOpen} onOpenChange={(open) => { setTemplateDialogOpen(open); if (!open) setEditingTemplate(null) }}>
              <DialogTrigger asChild><Button className="text-white" style={{ background: '#EC4899' }}><Plus className="h-4 w-4 mr-1.5" />Crear plantilla</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla de Tarea'}</DialogTitle></DialogHeader><TaskTemplateForm template={editingTemplate} services={services} onSave={handleSaveTemplate} onCancel={() => { setTemplateDialogOpen(false); setEditingTemplate(null) }} /></DialogContent>
            </Dialog>
          )}
        </div>

        {/* ====== CLIENTES TAB ====== */}
        {activeTab === 'clientes' && (
          <div>
            {filteredClients.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border"><Users className="h-12 w-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900">No hay clientes</h3><p className="text-sm text-gray-500 mt-1">Crea tu primer cliente para empezar.</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map(client => <ClientCard key={client.id} client={client} onEdit={() => { setEditingClient(client); setClientDialogOpen(true) }} onDelete={() => { setDeletingClient(client); setDeleteClientOpen(true) }} onDownloadProforma={() => handleDownloadProforma(client)} onAcceptProforma={() => { setAcceptingClient(client); setAcceptDialogOpen(true) }} />)}
              </div>
            )}
          </div>
        )}

        {/* ====== SERVICIOS TAB ====== */}
        {activeTab === 'servicios' && (
          <div>
            {filteredServices.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border"><Package className="h-12 w-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900">No hay servicios</h3><p className="text-sm text-gray-500 mt-1">Crea tu primer servicio.</p></div>
            ) : (
              <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader><TableRow><TableHead className="w-10"></TableHead><TableHead>Nombre</TableHead><TableHead className="hidden md:table-cell">Categoría</TableHead><TableHead className="hidden md:table-cell">Planes</TableHead><TableHead className="hidden lg:table-cell">Precio desde</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredServices.map(service => {
                      const minPrice = service.plans.length > 0 ? Math.min(...service.plans.map(p => p.price)) : 0
                      return (
                        <TableRow key={service.id}>
                          <TableCell className="text-xl">{service.icon}</TableCell>
                          <TableCell><div><div className="font-semibold text-gray-900">{service.name}</div><div className="text-xs text-gray-500 max-w-xs truncate">{service.description}</div></div></TableCell>
                          <TableCell className="hidden md:table-cell"><Badge variant="secondary" style={{ background: service.category === 'principal' ? '#00C0FF15' : '#FF8D0015', color: service.category === 'principal' ? '#00C0FF' : '#FF8D00', borderColor: 'transparent' }}>{service.category}</Badge></TableCell>
                          <TableCell className="hidden md:table-cell"><span className="text-sm text-gray-600">{service.plans.length} planes</span></TableCell>
                          <TableCell className="hidden lg:table-cell"><span className="text-sm font-semibold text-gray-900">S/{minPrice.toLocaleString()}</span></TableCell>
                          <TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => { setEditingService(service); setServiceDialogOpen(true) }}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem><DropdownMenuItem onClick={() => { setDeletingService(service); setDeleteServiceOpen(true) }} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* ====== TALENTOS TAB ====== */}
        {activeTab === 'talentos' && (
          <div>
            {talents.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border"><UserCog className="h-12 w-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900">No hay talentos</h3><p className="text-sm text-gray-500 mt-1">Crea talentos para asignar tareas automáticamente.</p></div>
            ) : (
              <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Email</TableHead><TableHead className="hidden md:table-cell">Especialidad</TableHead><TableHead className="hidden md:table-cell">Teléfono</TableHead><TableHead className="hidden sm:table-cell">Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {talents.map(talent => (
                      <TableRow key={talent.id}>
                        <TableCell><div className="font-semibold text-gray-900">{talent.name}</div><div className="text-xs text-gray-500">{talent.id}</div></TableCell>
                        <TableCell className="text-sm text-gray-600">{talent.email}</TableCell>
                        <TableCell className="hidden md:table-cell"><Badge variant="secondary" style={{ background: '#8B5CF620', color: '#8B5CF6', borderColor: 'transparent' }}>{talent.role || '—'}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-gray-600">{talent.phone || '—'}</TableCell>
                        <TableCell className="hidden sm:table-cell">{talent.active ? <Badge style={{ background: '#22c55e20', color: '#16a34a', borderColor: 'transparent' }}>Activo</Badge> : <Badge style={{ background: '#ef444420', color: '#dc2626', borderColor: 'transparent' }}>Inactivo</Badge>}</TableCell>
                        <TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => { setEditingTalent(talent); setTalentDialogOpen(true) }}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem><DropdownMenuItem onClick={() => { setDeletingTalent(talent); setDeleteTalentOpen(true) }} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* ====== TAREAS TAB ====== */}
        {activeTab === 'tareas' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTaskStatusFilter('all')}>
                <CardContent className="p-4 text-center"><p className="text-2xl font-black" style={{ color: '#00C0FF' }}>{taskStats.total}</p><p className="text-xs text-gray-500">Total</p></CardContent>
              </Card>
              <Card className={`cursor-pointer hover:shadow-md transition-shadow ${taskStatusFilter === 'pendiente' ? 'ring-2 ring-yellow-400' : ''}`} onClick={() => setTaskStatusFilter(taskStatusFilter === 'pendiente' ? 'all' : 'pendiente')}>
                <CardContent className="p-4 text-center"><p className="text-2xl font-black text-yellow-600">{taskStats.pendiente}</p><p className="text-xs text-gray-500">Pendientes</p></CardContent>
              </Card>
              <Card className={`cursor-pointer hover:shadow-md transition-shadow ${taskStatusFilter === 'en_progreso' ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setTaskStatusFilter(taskStatusFilter === 'en_progreso' ? 'all' : 'en_progreso')}>
                <CardContent className="p-4 text-center"><p className="text-2xl font-black text-blue-600">{taskStats.en_progreso}</p><p className="text-xs text-gray-500">En Progreso</p></CardContent>
              </Card>
              <Card className={`cursor-pointer hover:shadow-md transition-shadow ${taskStatusFilter === 'completada' ? 'ring-2 ring-green-400' : ''}`} onClick={() => setTaskStatusFilter(taskStatusFilter === 'completada' ? 'all' : 'completada')}>
                <CardContent className="p-4 text-center"><p className="text-2xl font-black text-green-600">{taskStats.completada}</p><p className="text-xs text-gray-500">Completadas</p></CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={taskTalentFilter} onValueChange={setTaskTalentFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrar por talento" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los talentos</SelectItem>
                  <SelectItem value="unassigned">Sin asignar</SelectItem>
                  {talents.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={taskServiceFilter} onValueChange={setTaskServiceFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrar por servicio" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los servicios</SelectItem>
                  {services.map(s => <SelectItem key={s.id} value={s.id}>{s.icon} {s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Tasks table */}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border"><ListTodo className="h-12 w-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900">No hay tareas</h3><p className="text-sm text-gray-500 mt-1">Las tareas se crean automáticamente al aceptar una proforma.</p></div>
            ) : (
              <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Cliente</TableHead><TableHead className="hidden md:table-cell">Servicio</TableHead><TableHead className="hidden md:table-cell">Talento</TableHead><TableHead>Estado</TableHead><TableHead className="hidden sm:table-cell">Prioridad</TableHead><TableHead className="hidden lg:table-cell">Deadline</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredTasks.map(task => {
                      const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completada'
                      return (
                        <TableRow key={task.id} className={isOverdue ? 'bg-red-50' : ''}>
                          <TableCell><div><div className="font-semibold text-gray-900 text-sm">{task.title}</div>{task.description && <div className="text-xs text-gray-500 max-w-[200px] truncate">{task.description}</div>}</div></TableCell>
                          <TableCell className="text-sm text-gray-600">{task.client?.name || '—'}</TableCell>
                          <TableCell className="hidden md:table-cell"><span className="text-sm">{task.service?.icon} {task.service?.name || '—'}</span></TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Select value={task.talentId || 'unassigned'} onValueChange={(val) => handleTaskTalentAssign(task.id, val === 'unassigned' ? '' : val)}>
                              <SelectTrigger className="h-7 text-xs w-[140px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Sin asignar</SelectItem>
                                {talents.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={task.status} onValueChange={(val) => handleTaskStatusChange(task.id, val)}>
                              <SelectTrigger className="h-7 text-xs w-[120px]"><StatusBadge status={task.status} /></SelectTrigger>
                              <SelectContent><SelectItem value="pendiente">Pendiente</SelectItem><SelectItem value="en_progreso">En progreso</SelectItem><SelectItem value="completada">Completada</SelectItem></SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell"><PriorityBadge priority={task.priority} /></TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className={`text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                              {task.deadline ? <><Calendar className="h-3 w-3 inline mr-1" />{task.deadline}</> : '—'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* ====== PLANTILLAS TAB ====== */}
        {activeTab === 'plantillas' && (
          <div>
            {taskTemplates.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border"><ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900">No hay plantillas</h3><p className="text-sm text-gray-500 mt-1">Las plantillas definen qué tareas se crean automáticamente al aceptar una proforma.</p></div>
            ) : (
              <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader><TableRow><TableHead className="w-12">Orden</TableHead><TableHead>Servicio</TableHead><TableHead>Título</TableHead><TableHead className="hidden md:table-cell">Descripción</TableHead><TableHead className="hidden md:table-cell">Prioridad</TableHead><TableHead className="hidden md:table-cell">Días</TableHead><TableHead className="hidden lg:table-cell">Rol requerido</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {taskTemplates.map(template => (
                      <TableRow key={template.id}>
                        <TableCell className="text-center text-sm text-gray-500">{template.order}</TableCell>
                        <TableCell><Badge variant="secondary" style={{ background: '#EC489920', color: '#EC4899', borderColor: 'transparent' }}>{template.service?.icon} {template.service?.name || template.serviceId}</Badge></TableCell>
                        <TableCell className="font-semibold text-gray-900 text-sm">{template.title}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-gray-500 max-w-[200px] truncate">{template.description || '—'}</TableCell>
                        <TableCell className="hidden md:table-cell"><PriorityBadge priority={template.priority} /></TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-gray-600">{template.deadlineDays}d</TableCell>
                        <TableCell className="hidden lg:table-cell"><Badge variant="secondary" style={{ background: '#8B5CF620', color: '#8B5CF6', borderColor: 'transparent' }}>{template.role || '—'}</Badge></TableCell>
                        <TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => { setEditingTemplate(template); setTemplateDialogOpen(true) }}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem><DropdownMenuItem onClick={() => { setDeletingTemplate(template); setDeleteTemplateOpen(true) }} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Accept Proforma Dialog */}
      {acceptingClient && <AcceptProformaDialog client={acceptingClient} open={acceptDialogOpen} onOpenChange={(open) => { setAcceptDialogOpen(open); if (!open) setAcceptingClient(null) }} onSave={handleAcceptProforma} />}

      {/* Delete Client Alert */}
      <AlertDialog open={deleteClientOpen} onOpenChange={setDeleteClientOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle><AlertDialogDescription>¿Estás seguro de eliminar a <strong>{deletingClient?.name}</strong>? Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteClient} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      {/* Delete Service Alert */}
      <AlertDialog open={deleteServiceOpen} onOpenChange={setDeleteServiceOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle><AlertDialogDescription>¿Estás seguro de eliminar el servicio <strong>{deletingService?.name}</strong>? Se eliminará de todos los clientes.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteService} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      {/* Delete Talent Alert */}
      <AlertDialog open={deleteTalentOpen} onOpenChange={setDeleteTalentOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar talento?</AlertDialogTitle><AlertDialogDescription>¿Estás seguro de eliminar a <strong>{deletingTalent?.name}</strong>? Sus tareas asignadas quedarán sin talento asignado.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteTalent} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      {/* Delete Template Alert */}
      <AlertDialog open={deleteTemplateOpen} onOpenChange={setDeleteTemplateOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle><AlertDialogDescription>¿Estás seguro de eliminar la plantilla <strong>{deletingTemplate?.title}</strong>? Las tareas ya creadas no se verán afectadas.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteTemplate} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
