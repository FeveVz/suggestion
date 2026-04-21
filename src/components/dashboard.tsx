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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
} from 'lucide-react'

// Types
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

interface Client {
  id: string
  name: string
  activity: string
  startDate: string
  location: string
  phone: string
  email: string
  services: {
    service: Service
  }[]
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
    client?.services.map(s => s.service.id) || []
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

// Client Card Component
function ClientCard({ client, onEdit, onDelete, onDownloadProforma }: {
  client: Client
  onEdit: () => void
  onDelete: () => void
  onDownloadProforma: () => void
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-gray-900 truncate">{client.name}</CardTitle>
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
          {client.services.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {client.services.map(s => (
                <Badge
                  key={s.service.id}
                  variant="secondary"
                  className="text-xs"
                  style={{
                    background: s.service.category === 'principal' ? '#00C0FF15' : '#FF8D0015',
                    color: s.service.category === 'principal' ? '#00C0FF' : '#FF8D00',
                    borderColor: 'transparent'
                  }}
                >
                  {s.service.icon} {s.service.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            {client.startDate && <span>📅 {client.startDate}</span>}
            {client.location && <span>📍 {client.location}</span>}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={onDownloadProforma}
              size="sm"
              className="flex-1 text-white text-xs h-9"
              style={{ background: 'linear-gradient(135deg, #00C0FF, #0098cc)' }}
            >
              <Download className="h-3.5 w-3.5 mr-1" /> Descargar Proforma
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

  const fetchData = async () => {
    try {
      const [clientsRes, servicesRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/services'),
      ])
      const clientsData = await clientsRes.json()
      const servicesData = await servicesRes.json()
      setClients(clientsData)
      setServices(servicesData)
    } catch (error) {
      console.error('Error fetching data:', error)
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
      if (editingClient) {
        await fetch(`/api/clients/${editingClient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } else {
        await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }
      setClientDialogOpen(false)
      setEditingClient(null)
      await fetchData()
    } catch (error) {
      console.error('Error saving client:', error)
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
      if (editingService) {
        await fetch(`/api/services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } else {
        await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }
      setServiceDialogOpen(false)
      setEditingService(null)
      await fetchData()
    } catch (error) {
      console.error('Error saving service:', error)
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
