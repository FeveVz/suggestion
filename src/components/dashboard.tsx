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
} from 'lucide-react'

// Types
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

// Client Form Component
function ClientForm({
  client,
  services,
  onSave,
  onCancel,
}: {
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
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    client?.services.map(s => s.serviceId) || []
  )
  const [saving, setSaving] = useState(false)

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({
      name,
      activity,
      startDate,
      location,
      phone,
      email,
      serviceIds: selectedServiceIds,
    })
    setSaving(false)
  }

  const principalServices = services.filter(s => s.category === 'principal')
  const complementarioServices = services.filter(s => s.category === 'complementario')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nombre del cliente o empresa *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Actividad o rubro *</Label>
          <Input value={activity} onChange={e => setActivity(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Fecha de inicio</Label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Ubicación</Label>
          <Input value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Teléfono</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
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
                    <input
                      type="checkbox"
                      checked={selectedServiceIds.includes(s.id)}
                      onChange={() => toggleService(s.id)}
                      className="rounded border-gray-300"
                      style={{ accentColor: '#00C0FF' }}
                    />
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
                    <input
                      type="checkbox"
                      checked={selectedServiceIds.includes(s.id)}
                      onChange={() => toggleService(s.id)}
                      className="rounded border-gray-300"
                      style={{ accentColor: '#FF8D00' }}
                    />
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
        <Button type="submit" disabled={saving} style={{ background: '#00C0FF' }} className="text-white">
          {saving ? 'Guardando...' : client ? 'Actualizar' : 'Crear Cliente'}
        </Button>
      </div>
    </form>
  )
}

// Service Form Component
function ServiceForm({
  service,
  onSave,
  onCancel,
}: {
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
    name: string
    price: number
    originalPrice: number | null
    period: string
    description: string
    features: string[]
    badge: string | null
    isRecommended: boolean
  }>>(
    service?.plans.map(p => ({
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      period: p.period,
      description: p.description,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : [],
      badge: p.badge,
      isRecommended: p.isRecommended,
    })) || [
      { name: '', price: 0, originalPrice: null, period: '/mes', description: '', features: [], badge: null, isRecommended: false },
      { name: '', price: 0, originalPrice: null, period: '/mes', description: '', features: [], badge: 'Más Popular', isRecommended: true },
      { name: '', price: 0, originalPrice: null, period: '/mes', description: '', features: [], badge: null, isRecommended: false },
    ]
  )
  const [saving, setSaving] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  const updatePlan = (index: number, field: string, value: unknown) => {
    setPlans(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  const updatePlanFeatures = (index: number, featuresText: string) => {
    const features = featuresText.split('\n').filter(f => f.trim())
    updatePlan(index, 'features', features)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({
      name,
      slug,
      description,
      icon,
      category,
      methodology: service?.methodology || null,
      plans: plans.map((p, i) => ({
        ...p,
        features: JSON.stringify(p.features),
        order: i,
      })),
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nombre del servicio *</Label>
          <Input value={name} onChange={e => handleNameChange(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Slug *</Label>
          <Input value={slug} onChange={e => setSlug(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Icono (emoji)</Label>
          <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="📈" />
        </div>
        <div className="space-y-2">
          <Label>Categoría</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="principal">Principal</SelectItem>
              <SelectItem value="complementario">Complementario</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Descripción</Label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={3}
        />
      </div>

      <Separator className="my-4" />
      <h3 className="font-semibold text-gray-900">Planes</h3>

      {plans.map((plan, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: plan.isRecommended ? '#FF8D00' : '#00C0FF' }}>
              Plan {i + 1} {plan.isRecommended ? '(Recomendado)' : ''}
            </span>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={plan.isRecommended}
                onChange={e => updatePlan(i, 'isRecommended', e.target.checked)}
                style={{ accentColor: '#FF8D00' }}
              />
              Recomendado
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Nombre" value={plan.name} onChange={e => updatePlan(i, 'name', e.target.value)} />
            <Input placeholder="Periodo" value={plan.period} onChange={e => updatePlan(i, 'period', e.target.value)} />
            <Input type="number" placeholder="Precio" value={plan.price || ''} onChange={e => updatePlan(i, 'price', Number(e.target.value))} />
            <Input type="number" placeholder="Precio original" value={plan.originalPrice || ''} onChange={e => updatePlan(i, 'originalPrice', e.target.value ? Number(e.target.value) : null)} />
          </div>
          <Input placeholder="Descripción" value={plan.description} onChange={e => updatePlan(i, 'description', e.target.value)} />
          <Input placeholder="Badge" value={plan.badge || ''} onChange={e => updatePlan(i, 'badge', e.target.value || null)} />
          <div className="space-y-1">
            <Label className="text-xs">Features (una por línea)</Label>
            <textarea
              value={plan.features.join('\n')}
              onChange={e => updatePlanFeatures(i, e.target.value)}
              className="w-full min-h-[60px] rounded-md border border-input bg-white px-3 py-2 text-xs"
              rows={3}
            />
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving} style={{ background: '#00C0FF' }} className="text-white">
          {saving ? 'Guardando...' : service ? 'Actualizar' : 'Crear Servicio'}
        </Button>
      </div>
    </form>
  )
}

// Accept Proforma Dialog Component
function AcceptProformaDialog({
  client,
  open,
  onOpenChange,
  onSave,
}: {
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

  // Initialize selected plans from existing data
  useEffect(() => {
    if (open) {
      const existing: Record<string, string | null> = {}
      client.services.forEach(cs => {
        existing[cs.serviceId] = cs.selectedPlanId || null
      })
      setSelectedPlans(existing)
      setStartDate(client.startDate || new Date().toISOString().split('T')[0])
      setAnticipoPagado(client.anticipoPagado || false)
      setDescuento(client.descuento || 0)
    }
  }, [open, client])

  const selectPlan = (serviceId: string, planId: string) => {
    setSelectedPlans(prev => ({
      ...prev,
      [serviceId]: prev[serviceId] === planId ? null : planId
    }))
  }

  // Calculate totals
  const subtotal = client.services.reduce((sum, cs) => {
    const planId = selectedPlans[cs.serviceId]
    if (!planId) return sum
    const plan = cs.service.plans.find(p => p.id === planId)
    return sum + (plan?.price || 0)
  }, 0)

  const descuentoPct = subtotal > 0 ? (descuento / subtotal) * 100 : 0
  const total = Math.max(0, subtotal - descuento)

  const allPlansSelected = client.services.every(cs => selectedPlans[cs.serviceId])

  const handleSubmit = async () => {
    setSaving(true)
    const planSelections = client.services.map(cs => ({
      serviceId: cs.serviceId,
      selectedPlanId: selectedPlans[cs.serviceId] || null,
    }))
    await onSave({
      status: 'aceptado',
      startDate,
      anticipoPagado,
      descuento,
      fechaAceptacion: new Date().toISOString().split('T')[0],
      planSelections,
    })
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" style={{ color: '#22c55e' }} />
            Aceptar Proforma — {client.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Fecha de inicio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Fecha de inicio designada</Label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Anticipo de confirmación</Label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={anticipoPagado}
                  onChange={e => setAnticipoPagado(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300"
                  style={{ accentColor: '#22c55e' }}
                />
                <div>
                  <span className="text-sm font-medium">{anticipoPagado ? '✅ Anticipo abonado' : '⬜ Anticipo no abonado'}</span>
                  <p className="text-xs text-gray-500">Marca si el cliente ya abonó el anticipo de confirmación</p>
                </div>
              </label>
            </div>
          </div>

          <Separator />

          {/* Plan selection per service */}
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
                      {selectedPlans[cs.serviceId] && (
                        <Badge className="text-xs" style={{ background: '#22c55e20', color: '#16a34a', borderColor: 'transparent' }}>
                          Plan seleccionado
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {plans.map(plan => {
                        const isSelected = selectedPlans[cs.serviceId] === plan.id
                        const features: string[] = typeof plan.features === 'string'
                          ? (() => { try { return JSON.parse(plan.features) } catch { return [] } })()
                          : []
                        return (
                          <div
                            key={plan.id}
                            onClick={() => selectPlan(cs.serviceId, plan.id)}
                            className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                              isSelected
                                ? 'border-green-500 bg-green-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            {/* Recommended badge */}
                            {plan.badge && (
                              <div
                                className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                                style={{ background: plan.isRecommended ? '#FF8D00' : '#00C0FF' }}
                              >
                                {plan.badge}
                              </div>
                            )}

                            {/* Selection indicator */}
                            <div className="absolute top-2 right-2">
                              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                              }`}>
                                {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                              </div>
                            </div>

                            <div className="text-center mt-2">
                              <p className="font-bold text-gray-900 text-sm">{plan.name}</p>
                              <div className="mt-2">
                                {plan.originalPrice && plan.originalPrice > plan.price && (
                                  <span className="text-xs text-gray-400 line-through mr-1">S/{plan.originalPrice.toLocaleString()}</span>
                                )}
                                <span className="text-2xl font-black" style={{ color: isSelected ? '#16a34a' : '#00C0FF' }}>
                                  S/{plan.price.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">{plan.period}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                            </div>

                            {/* Features */}
                            {features.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <ul className="space-y-1">
                                  {features.slice(0, 4).map((f, i) => (
                                    <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1">
                                      <span className="text-green-500 mt-0.5">✓</span>
                                      <span className="line-clamp-1">{f}</span>
                                    </li>
                                  ))}
                                  {features.length > 4 && (
                                    <li className="text-[11px] text-gray-400">+{features.length - 4} más</li>
                                  )}
                                </ul>
                              </div>
                            )}
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

          {/* Summary & Discount */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Resumen</h3>

            {/* Service breakdown */}
            <div className="space-y-2">
              {client.services.map(cs => {
                const planId = selectedPlans[cs.serviceId]
                const plan = planId ? cs.service.plans.find(p => p.id === planId) : null
                return (
                  <div key={cs.serviceId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {cs.service.icon} {cs.service.name}
                      {plan ? ` — ${plan.name}` : ' — Sin seleccionar'}
                    </span>
                    <span className={`font-semibold ${plan ? 'text-gray-900' : 'text-gray-400'}`}>
                      {plan ? `S/${plan.price.toLocaleString()}` : '—'}
                    </span>
                  </div>
                )
              })}
            </div>

            <Separator />

            {/* Subtotal */}
            <div className="flex items-center justify-between font-semibold">
              <span>Subtotal</span>
              <span>S/{subtotal.toLocaleString()}</span>
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label className="font-semibold flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Descuento (opcional — monto en soles)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={descuento || ''}
                  onChange={e => setDescuento(Math.max(0, Math.min(Number(e.target.value) || 0, subtotal)))}
                  placeholder="0"
                  className="max-w-[160px]"
                />
                {descuento > 0 && (
                  <div className="flex items-center gap-1 text-sm text-orange-600 font-medium">
                    <Percent className="h-3.5 w-3.5" />
                    {descuentoPct.toFixed(1)}% de descuento
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between text-lg font-black">
              <span>Total</span>
              <span style={{ color: '#00C0FF' }}>S/{total.toLocaleString()}</span>
            </div>

            {/* Anticipo indicator */}
            <div className="flex items-center gap-2 text-sm">
              {anticipoPagado ? (
                <span className="text-green-600 font-medium">✅ Anticipo de confirmación abonado</span>
              ) : (
                <span className="text-gray-500">⬜ Anticipo de confirmación pendiente</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !allPlansSelected}
              className="text-white"
              style={{ background: allPlansSelected ? '#22c55e' : '#9ca3af' }}
            >
              {saving ? 'Guardando...' : 'Confirmar Aceptación'}
            </Button>
          </div>
          {!allPlansSelected && (
            <p className="text-xs text-center text-gray-500">Debes seleccionar un plan para cada servicio antes de confirmar.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Client Card Component
function ClientCard({ client, onEdit, onDelete, onDownloadProforma, onAcceptProforma }: {
  client: Client
  onEdit: () => void
  onDelete: () => void
  onDownloadProforma: () => void
  onAcceptProforma: () => void
}) {
  const isAccepted = client.status === 'aceptado'
  const isPending = client.status === 'pendiente'

  // Calculate totals for accepted clients
  const subtotal = client.services.reduce((sum, cs) => {
    return sum + (cs.selectedPlan?.price || 0)
  }, 0)
  const total = Math.max(0, subtotal - client.descuento)
  const descuentoPct = subtotal > 0 ? (client.descuento / subtotal) * 100 : 0

  return (
    <Card className={`hover:shadow-md transition-shadow ${isAccepted ? 'border-green-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold text-gray-900 truncate">{client.name}</CardTitle>
              {isPending && (
                <Badge className="text-[10px] px-1.5 py-0" style={{ background: '#f59e0b20', color: '#d97706', borderColor: 'transparent' }}>
                  <Clock className="h-3 w-3 inline mr-0.5" /> Pendiente
                </Badge>
              )}
              {isAccepted && (
                <Badge className="text-[10px] px-1.5 py-0" style={{ background: '#22c55e20', color: '#16a34a', borderColor: 'transparent' }}>
                  <CheckCircle className="h-3 w-3 inline mr-0.5" /> Aceptado
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{client.activity}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Services badges */}
          {client.services.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {client.services.map(cs => (
                <Badge
                  key={cs.serviceId}
                  variant="secondary"
                  className="text-xs"
                  style={{
                    background: cs.service.category === 'principal' ? '#00C0FF15' : '#FF8D0015',
                    color: cs.service.category === 'principal' ? '#00C0FF' : '#FF8D00',
                    borderColor: 'transparent'
                  }}
                >
                  {cs.service.icon} {cs.service.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Date & location */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {client.startDate && <span>📅 {client.startDate}</span>}
            {client.location && <span>📍 {client.location}</span>}
          </div>

          {/* Accepted client info */}
          {isAccepted && (
            <div className="bg-green-50 rounded-lg p-3 space-y-1.5 text-xs border border-green-100">
              {/* Selected plans */}
              {client.services.map(cs => (
                <div key={cs.serviceId} className="flex items-center justify-between">
                  <span className="text-gray-600">{cs.service.icon} {cs.selectedPlan?.name || '—'}</span>
                  <span className="font-semibold text-gray-900">
                    {cs.selectedPlan ? `S/${cs.selectedPlan.price.toLocaleString()}` : '—'}
                  </span>
                </div>
              ))}
              {client.descuento > 0 && (
                <div className="flex items-center justify-between text-orange-600">
                  <span>Descuento ({descuentoPct.toFixed(1)}%)</span>
                  <span>-S/{client.descuento.toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between font-bold text-sm">
                <span>Total</span>
                <span style={{ color: '#00C0FF' }}>S/{total.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {client.anticipoPagado ? (
                  <span className="text-green-600">✅ Anticipo abonado</span>
                ) : (
                  <span className="text-gray-500">⬜ Anticipo pendiente</span>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            {isPending && (
              <Button
                onClick={onAcceptProforma}
                size="sm"
                className="flex-1 text-white text-xs h-9"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Aceptar Proforma
              </Button>
            )}
            {isAccepted && (
              <Button
                onClick={onAcceptProforma}
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-9 border-green-300 text-green-700 hover:bg-green-50"
              >
                <Pencil className="h-3.5 w-3.5 mr-1" /> Editar Selección
              </Button>
            )}
            <Button
              onClick={onDownloadProforma}
              size="sm"
              className="text-white text-xs h-9"
              style={{ background: 'linear-gradient(135deg, #00C0FF, #0098cc)' }}
            >
              <Download className="h-3.5 w-3.5 mr-1" /> Proforma
            </Button>
            <Button
              onClick={() => window.open(`/api/proforma/${client.id}/pdf`, '_blank')}
              size="sm"
              variant="outline"
              className="text-xs h-9"
              title="Ver PDF"
            >
              <FileText className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Main Dashboard Component
export function Dashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('clientes')
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog states
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deleteClientOpen, setDeleteClientOpen] = useState(false)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [deleteServiceOpen, setDeleteServiceOpen] = useState(false)
  const [deletingService, setDeletingService] = useState<Service | null>(null)

  // Accept proforma dialog
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [acceptingClient, setAcceptingClient] = useState<Client | null>(null)

  const fetchData = async () => {
    try {
      const [clientsRes, servicesRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/services'),
      ])
      const clientsData = await clientsRes.json()
      const servicesData = await servicesRes.json()
      setClients(Array.isArray(clientsData) ? clientsData : [])
      setServices(Array.isArray(servicesData) ? servicesData : [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setClients([])
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  // Load data on mount
  useEffect(() => {
    fetchData()
  }, [])

  const handleSaveClient = async (data: Record<string, unknown>) => {
    try {
      const res = editingClient
        ? await fetch(`/api/clients/${editingClient.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
        : await fetch('/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        alert(`Error al guardar cliente: ${errData.error || 'Error desconocido'}`)
        return
      }
      setClientDialogOpen(false)
      setEditingClient(null)
      await fetchData()
    } catch (error) {
      console.error('Error saving client:', error)
      alert('Error de conexión al guardar cliente. Verifica tu conexión e intenta de nuevo.')
    }
  }

  const handleDeleteClient = async () => {
    if (!deletingClient) return
    try {
      await fetch(`/api/clients/${deletingClient.id}`, { method: 'DELETE' })
      setDeleteClientOpen(false)
      setDeletingClient(null)
      await fetchData()
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  const handleSaveService = async (data: Record<string, unknown>) => {
    try {
      const res = editingService
        ? await fetch(`/api/services/${editingService.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
        : await fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        alert(`Error al guardar servicio: ${errData.error || 'Error desconocido'}`)
        return
      }
      setServiceDialogOpen(false)
      setEditingService(null)
      await fetchData()
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Error de conexión al guardar servicio. Verifica tu conexión e intenta de nuevo.')
    }
  }

  const handleDeleteService = async () => {
    if (!deletingService) return
    try {
      await fetch(`/api/services/${deletingService.id}`, { method: 'DELETE' })
      setDeleteServiceOpen(false)
      setDeletingService(null)
      await fetchData()
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  const handleDownloadProforma = (client: Client) => {
    window.open(`/api/proforma/${client.id}?download=true`, '_blank')
  }

  const handleAcceptProforma = async (data: Record<string, unknown>) => {
    if (!acceptingClient) return
    try {
      const res = await fetch(`/api/clients/${acceptingClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        alert(`Error al aceptar proforma: ${errData.error || 'Error desconocido'}`)
        return
      }
      setAcceptDialogOpen(false)
      setAcceptingClient(null)
      await fetchData()
    } catch (error) {
      console.error('Error accepting proforma:', error)
      alert('Error de conexión al aceptar proforma. Verifica tu conexión e intenta de nuevo.')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.reload()
  }

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.activity.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
              <nav className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('clientes')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'clientes'
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  style={activeTab === 'clientes' ? { background: '#00C0FF' } : {}}
                >
                  <Users className="h-4 w-4 inline mr-1.5" />Clientes
                </button>
                <button
                  onClick={() => setActiveTab('servicios')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'servicios'
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  style={activeTab === 'servicios' ? { background: '#FF8D00' } : {}}
                >
                  <Package className="h-4 w-4 inline mr-1.5" />Servicios
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-gray-500">Administrador</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="sm:hidden flex items-center gap-1 pb-2">
            <button
              onClick={() => setActiveTab('clientes')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'clientes' ? 'text-white' : 'text-gray-600 bg-gray-100'
              }`}
              style={activeTab === 'clientes' ? { background: '#00C0FF' } : {}}
            >
              <Users className="h-4 w-4 inline mr-1" />Clientes
            </button>
            <button
              onClick={() => setActiveTab('servicios')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'servicios' ? 'text-white' : 'text-gray-600 bg-gray-100'
              }`}
              style={activeTab === 'servicios' ? { background: '#FF8D00' } : {}}
            >
              <Package className="h-4 w-4 inline mr-1" />Servicios
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={activeTab === 'clientes' ? 'Buscar clientes...' : 'Buscar servicios...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {activeTab === 'clientes' && (
            <Dialog open={clientDialogOpen} onOpenChange={(open) => {
              setClientDialogOpen(open)
              if (!open) setEditingClient(null)
            }}>
              <DialogTrigger asChild>
                <Button className="text-white" style={{ background: '#00C0FF' }}>
                  <Plus className="h-4 w-4 mr-1.5" /> Crear nuevo cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
                </DialogHeader>
                <ClientForm
                  client={editingClient}
                  services={services}
                  onSave={handleSaveClient}
                  onCancel={() => { setClientDialogOpen(false); setEditingClient(null) }}
                />
              </DialogContent>
            </Dialog>
          )}

          {activeTab === 'servicios' && (
            <Dialog open={serviceDialogOpen} onOpenChange={(open) => {
              setServiceDialogOpen(open)
              if (!open) setEditingService(null)
            }}>
              <DialogTrigger asChild>
                <Button className="text-white" style={{ background: '#FF8D00' }}>
                  <Plus className="h-4 w-4 mr-1.5" /> Crear nuevo servicio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
                </DialogHeader>
                <ServiceForm
                  service={editingService}
                  onSave={handleSaveService}
                  onCancel={() => { setServiceDialogOpen(false); setEditingService(null) }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Clientes Tab */}
        {activeTab === 'clientes' && (
          <div>
            {filteredClients.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No hay clientes</h3>
                <p className="text-sm text-gray-500 mt-1">Crea tu primer cliente para empezar a generar proformas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map(client => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onEdit={() => { setEditingClient(client); setClientDialogOpen(true) }}
                    onDelete={() => { setDeletingClient(client); setDeleteClientOpen(true) }}
                    onDownloadProforma={() => handleDownloadProforma(client)}
                    onAcceptProforma={() => { setAcceptingClient(client); setAcceptDialogOpen(true) }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Servicios Tab */}
        {activeTab === 'servicios' && (
          <div>
            {filteredServices.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No hay servicios</h3>
                <p className="text-sm text-gray-500 mt-1">Crea tu primer servicio para ofrecerlo a los clientes.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="hidden md:table-cell">Categoría</TableHead>
                      <TableHead className="hidden md:table-cell">Planes</TableHead>
                      <TableHead className="hidden lg:table-cell">Precio desde</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map(service => {
                      const minPrice = service.plans.length > 0
                        ? Math.min(...service.plans.map(p => p.price))
                        : 0
                      return (
                        <TableRow key={service.id}>
                          <TableCell className="text-xl">{service.icon}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-semibold text-gray-900">{service.name}</div>
                              <div className="text-xs text-gray-500 max-w-xs truncate">{service.description}</div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge
                              variant="secondary"
                              style={{
                                background: service.category === 'principal' ? '#00C0FF15' : '#FF8D0015',
                                color: service.category === 'principal' ? '#00C0FF' : '#FF8D00',
                                borderColor: 'transparent'
                              }}
                            >
                              {service.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm text-gray-600">{service.plans.length} planes</span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-sm font-semibold text-gray-900">S/{minPrice.toLocaleString()}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setEditingService(service); setServiceDialogOpen(true) }}>
                                  <Pencil className="h-4 w-4 mr-2" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setDeletingService(service); setDeleteServiceOpen(true) }} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
      </main>

      {/* Accept Proforma Dialog */}
      {acceptingClient && (
        <AcceptProformaDialog
          client={acceptingClient}
          open={acceptDialogOpen}
          onOpenChange={(open) => {
            setAcceptDialogOpen(open)
            if (!open) setAcceptingClient(null)
          }}
          onSave={handleAcceptProforma}
        />
      )}

      {/* Delete Client Alert */}
      <AlertDialog open={deleteClientOpen} onOpenChange={setDeleteClientOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar a <strong>{deletingClient?.name}</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Service Alert */}
      <AlertDialog open={deleteServiceOpen} onOpenChange={setDeleteServiceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar el servicio <strong>{deletingService?.name}</strong>? Esta acción no se puede deshacer y se eliminará de todos los clientes que lo tengan asignado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
