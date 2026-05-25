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
import { Plus, MoreVertical, Pencil, Trash2, Receipt } from 'lucide-react'
import type { Proyecto, Gasto } from '@/components/dashboard'

const CATEGORIAS_GASTO = ['operativo', 'herramientas', 'publicidad', 'personal', 'transporte', 'otro']

// ── GastoForm ────────────────────────────────────────────────────────────────

function GastoForm({ gasto, proyectos, onSave, onCancel }: {
  gasto?: Gasto | null
  proyectos: Proyecto[]
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const [concepto, setConcepto] = useState(gasto?.concepto || '')
  const [monto, setMonto] = useState(gasto?.monto?.toString() || '')
  const [moneda, setMoneda] = useState(gasto?.moneda || 'PEN')
  const [fecha, setFecha] = useState(gasto?.fecha || new Date().toISOString().split('T')[0])
  const [proyectoId, setProyectoId] = useState(gasto?.proyectoId || '')
  const [categoria, setCategoria] = useState(gasto?.categoria || '')
  const [comprobante, setComprobante] = useState(gasto?.comprobante || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({
      concepto,
      monto: Number(monto),
      moneda,
      fecha,
      proyectoId: proyectoId || null,
      categoria: categoria || null,
      comprobante: comprobante || null,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label>Concepto *</Label>
          <Input value={concepto} onChange={e => setConcepto(e.target.value)} required placeholder="Hosting mensual, licencia Adobe..." />
        </div>
        <div className="space-y-2">
          <Label>Monto *</Label>
          <Input type="number" step="0.01" min="0.01" value={monto} onChange={e => setMonto(e.target.value)} required placeholder="0.00" />
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
          <Label>Fecha *</Label>
          <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Categoría</Label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger><SelectValue placeholder="Sin categoría" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin categoría</SelectItem>
              {CATEGORIAS_GASTO.map(c => (
                <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Proyecto <span className="text-gray-400 font-normal">(opcional)</span></Label>
          <Select value={proyectoId} onValueChange={setProyectoId}>
            <SelectTrigger><SelectValue placeholder="Gasto general (sin proyecto)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Gasto general (sin proyecto)</SelectItem>
              {proyectos.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nombre} {p.cliente ? `— ${p.cliente.name}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Comprobante <span className="text-gray-400 font-normal">(Nº doc., URL, descripción)</span></Label>
          <Input value={comprobante} onChange={e => setComprobante(e.target.value)} placeholder="Factura 001-00123 / https://..." />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving} style={{ background: '#EF4444' }} className="text-white">
          {saving ? 'Guardando...' : gasto ? 'Actualizar' : 'Registrar Gasto'}
        </Button>
      </div>
    </form>
  )
}

// ── GastosTab ────────────────────────────────────────────────────────────────

interface GastosTabProps {
  proyectos: Proyecto[]
  isActive: boolean
}

export function GastosTab({ proyectos, isActive }: GastosTabProps) {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Filters
  const [proyectoFilter, setProyectoFilter] = useState('all')
  const [categoriaFilter, setCategoriaFilter] = useState('all')
  const [desdeFilter, setDesdeFilter] = useState('')
  const [hastaFilter, setHastaFilter] = useState('')

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingGasto, setDeletingGasto] = useState<Gasto | null>(null)

  const fetchGastos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (proyectoFilter !== 'all' && proyectoFilter !== 'sin-proyecto') params.set('proyectoId', proyectoFilter)
      if (desdeFilter) params.set('desde', desdeFilter)
      if (hastaFilter) params.set('hasta', hastaFilter)
      const url = `/api/gastos${params.toString() ? '?' + params.toString() : ''}`
      const res = await fetch(url)
      const data = await res.json()
      let list: Gasto[] = Array.isArray(data) ? data : []
      // 'sin-proyecto' filter is handled client-side (API doesn't support it)
      if (proyectoFilter === 'sin-proyecto') list = list.filter(g => !g.proyectoId)
      setGastos(list)
      setLoaded(true)
    } catch (err) {
      console.error('GastosTab fetchGastos error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Lazy load on first activation
  useEffect(() => {
    if (isActive && !loaded) { fetchGastos() }
  }, [isActive]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when filters change (after initial load)
  useEffect(() => {
    if (loaded) { fetchGastos() }
  }, [proyectoFilter, desdeFilter, hastaFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      const res = editingGasto
        ? await fetch(`/api/gastos/${editingGasto.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        : await fetch('/api/gastos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const err = await res.json().catch(() => ({})); alert(`Error: ${err.error || 'Error desconocido'}`); return }
      setDialogOpen(false); setEditingGasto(null); await fetchGastos()
    } catch { alert('Error de conexión') }
  }

  const handleDelete = async () => {
    if (!deletingGasto) return
    try {
      await fetch(`/api/gastos/${deletingGasto.id}`, { method: 'DELETE' })
      setDeleteOpen(false); setDeletingGasto(null); await fetchGastos()
    } catch { alert('Error de conexión') }
  }

  // Stats
  const totalPEN = gastos.filter(g => g.moneda === 'PEN').reduce((s, g) => s + g.monto, 0)
  const totalUSD = gastos.filter(g => g.moneda === 'USD').reduce((s, g) => s + g.monto, 0)
  const sinProyecto = gastos.filter(g => !g.proyectoId).length

  // Client-side categoria filter
  const filtered = categoriaFilter === 'all'
    ? gastos
    : gastos.filter(g => (g.categoria || '') === categoriaFilter)

  const getNombreProyecto = (proyectoId: string | null) => {
    if (!proyectoId) return null
    const p = proyectos.find(p => p.id === proyectoId)
    return p ? p.nombre : proyectoId
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-black" style={{ color: '#EF4444' }}>S/{totalPEN.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-500">Total en Soles</p>
        </div>
        {totalUSD > 0 && (
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-2xl font-black text-gray-700">${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-500">Total en Dólares</p>
          </div>
        )}
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-black text-gray-400">{sinProyecto}</p>
          <p className="text-xs text-gray-500">Sin proyecto</p>
        </div>
      </div>

      {/* Filters + Create button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={proyectoFilter} onValueChange={setProyectoFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Todos los proyectos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proyectos</SelectItem>
              <SelectItem value="sin-proyecto">Sin proyecto</SelectItem>
              {proyectos.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Categoría" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {CATEGORIAS_GASTO.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={desdeFilter} onChange={e => setDesdeFilter(e.target.value)} className="w-[150px]" placeholder="Desde" title="Desde" />
          <Input type="date" value={hastaFilter} onChange={e => setHastaFilter(e.target.value)} className="w-[150px]" placeholder="Hasta" title="Hasta" />
          {(desdeFilter || hastaFilter || proyectoFilter !== 'all' || categoriaFilter !== 'all') && (
            <Button variant="ghost" size="sm" className="text-gray-400" onClick={() => { setProyectoFilter('all'); setCategoriaFilter('all'); setDesdeFilter(''); setHastaFilter('') }}>
              ✕ Limpiar
            </Button>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingGasto(null) }}>
          <DialogTrigger asChild>
            <Button style={{ background: '#EF4444' }} className="text-white flex-shrink-0">
              <Plus className="h-4 w-4 mr-1.5" />Registrar Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingGasto ? 'Editar Gasto' : 'Registrar Gasto'}</DialogTitle></DialogHeader>
            <GastoForm gasto={editingGasto} proyectos={proyectos} onSave={handleSave} onCancel={() => { setDialogOpen(false); setEditingGasto(null) }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto" style={{ borderColor: '#EF4444' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No hay gastos</h3>
          <p className="text-sm text-gray-500 mt-1">Registra tu primer gasto.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead className="hidden md:table-cell">Proyecto</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                <TableHead className="hidden lg:table-cell">Comprobante</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(gasto => (
                <TableRow key={gasto.id}>
                  <TableCell className="font-semibold text-gray-900">{gasto.concepto}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-gray-600">
                    {getNombreProyecto(gasto.proyectoId) ?? <span className="text-gray-400 italic">General</span>}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold" style={{ color: '#EF4444' }}>
                      {gasto.moneda === 'PEN' ? 'S/' : '$'}{Number(gasto.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-gray-600">{gasto.fecha}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {gasto.categoria
                      ? <Badge variant="secondary" style={{ background: '#EF444420', color: '#DC2626', borderColor: 'transparent' }}>{gasto.categoria}</Badge>
                      : <span className="text-gray-400 text-xs">—</span>}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-gray-500 max-w-[200px] truncate">{gasto.comprobante || '—'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingGasto(gasto); setDialogOpen(true) }}>
                          <Pencil className="h-4 w-4 mr-2" />Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setDeletingGasto(gasto); setDeleteOpen(true) }} className="text-red-600">
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
            <AlertDialogTitle>¿Eliminar gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro de eliminar <strong>{deletingGasto?.concepto}</strong>? Esta acción no se puede deshacer.
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
