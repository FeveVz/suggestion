'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, MoreVertical, Pencil, Trash2, FolderOpen, CreditCard, PackageCheck } from 'lucide-react'
import type { Client, Proyecto } from '@/components/dashboard'

// ── Estado badge ──────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  propuesta: { bg: '#F59E0B20', color: '#D97706', label: 'Propuesta' },
  activo:    { bg: '#22C55E20', color: '#16A34A', label: 'Activo' },
  pausado:   { bg: '#6B728020', color: '#4B5563', label: 'Pausado' },
  cerrado:   { bg: '#3B82F620', color: '#1D4ED8', label: 'Cerrado' },
  perdido:   { bg: '#EF444420', color: '#DC2626', label: 'Perdido' },
}

const TIPO_CONFIG: Record<string, string> = {
  retainer: 'Retainer',
  proyecto: 'Proyecto',
  consultoria: 'Consultoría',
}

function ProyectoEstadoBadge({ estado }: { estado: string }) {
  const c = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.propuesta
  return (
    <Badge className="text-[10px] px-1.5 py-0" style={{ background: c.bg, color: c.color, borderColor: 'transparent' }}>
      {c.label}
    </Badge>
  )
}

// ── ProyectoForm ──────────────────────────────────────────────────────────────

function ProyectoForm({ proyecto, clients, onSave, onCancel }: {
  proyecto?: Proyecto | null
  clients: Client[]
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const [clienteId, setClienteId] = useState(proyecto?.clienteId || '')
  const [nombre, setNombre] = useState(proyecto?.nombre || '')
  const [tipo, setTipo] = useState(proyecto?.tipo || 'proyecto')
  const [subtotal, setSubtotal] = useState(proyecto?.subtotal?.toString() || '')
  const [igv, setIgv] = useState(proyecto?.igv?.toString() || '0')
  const [moneda, setMoneda] = useState(proyecto?.moneda || 'PEN')
  const [estado, setEstado] = useState(proyecto?.estado || 'propuesta')
  const [responsableInterno, setResponsableInterno] = useState(proyecto?.responsableInterno || '')
  const [fechaInicio, setFechaInicio] = useState(proyecto?.fechaInicio || '')
  const [fechaFin, setFechaFin] = useState(proyecto?.fechaFin || '')
  const [notas, setNotas] = useState(proyecto?.notas || '')
  const [saving, setSaving] = useState(false)

  const subtotalNum = Number(subtotal) || 0
  const igvNum = Number(igv) || 0
  const totalCalc = subtotalNum + igvNum

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({
      clienteId,
      nombre,
      tipo,
      subtotal: subtotalNum,
      igv: igvNum,
      moneda,
      estado,
      responsableInterno: responsableInterno || null,
      fechaInicio,
      fechaFin: fechaFin || null,
      notas: notas || null,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label>Cliente *</Label>
          <Select value={clienteId} onValueChange={setClienteId} required>
            <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
            <SelectContent>
              {clients.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Nombre del proyecto *</Label>
          <Input value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Campaña verano 2026, Rediseño web..." />
        </div>
        <div className="space-y-2">
          <Label>Tipo *</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(TIPO_CONFIG).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Subtotal ({moneda === 'PEN' ? 'S/' : '$'}) *</Label>
          <Input type="number" step="0.01" min="0" value={subtotal} onChange={e => setSubtotal(e.target.value)} required placeholder="0.00" />
        </div>
        <div className="space-y-2">
          <Label>IGV ({moneda === 'PEN' ? 'S/' : '$'})</Label>
          <Input type="number" step="0.01" min="0" value={igv} onChange={e => setIgv(e.target.value)} placeholder="0.00" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
            <span className="text-sm text-gray-600">Total calculado:</span>
            <span className="text-lg font-black" style={{ color: '#3B82F6' }}>
              {moneda === 'PEN' ? 'S/' : '$'}{totalCalc.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Moneda</Label>
          <Select value={moneda} onValueChange={setMoneda}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PEN">S/ Soles (PEN)</SelectItem>
              <SelectItem value="USD">$ Dólares (USD)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Responsable interno <span className="text-gray-400 font-normal">(opcional)</span></Label>
          <Input value={responsableInterno} onChange={e => setResponsableInterno(e.target.value)} placeholder="Nombre del responsable" />
        </div>
        <div className="space-y-2">
          <Label>Fecha de inicio *</Label>
          <Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Fecha de fin <span className="text-gray-400 font-normal">(opcional)</span></Label>
          <Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Notas internas <span className="text-gray-400 font-normal">(opcional)</span></Label>
          <textarea value={notas} onChange={e => setNotas(e.target.value)} className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm" rows={2} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving || !clienteId} style={{ background: '#3B82F6' }} className="text-white">
          {saving ? 'Guardando...' : proyecto ? 'Actualizar' : 'Crear Proyecto'}
        </Button>
      </div>
    </form>
  )
}

// ── ProyectosTab ──────────────────────────────────────────────────────────────

interface ProyectosTabProps {
  proyectos: Proyecto[]
  loadingProyectos: boolean
  clients: Client[]
  onRefresh: () => void
  onNavigateTo: (tab: string, filters?: Record<string, unknown>) => void
  initialFilters?: { clienteId?: string }
}

export function ProyectosTab({
  proyectos,
  loadingProyectos,
  clients,
  onRefresh,
  onNavigateTo,
  initialFilters,
}: ProyectosTabProps) {
  const [clienteFilter, setClienteFilter] = useState(initialFilters?.clienteId || 'all')
  const [estadoFilter, setEstadoFilter] = useState('all')
  const [tipoFilter, setTipoFilter] = useState('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProyecto, setEditingProyecto] = useState<Proyecto | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingProyecto, setDeletingProyecto] = useState<Proyecto | null>(null)

  // Apply new initialFilters when navigating from ClientCard
  useEffect(() => {
    if (initialFilters?.clienteId) setClienteFilter(initialFilters.clienteId)
  }, [initialFilters?.clienteId])

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      const res = editingProyecto
        ? await fetch(`/api/proyectos/${editingProyecto.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        : await fetch('/api/proyectos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const err = await res.json().catch(() => ({})); alert(`Error: ${err.error || 'Error desconocido'}`); return }
      setDialogOpen(false); setEditingProyecto(null); onRefresh()
    } catch { alert('Error de conexión') }
  }

  const handleDelete = async () => {
    if (!deletingProyecto) return
    try {
      const res = await fetch(`/api/proyectos/${deletingProyecto.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (res.status === 409) alert(err.error || 'No se puede eliminar: tiene cobros asociados.')
        else alert(`Error: ${err.error || 'Error desconocido'}`)
        setDeleteOpen(false); setDeletingProyecto(null); return
      }
      setDeleteOpen(false); setDeletingProyecto(null); onRefresh()
    } catch { alert('Error de conexión') }
  }

  // Filters
  const filtered = proyectos.filter(p => {
    if (clienteFilter !== 'all' && p.clienteId !== clienteFilter) return false
    if (estadoFilter !== 'all' && p.estado !== estadoFilter) return false
    if (tipoFilter !== 'all' && p.tipo !== tipoFilter) return false
    return true
  })

  // Stats
  const totalPEN = proyectos.filter(p => p.moneda === 'PEN').reduce((s, p) => s + p.total, 0)
  const activos = proyectos.filter(p => p.estado === 'activo').length
  const propuestas = proyectos.filter(p => p.estado === 'propuesta').length

  const getNombreCliente = (clienteId: string) => {
    const c = clients.find(c => c.id === clienteId)
    return c?.name ?? clienteId
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-black" style={{ color: '#3B82F6' }}>{proyectos.length}</p>
          <p className="text-xs text-gray-500">Total proyectos</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center cursor-pointer hover:shadow-md" onClick={() => setEstadoFilter(estadoFilter === 'activo' ? 'all' : 'activo')}>
          <p className="text-2xl font-black text-green-600">{activos}</p>
          <p className="text-xs text-gray-500">Activos</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center cursor-pointer hover:shadow-md" onClick={() => setEstadoFilter(estadoFilter === 'propuesta' ? 'all' : 'propuesta')}>
          <p className="text-2xl font-black text-yellow-600">{propuestas}</p>
          <p className="text-xs text-gray-500">Propuestas</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-black" style={{ color: '#3B82F6' }}>S/{totalPEN.toLocaleString('es-PE', { minimumFractionDigits: 0 })}</p>
          <p className="text-xs text-gray-500">Valor total (PEN)</p>
        </div>
      </div>

      {/* Filters + Create */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={clienteFilter} onValueChange={setClienteFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Todos los clientes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {Object.entries(TIPO_CONFIG).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {clienteFilter !== 'all' && (
            <Badge
              className="cursor-pointer text-xs px-2 py-1"
              style={{ background: '#3B82F620', color: '#1D4ED8', borderColor: 'transparent' }}
              onClick={() => setClienteFilter('all')}
            >
              {getNombreCliente(clienteFilter)} ✕
            </Badge>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingProyecto(null) }}>
          <DialogTrigger asChild>
            <Button style={{ background: '#3B82F6' }} className="text-white flex-shrink-0">
              <Plus className="h-4 w-4 mr-1.5" />Crear Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle></DialogHeader>
            <ProyectoForm proyecto={editingProyecto} clients={clients} onSave={handleSave} onCancel={() => { setDialogOpen(false); setEditingProyecto(null) }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      {loadingProyectos ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto" style={{ borderColor: '#3B82F6' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No hay proyectos</h3>
          <p className="text-sm text-gray-500 mt-1">Crea el primer proyecto de un cliente.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Cliente</TableHead>
                <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden lg:table-cell">Inicio</TableHead>
                <TableHead className="hidden md:table-cell">Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-semibold text-gray-900 text-sm">{p.nombre}</div>
                    {p.notas && <div className="text-xs text-gray-500 max-w-[200px] truncate">{p.notas}</div>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-gray-600">
                    {p.cliente?.name ?? getNombreCliente(p.clienteId)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary" style={{ background: '#3B82F610', color: '#3B82F6', borderColor: 'transparent' }}>
                      {TIPO_CONFIG[p.tipo] ?? p.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell><ProyectoEstadoBadge estado={p.estado} /></TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-gray-600">{p.fechaInicio}</TableCell>
                  <TableCell className="hidden md:table-cell font-semibold text-sm" style={{ color: '#3B82F6' }}>
                    {p.moneda === 'PEN' ? 'S/' : '$'}{Number(p.total).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingProyecto(p); setDialogOpen(true) }}>
                          <Pencil className="h-4 w-4 mr-2" />Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNavigateTo('cobros', { proyectoId: p.id })}>
                          <CreditCard className="h-4 w-4 mr-2" />Ver Cobros
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNavigateTo('entregables', { proyectoId: p.id })}>
                          <PackageCheck className="h-4 w-4 mr-2" />Ver Entregables
                        </DropdownMenuItem>
                        <Separator className="my-1" />
                        <DropdownMenuItem onClick={() => { setDeletingProyecto(p); setDeleteOpen(true) }} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro de eliminar <strong>{deletingProyecto?.nombre}</strong>? Los entregables asociados se eliminarán. Si tiene cobros, la operación fallará.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
