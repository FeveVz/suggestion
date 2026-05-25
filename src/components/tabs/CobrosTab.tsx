'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
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
import {
  Plus, MoreVertical, Pencil, Trash2, CreditCard,
  ChevronDown, ChevronRight, AlertTriangle, CheckCircle2,
} from 'lucide-react'
import type { Proyecto, Cobro, Pago } from '@/components/dashboard'

// ── Helpers ───────────────────────────────────────────────────────────────────

const COBRO_ESTADO_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  pendiente: { bg: '#F59E0B20', color: '#D97706', label: 'Pendiente' },
  parcial:   { bg: '#3B82F620', color: '#2563EB', label: 'Parcial' },
  pagado:    { bg: '#22C55E20', color: '#16A34A', label: 'Pagado' },
  vencido:   { bg: '#EF444420', color: '#DC2626', label: 'Vencido' },
  anulado:   { bg: '#6B728020', color: '#4B5563', label: 'Anulado' },
}

const METODOS_PAGO: { value: string; label: string }[] = [
  { value: 'yape',          label: 'Yape' },
  { value: 'plin',          label: 'Plin' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'efectivo',      label: 'Efectivo' },
  { value: 'deposito',      label: 'Depósito' },
]

function CobroEstadoBadge({ estado }: { estado: string }) {
  const c = COBRO_ESTADO_CONFIG[estado] ?? COBRO_ESTADO_CONFIG.pendiente
  return (
    <Badge className="text-[10px] px-1.5 py-0" style={{ background: c.bg, color: c.color, borderColor: 'transparent' }}>
      {c.label}
    </Badge>
  )
}

function fmt(n: number, moneda: 'PEN' | 'USD' = 'PEN') {
  const sym = moneda === 'PEN' ? 'S/' : '$'
  return `${sym}${n.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
}

// ── CobroForm ─────────────────────────────────────────────────────────────────

function CobroForm({ cobro, proyectos, onSave, onCancel }: {
  cobro?: Cobro | null
  proyectos: Proyecto[]
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const [proyectoId, setProyectoId] = useState(cobro?.proyectoId || '')
  const [concepto, setConcepto] = useState(cobro?.concepto || '')
  const [subtotal, setSubtotal] = useState(cobro?.subtotal?.toString() || '')
  const [igv, setIgv] = useState(cobro?.igv?.toString() || '0')
  const [moneda, setMoneda] = useState<'PEN' | 'USD'>(cobro?.moneda || 'PEN')
  const [tipoDocumento, setTipoDocumento] = useState(cobro?.tipoDocumento || '')
  const [numeroDocumento, setNumeroDocumento] = useState(cobro?.numeroDocumento || '')
  const [fechaEmision, setFechaEmision] = useState(cobro?.fechaEmision || new Date().toISOString().split('T')[0])
  const [diasCredito, setDiasCredito] = useState(cobro?.diasCredito?.toString() || '0')
  const [saving, setSaving] = useState(false)

  const subtotalNum = Number(subtotal) || 0
  const igvNum = Number(igv) || 0
  const totalCalc = subtotalNum + igvNum

  // Compute fechaVencimiento for display (mirrors DB GENERATED AS logic)
  const fechaVencimientoCalc = (() => {
    if (!fechaEmision || !diasCredito) return ''
    const d = new Date(fechaEmision + 'T00:00:00')
    d.setDate(d.getDate() + Number(diasCredito))
    return d.toISOString().split('T')[0]
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({
      proyectoId,
      concepto,
      subtotal: subtotalNum,
      igv: igvNum,
      moneda,
      tipoDocumento: tipoDocumento || null,
      numeroDocumento: numeroDocumento || null,
      fechaEmision,
      diasCredito: Number(diasCredito),
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
          <Label>Concepto *</Label>
          <Input value={concepto} onChange={e => setConcepto(e.target.value)} required placeholder="Servicio de Community Management — Junio 2026" />
        </div>
        <div className="space-y-2">
          <Label>Subtotal ({moneda === 'PEN' ? 'S/' : '$'}) *</Label>
          <Input type="number" step="0.01" min="0.01" value={subtotal} onChange={e => setSubtotal(e.target.value)} required placeholder="0.00" />
        </div>
        <div className="space-y-2">
          <Label>IGV ({moneda === 'PEN' ? 'S/' : '$'})</Label>
          <Input type="number" step="0.01" min="0" value={igv} onChange={e => setIgv(e.target.value)} placeholder="0.00" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="text-lg font-black" style={{ color: '#10B981' }}>{fmt(totalCalc, moneda)}</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Moneda</Label>
          <Select value={moneda} onValueChange={(v) => setMoneda(v as 'PEN' | 'USD')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PEN">S/ Soles (PEN)</SelectItem>
              <SelectItem value="USD">$ Dólares (USD)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tipo documento <span className="text-gray-400 font-normal">(opcional)</span></Label>
          <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
            <SelectTrigger><SelectValue placeholder="Sin documento" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin documento</SelectItem>
              <SelectItem value="factura">Factura</SelectItem>
              <SelectItem value="boleta">Boleta</SelectItem>
              <SelectItem value="recibo">Recibo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {tipoDocumento && (
          <div className="space-y-2 sm:col-span-2">
            <Label>Número de documento</Label>
            <Input value={numeroDocumento} onChange={e => setNumeroDocumento(e.target.value)} placeholder="F001-00001" />
          </div>
        )}
        <div className="space-y-2">
          <Label>Fecha de emisión *</Label>
          <Input type="date" value={fechaEmision} onChange={e => setFechaEmision(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Días de crédito</Label>
          <Input type="number" min="0" value={diasCredito} onChange={e => setDiasCredito(e.target.value)} placeholder="0" />
        </div>
        {fechaVencimientoCalc && (
          <div className="sm:col-span-2">
            <p className="text-xs text-gray-500">
              📅 Vencimiento calculado: <strong>{fechaVencimientoCalc}</strong>
              {Number(diasCredito) === 0 && ' (pago al contado)'}
            </p>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving || !proyectoId} style={{ background: '#10B981' }} className="text-white">
          {saving ? 'Guardando...' : cobro ? 'Actualizar' : 'Crear Cobro'}
        </Button>
      </div>
    </form>
  )
}

// ── PagoForm ──────────────────────────────────────────────────────────────────

function PagoForm({ cobro, saldoPendiente, onSave, onCancel }: {
  cobro: Cobro
  saldoPendiente: number
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [metodo, setMetodo] = useState('')
  const [referencia, setReferencia] = useState('')
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)

  const montoNum = Number(monto) || 0
  const excede = montoNum > saldoPendiente + 0.001

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (excede) return
    setSaving(true)
    await onSave({
      cobroId: cobro.id,
      monto: montoNum,
      fecha,
      metodo,
      referencia: referencia || null,
      notas: notas || null,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm space-y-1">
        <p className="text-gray-600 truncate">{cobro.concepto}</p>
        <div className="flex justify-between">
          <span className="text-gray-500">Total cobro:</span>
          <span className="font-semibold">{fmt(cobro.total, cobro.moneda)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Saldo pendiente:</span>
          <span className="font-bold" style={{ color: '#10B981' }}>{fmt(saldoPendiente, cobro.moneda)}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Monto *</Label>
          <Input
            type="number" step="0.01" min="0.01"
            value={monto} onChange={e => setMonto(e.target.value)}
            required
            className={excede ? 'border-red-400 focus-visible:ring-red-400' : ''}
          />
          {excede && <p className="text-xs text-red-600">Supera el saldo pendiente ({fmt(saldoPendiente, cobro.moneda)})</p>}
        </div>
        <div className="space-y-2">
          <Label>Fecha *</Label>
          <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Método de pago *</Label>
          <Select value={metodo} onValueChange={setMetodo} required>
            <SelectTrigger><SelectValue placeholder="Seleccionar método" /></SelectTrigger>
            <SelectContent>
              {METODOS_PAGO.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Referencia <span className="text-gray-400 font-normal">(opcional)</span></Label>
          <Input value={referencia} onChange={e => setReferencia(e.target.value)} placeholder="Nº operación, código..." />
        </div>
        <div className="space-y-2">
          <Label>Notas <span className="text-gray-400 font-normal">(opcional)</span></Label>
          <Input value={notas} onChange={e => setNotas(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving || !metodo || excede || montoNum <= 0} style={{ background: '#10B981' }} className="text-white">
          {saving ? 'Registrando...' : 'Registrar Pago'}
        </Button>
      </div>
    </form>
  )
}

// ── BarraPago ─────────────────────────────────────────────────────────────────

function BarraPago({ total, montoPagado, moneda }: { total: number; montoPagado: number; moneda: 'PEN' | 'USD' }) {
  const pct = total > 0 ? Math.min(100, (montoPagado / total) * 100) : 0
  const saldo = Math.max(0, total - montoPagado)
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{fmt(montoPagado, moneda)} pagado</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 100 ? '#22C55E' : '#10B981' }} />
      </div>
      {saldo > 0 && <p className="text-xs text-gray-500">Saldo: <strong>{fmt(saldo, moneda)}</strong></p>}
    </div>
  )
}

// ── PanelPagos ────────────────────────────────────────────────────────────────

function PanelPagos({ cobro, pagos, loadingPagos, onAddPago, onDeletePago }: {
  cobro: Cobro
  pagos: Pago[]
  loadingPagos: boolean
  onAddPago: () => void
  onDeletePago: (pago: Pago) => void
}) {
  const montoPagado = pagos.reduce((s, p) => s + p.monto, 0)
  const saldo = Math.max(0, cobro.total - montoPagado)

  return (
    <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 space-y-4">
      <BarraPago total={cobro.total} montoPagado={montoPagado} moneda={cobro.moneda} />

      {loadingPagos ? (
        <div className="text-center py-4"><div className="animate-spin rounded-full h-5 w-5 border-b-2 mx-auto" style={{ borderColor: '#10B981' }} /></div>
      ) : pagos.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-2">Sin pagos registrados</p>
      ) : (
        <div className="space-y-1">
          {pagos.map(p => (
            <div key={p.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm border">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-xs w-24">{p.fecha}</span>
                <Badge variant="secondary" style={{ background: '#10B98115', color: '#059669', borderColor: 'transparent' }} className="text-xs">
                  {METODOS_PAGO.find(m => m.value === p.metodo)?.label ?? p.metodo}
                </Badge>
                {p.referencia && <span className="text-gray-400 text-xs">{p.referencia}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{fmt(p.monto, cobro.moneda)}</span>
                <Button
                  variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-500"
                  onClick={() => onDeletePago(p)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-gray-500">Saldo pendiente: <strong>{fmt(saldo, cobro.moneda)}</strong></span>
        {cobro.estado !== 'pagado' && cobro.estado !== 'anulado' && (
          <Button size="sm" style={{ background: '#10B981' }} className="text-white h-8 text-xs" onClick={onAddPago}>
            <Plus className="h-3.5 w-3.5 mr-1" />Registrar Pago
          </Button>
        )}
      </div>
    </div>
  )
}

// ── CobrosTab ─────────────────────────────────────────────────────────────────

interface CobrosTabProps {
  proyectos: Proyecto[]
  isActive: boolean
  initialFilters?: { proyectoId?: string }
}

export function CobrosTab({ proyectos, isActive, initialFilters }: CobrosTabProps) {
  const [cobros, setCobros] = useState<Cobro[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Expanded row state
  const [expandedCobroId, setExpandedCobroId] = useState<string | null>(null)
  const [pagosByCobro, setPagosByCobro] = useState<Record<string, Pago[]>>({})
  const [loadingPagosCobro, setLoadingPagosCobro] = useState<string | null>(null)

  // Filters
  const [proyectoFilter, setProyectoFilter] = useState(initialFilters?.proyectoId || 'all')
  const [estadoFilter, setEstadoFilter] = useState('all')

  // Cobro dialog
  const [cobroDialogOpen, setCobroDialogOpen] = useState(false)
  const [editingCobro, setEditingCobro] = useState<Cobro | null>(null)
  const [deleteCobroOpen, setDeleteCobroOpen] = useState(false)
  const [deletingCobro, setDeletingCobro] = useState<Cobro | null>(null)

  // Pago dialog
  const [pagoDialogOpen, setPagoDialogOpen] = useState(false)
  const [activeCobroForPago, setActiveCobroForPago] = useState<Cobro | null>(null)

  // Delete pago confirm
  const [deletePagoOpen, setDeletePagoOpen] = useState(false)
  const [deletingPago, setDeletingPago] = useState<{ pago: Pago; cobro: Cobro } | null>(null)

  // Apply cross-tab filters
  useEffect(() => {
    if (initialFilters?.proyectoId) setProyectoFilter(initialFilters.proyectoId)
  }, [initialFilters?.proyectoId])

  const fetchCobros = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (proyectoFilter !== 'all') params.set('proyectoId', proyectoFilter)
      const res = await fetch(`/api/cobros${params.toString() ? '?' + params.toString() : ''}`)
      const data = await res.json()
      setCobros(Array.isArray(data) ? data : [])
      setLoaded(true)
    } catch (err) {
      console.error('CobrosTab fetchCobros error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isActive && !loaded) fetchCobros()
  }, [isActive]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loaded) fetchCobros()
  }, [proyectoFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Expand row: load pagos lazily ──────────────────────────────────────────

  const toggleExpand = async (cobro: Cobro) => {
    if (expandedCobroId === cobro.id) { setExpandedCobroId(null); return }
    setExpandedCobroId(cobro.id)
    if (pagosByCobro[cobro.id]) return // already loaded
    setLoadingPagosCobro(cobro.id)
    try {
      const res = await fetch(`/api/pagos?cobroId=${cobro.id}`)
      const data = await res.json()
      setPagosByCobro(prev => ({ ...prev, [cobro.id]: Array.isArray(data) ? data : [] }))
    } catch (err) {
      console.error('CobrosTab toggleExpand pagos error:', err)
    } finally {
      setLoadingPagosCobro(null)
    }
  }

  // ── Cobro CRUD ─────────────────────────────────────────────────────────────

  const handleSaveCobro = async (data: Record<string, unknown>) => {
    try {
      const res = editingCobro
        ? await fetch(`/api/cobros/${editingCobro.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        : await fetch('/api/cobros', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const err = await res.json().catch(() => ({})); alert(`Error: ${err.error || 'Error desconocido'}`); return }
      setCobroDialogOpen(false); setEditingCobro(null); await fetchCobros()
    } catch { alert('Error de conexión') }
  }

  const handleDeleteCobro = async () => {
    if (!deletingCobro) return
    try {
      const res = await fetch(`/api/cobros/${deletingCobro.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (res.status === 409) alert(err.error || 'No se puede eliminar: tiene pagos registrados.')
        else alert(`Error: ${err.error || 'Error desconocido'}`)
        setDeleteCobroOpen(false); setDeletingCobro(null); return
      }
      setDeleteCobroOpen(false); setDeletingCobro(null); await fetchCobros()
    } catch { alert('Error de conexión') }
  }

  // ── Pago creation ──────────────────────────────────────────────────────────

  const handleSavePago = async (data: Record<string, unknown>) => {
    if (!activeCobroForPago) return
    try {
      const res = await fetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        // Surface the saldo detail if present
        const msg = err.detail
          ? `${err.error}\nSaldo pendiente: ${fmt(err.detail.saldoPendiente, activeCobroForPago.moneda)}`
          : err.error || 'Error desconocido'
        alert(`Error: ${msg}`)
        return
      }

      // Backend devuelve { pago, cobroEstado: string }
      // Actualización local optimista — evita refetch completo
      const { pago, cobroEstado } = await res.json()
      const cobroId = activeCobroForPago.id

      setPagosByCobro(prev => ({
        ...prev,
        [cobroId]: [...(prev[cobroId] ?? []), pago],
      }))
      setCobros(prev => prev.map(c => c.id === cobroId ? { ...c, estado: cobroEstado } : c))

      setPagoDialogOpen(false)
      setActiveCobroForPago(null)
    } catch { alert('Error de conexión') }
  }

  // ── Pago deletion ──────────────────────────────────────────────────────────

  const handleDeletePago = async () => {
    if (!deletingPago) return
    const { pago, cobro } = deletingPago
    try {
      const res = await fetch(`/api/pagos/${pago.id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json().catch(() => ({})); alert(`Error: ${err.error || 'Error desconocido'}`); return }

      // Remove pago from local state
      setPagosByCobro(prev => ({
        ...prev,
        [cobro.id]: (prev[cobro.id] ?? []).filter(p => p.id !== pago.id),
      }))

      // Refetch the specific cobro to get updated estado
      const cobroRes = await fetch(`/api/cobros/${cobro.id}`)
      if (cobroRes.ok) {
        const updatedCobro = await cobroRes.json()
        setCobros(prev => prev.map(c => c.id === cobro.id ? updatedCobro : c))
      }

      setDeletePagoOpen(false)
      setDeletingPago(null)
    } catch { alert('Error de conexión') }
  }

  // ── Filters + stats ────────────────────────────────────────────────────────

  const filtered = cobros.filter(c => estadoFilter === 'all' || c.estado === estadoFilter)

  const today = new Date().toISOString().split('T')[0]

  const totalCobrado = cobros
    .filter(c => c.moneda === 'PEN' && (c.estado === 'pagado' || c.estado === 'parcial'))
    .reduce((s, c) => {
      const montoPagado = (pagosByCobro[c.id] ?? []).reduce((a, p) => a + p.monto, 0)
      return s + montoPagado
    }, 0)

  const stats = {
    total: cobros.length,
    pendiente: cobros.filter(c => c.estado === 'pendiente').length,
    vencido: cobros.filter(c => c.estado === 'vencido').length,
    pagado: cobros.filter(c => c.estado === 'pagado').length,
  }

  const getNombreProyecto = (proyectoId: string) => {
    const p = proyectos.find(p => p.id === proyectoId)
    return p?.nombre ?? proyectoId
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-black" style={{ color: '#10B981' }}>{stats.total}</p>
          <p className="text-xs text-gray-500">Total cobros</p>
        </div>
        <div
          className={`bg-white rounded-xl border p-4 text-center cursor-pointer hover:shadow-md ${estadoFilter === 'pendiente' ? 'ring-2 ring-yellow-400' : ''}`}
          onClick={() => setEstadoFilter(estadoFilter === 'pendiente' ? 'all' : 'pendiente')}
        >
          <p className="text-2xl font-black text-yellow-600">{stats.pendiente}</p>
          <p className="text-xs text-gray-500">Pendientes</p>
        </div>
        <div
          className={`bg-white rounded-xl border p-4 text-center cursor-pointer hover:shadow-md ${estadoFilter === 'vencido' ? 'ring-2 ring-red-400' : ''}`}
          onClick={() => setEstadoFilter(estadoFilter === 'vencido' ? 'all' : 'vencido')}
        >
          <p className="text-2xl font-black text-red-600">{stats.vencido}</p>
          <p className="text-xs text-gray-500">Vencidos</p>
        </div>
        <div
          className={`bg-white rounded-xl border p-4 text-center cursor-pointer hover:shadow-md ${estadoFilter === 'pagado' ? 'ring-2 ring-green-400' : ''}`}
          onClick={() => setEstadoFilter(estadoFilter === 'pagado' ? 'all' : 'pagado')}
        >
          <p className="text-2xl font-black text-green-600">{stats.pagado}</p>
          <p className="text-xs text-gray-500">Pagados</p>
        </div>
      </div>

      {/* Filters + Create */}
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
              style={{ background: '#10B98120', color: '#059669', borderColor: 'transparent' }}
              onClick={() => setProyectoFilter('all')}
            >
              {getNombreProyecto(proyectoFilter)} ✕
            </Badge>
          )}
        </div>

        <Button onClick={() => { setEditingCobro(null); setCobroDialogOpen(true) }} style={{ background: '#10B981' }} className="text-white flex-shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />Crear Cobro
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto" style={{ borderColor: '#10B981' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No hay cobros</h3>
          <p className="text-sm text-gray-500 mt-1">Crea el primer cobro de un proyecto.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead className="hidden md:table-cell">Proyecto</TableHead>
                <TableHead className="hidden lg:table-cell">Documento</TableHead>
                <TableHead className="hidden sm:table-cell">Emisión</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="hidden md:table-cell">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(cobro => {
                const isExpanded = expandedCobroId === cobro.id
                // Vencido visual: show warning icon even if estado is 'parcial'
                const estaVencidoVisual = cobro.fechaVencimiento < today &&
                  cobro.estado !== 'pagado' && cobro.estado !== 'anulado'
                const pagos = pagosByCobro[cobro.id] ?? []

                return (
                  <TableBody key={cobro.id} className="border-0">
                    <TableRow
                      className={`cursor-pointer hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-emerald-50 hover:bg-emerald-50' : ''}`}
                      onClick={() => toggleExpand(cobro)}
                    >
                      <TableCell className="text-gray-400">
                        {isExpanded
                          ? <ChevronDown className="h-4 w-4" />
                          : <ChevronRight className="h-4 w-4" />}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-gray-900 text-sm">{cobro.concepto}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-600">
                        {getNombreProyecto(cobro.proyectoId)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-gray-600">
                        {cobro.tipoDocumento
                          ? `${cobro.tipoDocumento.charAt(0).toUpperCase() + cobro.tipoDocumento.slice(1)} ${cobro.numeroDocumento ?? ''}`
                          : <span className="text-gray-400">—</span>}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-gray-600">{cobro.fechaEmision}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {estaVencidoVisual && (
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" title="Vencido" />
                          )}
                          <span className={`text-sm ${estaVencidoVisual ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                            {cobro.fechaVencimiento}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-semibold text-sm" style={{ color: '#10B981' }}>
                        {fmt(cobro.total, cobro.moneda)}
                      </TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <CobroEstadoBadge estado={cobro.estado} />
                      </TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingCobro(cobro); setCobroDialogOpen(true) }}>
                              <Pencil className="h-4 w-4 mr-2" />Editar
                            </DropdownMenuItem>
                            {cobro.estado !== 'pagado' && cobro.estado !== 'anulado' && (
                              <DropdownMenuItem onClick={() => { setActiveCobroForPago(cobro); setPagoDialogOpen(true) }}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />Registrar Pago
                              </DropdownMenuItem>
                            )}
                            {cobro.estado !== 'anulado' && (
                              <DropdownMenuItem onClick={async () => {
                                if (!confirm('¿Anular este cobro? Esta acción marca el cobro como anulado.')) return
                                const res = await fetch(`/api/cobros/${cobro.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: 'anulado' }) })
                                if (!res.ok) { const err = await res.json().catch(() => ({})); alert(`Error: ${err.error}`); return }
                                await fetchCobros()
                              }} className="text-gray-600">
                                🚫 Anular cobro
                              </DropdownMenuItem>
                            )}
                            <Separator className="my-1" />
                            <DropdownMenuItem onClick={() => { setDeletingCobro(cobro); setDeleteCobroOpen(true) }} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>

                    {/* Expanded panel de pagos */}
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={9} className="p-0">
                          <PanelPagos
                            cobro={cobro}
                            pagos={pagos}
                            loadingPagos={loadingPagosCobro === cobro.id}
                            onAddPago={() => { setActiveCobroForPago(cobro); setPagoDialogOpen(true) }}
                            onDeletePago={(pago) => { setDeletingPago({ pago, cobro }); setDeletePagoOpen(true) }}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Cobro Dialog */}
      <Dialog open={cobroDialogOpen} onOpenChange={(open) => { setCobroDialogOpen(open); if (!open) setEditingCobro(null) }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCobro ? 'Editar Cobro' : 'Nuevo Cobro'}</DialogTitle></DialogHeader>
          <CobroForm cobro={editingCobro} proyectos={proyectos} onSave={handleSaveCobro} onCancel={() => { setCobroDialogOpen(false); setEditingCobro(null) }} />
        </DialogContent>
      </Dialog>

      {/* Pago Dialog */}
      {activeCobroForPago && (
        <Dialog open={pagoDialogOpen} onOpenChange={(open) => { setPagoDialogOpen(open); if (!open) setActiveCobroForPago(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Registrar Pago</DialogTitle></DialogHeader>
            <PagoForm
              cobro={activeCobroForPago}
              saldoPendiente={Math.max(0, activeCobroForPago.total - (pagosByCobro[activeCobroForPago.id] ?? []).reduce((s, p) => s + p.monto, 0))}
              onSave={handleSavePago}
              onCancel={() => { setPagoDialogOpen(false); setActiveCobroForPago(null) }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Cobro confirm */}
      <AlertDialog open={deleteCobroOpen} onOpenChange={setDeleteCobroOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cobro?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro de eliminar <strong>{deletingCobro?.concepto}</strong>? Si tiene pagos registrados, la operación fallará. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCobro} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Pago confirm */}
      <AlertDialog open={deletePagoOpen} onOpenChange={setDeletePagoOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Pago de <strong>{deletingPago && fmt(deletingPago.pago.monto, deletingPago.cobro.moneda)}</strong> del {deletingPago?.pago.fecha}. El estado del cobro se recalculará automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePago} className="bg-red-600 hover:bg-red-700">Eliminar pago</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
