'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, MoreVertical, Pencil, Trash2, PackageCheck, AlertCircle } from 'lucide-react'
import type { Proyecto, Entregable } from '@/components/dashboard'

// ── Estado badge ─────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  pendiente:    { bg: '#6B728020', color: '#4B5563', label: 'Pendiente' },
  en_proceso:   { bg: '#3B82F620', color: '#2563EB', label: 'En proceso' },
  entregado:    { bg: '#00C0FF20', color: '#0098CC', label: 'Entregado' },
  aprobado:     { bg: '#22C55E20', color: '#16A34A', label: 'Aprobado' },
  rechazado:    { bg: '#EF444420', color: '#DC2626', label: 'Rechazado' },
}

function EntregableEstadoBadge({ estado }: { estado: string }) {
  const c = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.pendiente
  return (
    <Badge className="text-[10px] px-1.5 py-0" style={{ background: c.bg, color: c.color, borderColor: 'transparent' }}>
      {c.label}
    </Badge>
  )
}

// ── EntregableForm ────────────────────────────────────────────────────────────

function EntregableForm({ entregable, proyectos, onSave, onCancel }: {
  entregable?: Entregable | null
  proyectos: Proyecto[]
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const [proyectoId, setProyectoId] = useState(entregable?.proyectoId || '')
  const [nombre, setNombre] = useState(entregable?.nombre || '')
  const [descripcion, setDescripcion] = useState(entregable?.descripcion || '')
  const [fechaCompromiso, setFechaCompromiso] = useState(entregable?.fechaCompromiso || '')
  const [fechaEntrega, setFechaEntrega] = useState(entregable?.fechaEntrega || '')
  const [estado, setEstado] = useState(entregable?.estado || 'pendiente')
  const [responsable, setResponsable] = useState(entregable?.responsable || '')
  const [evidenciaUrl, setEvidenciaUrl] = useState(entregable?.evidenciaUrl || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({
      proyectoId: proyectoId || undefined,
      nombre,
      descripcion: descripcion || null,
      fechaCompromiso,
      fechaEntrega: fechaEntrega || null,
      estado,
      responsable: responsable || null,
      evidenciaUrl: evidenciaUrl || null,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label>Proyecto *</Label>
          <Select value={proyectoId} onValueChange={setProyectoId} required>
            <SelectTrigger><SelectValue placeholder="Seleccionar proyecto" /></SelectTrigger>
            <SelectContent>
              {proyectos.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nombre}{p.cliente ? ` — ${p.cliente.name}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Nombre del entregable *</Label>
          <Input value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Diseño de portada, Informe mensual..." />
        </div>
        <div className="space-y-2">
          <Label>Fecha compromiso *</Label>
          <Input type="date" value={fechaCompromiso} onChange={e => setFechaCompromiso(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Fecha de entrega <span className="text-gray-400 font-normal">(cuando se completó)</span></Label>
          <Input type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} />
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
          <Label>Responsable <span className="text-gray-400 font-normal">(opcional)</span></Label>
          <Input value={responsable} onChange={e => setResponsable(e.target.value)} placeholder="Nombre del responsable" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Descripción <span className="text-gray-400 font-normal">(opcional)</span></Label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm" rows={2} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>URL de evidencia <span className="text-gray-400 font-normal">(opcional)</span></Label>
          <Input type="url" value={evidenciaUrl} onChange={e => setEvidenciaUrl(e.target.value)} placeholder="https://drive.google.com/..." />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving || !proyectoId} style={{ background: '#F59E0B' }} className="text-white">
          {saving ? 'Guardando...' : entregable ? 'Actualizar' : 'Crear Entregable'}
        </Button>
      </div>
    </form>
  )
}

// ── EntregablesTab ────────────────────────────────────────────────────────────

interface EntregablesTabProps {
  proyectos: Proyecto[]
  isActive: boolean
  initialFilters?: { proyectoId?: string }
}

export function EntregablesTab({ proyectos, isActive, initialFilters }: EntregablesTabProps) {
  const [entregables, setEntregables] = useState<Entregable[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const [proyectoFilter, setProyectoFilter] = useState(initialFilters?.proyectoId || 'all')
  const [estadoFilter, setEstadoFilter] = useState('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEntregable, setEditingEntregable] = useState<Entregable | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingEntregable, setDeletingEntregable] = useState<Entregable | null>(null)

  const fetchEntregables = async (proyId?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const pid = proyId !== undefined ? proyId : proyectoFilter
      if (pid && pid !== 'all') params.set('proyectoId', pid)
      const res = await fetch(`/api/entregables${params.toString() ? '?' + params.toString() : ''}`)
      const data = await res.json()
      setEntregables(Array.isArray(data) ? data : [])
      setLoaded(true)
    } catch (err) {
      console.error('EntregablesTab fetchEntregables error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Apply new initialFilters from cross-tab navigation
  useEffect(() => {
    if (initialFilters?.proyectoId) setProyectoFilter(initialFilters.proyectoId)
  }, [initialFilters?.proyectoId])

  useEffect(() => {
    if (isActive && !loaded) fetchEntregables()
  }, [isActive]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loaded) fetchEntregables()
  }, [proyectoFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      const res = editingEntregable
        ? await fetch(`/api/entregables/${editingEntregable.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        : await fetch('/api/entregables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const err = await res.json().catch(() => ({})); alert(`Error: ${err.error || 'Error desconocido'}`); return }
      setDialogOpen(false); setEditingEntregable(null); await fetchEntregables()
    } catch { alert('Error de conexión') }
  }

  const handleDelete = async () => {
    if (!deletingEntregable) return
    try {
      await fetch(`/api/entregables/${deletingEntregable.id}`, { method: 'DELETE' })
      setDeleteOpen(false); setDeletingEntregable(null); await fetchEntregables()
    } catch { alert('Error de conexión') }
  }

  const today = new Date().toISOString().split('T')[0]

  // Stats
  const stats = {
    pendiente: entregables.filter(e => e.estado === 'pendiente').length,
    en_proceso: entregables.filter(e => e.estado === 'en_proceso').length,
    entregado: entregables.filter(e => e.estado === 'entregado').length,
    aprobado: entregables.filter(e => e.estado === 'aprobado').length,
    rechazado: entregables.filter(e => e.estado === 'rechazado').length,
  }

  // Client-side estado filter
  const filtered = estadoFilter === 'all'
    ? entregables
    : entregables.filter(e => e.estado === estadoFilter)

  const getNombreProyecto = (proyectoId: string) => {
    const p = proyectos.find(p => p.id === proyectoId)
    return p?.nombre ?? proyectoId
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {Object.entries(stats).map(([key, count]) => (
          <div
            key={key}
            onClick={() => setEstadoFilter(estadoFilter === key ? 'all' : key)}
            className={`bg-white rounded-xl border p-3 text-center cursor-pointer hover:shadow-md transition-shadow ${estadoFilter === key ? 'ring-2' : ''}`}
            style={estadoFilter === key ? { ringColor: ESTADO_CONFIG[key]?.color } : {}}
          >
            <p className="text-xl font-black" style={{ color: ESTADO_CONFIG[key]?.color }}>{count}</p>
            <p className="text-[10px] text-gray-500">{ESTADO_CONFIG[key]?.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + Create button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={proyectoFilter} onValueChange={setProyectoFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Todos los proyectos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proyectos</SelectItem>
              {proyectos.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
          {proyectoFilter !== 'all' && (
            <Badge
              className="cursor-pointer text-xs px-2 py-1"
              style={{ background: '#F59E0B20', color: '#D97706', borderColor: 'transparent' }}
              onClick={() => setProyectoFilter('all')}
            >
              {getNombreProyecto(proyectoFilter)} ✕
            </Badge>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingEntregable(null) }}>
          <DialogTrigger asChild>
            <Button style={{ background: '#F59E0B' }} className="text-white flex-shrink-0">
              <Plus className="h-4 w-4 mr-1.5" />Crear Entregable
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingEntregable ? 'Editar Entregable' : 'Nuevo Entregable'}</DialogTitle></DialogHeader>
            <EntregableForm entregable={editingEntregable} proyectos={proyectos} onSave={handleSave} onCancel={() => { setDialogOpen(false); setEditingEntregable(null) }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto" style={{ borderColor: '#F59E0B' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <PackageCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No hay entregables</h3>
          <p className="text-sm text-gray-500 mt-1">Crea el primer entregable de un proyecto.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Proyecto</TableHead>
                <TableHead>Compromiso</TableHead>
                <TableHead className="hidden sm:table-cell">Entregado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden lg:table-cell">Responsable</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(ent => {
                const isVencido = ent.fechaCompromiso < today && ent.estado !== 'aprobado' && ent.estado !== 'entregado'
                return (
                  <TableRow key={ent.id} className={isVencido ? 'bg-red-50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {isVencido && <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />}
                        <span className="font-semibold text-gray-900 text-sm">{ent.nombre}</span>
                      </div>
                      {ent.descripcion && <p className="text-xs text-gray-500 truncate max-w-[200px]">{ent.descripcion}</p>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-gray-600">{getNombreProyecto(ent.proyectoId)}</TableCell>
                    <TableCell className={`text-sm ${isVencido ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>{ent.fechaCompromiso}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-gray-600">{ent.fechaEntrega || '—'}</TableCell>
                    <TableCell><EntregableEstadoBadge estado={ent.estado} /></TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-gray-600">{ent.responsable || '—'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingEntregable(ent); setDialogOpen(true) }}>
                            <Pencil className="h-4 w-4 mr-2" />Editar
                          </DropdownMenuItem>
                          {ent.evidenciaUrl && (
                            <DropdownMenuItem onClick={() => window.open(ent.evidenciaUrl!, '_blank')}>
                              🔗 Ver evidencia
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => { setDeletingEntregable(ent); setDeleteOpen(true) }} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />Eliminar
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

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar entregable?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro de eliminar <strong>{deletingEntregable?.nombre}</strong>? Esta acción no se puede deshacer.
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
