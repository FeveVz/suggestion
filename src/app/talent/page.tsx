'use client'

import { useState, useEffect } from 'react'
import { LOGO_NEGRO_BASE64 } from '@/lib/logo-negro'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Clock,
  CheckCircle,
  ArrowRight,
  Calendar,
  LogOut,
  AlertCircle,
  ListTodo,
} from 'lucide-react'

interface TalentInfo {
  id: string
  name: string
  email: string
  role: string
}

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  deadline: string | null
  talentId: string | null
  serviceId: string
  clientId: string
  additionalInfo: string
  service?: { id: string; name: string; icon: string }
  client?: { id: string; name: string }
}

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

// Talent Login Component
function TalentLoginForm({ onLogin }: { onLogin: (talent: TalentInfo) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/talent-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        const data = await res.json()
        onLogin(data.talent)
      } else {
        const data = await res.json()
        setError(data.error || 'Error al iniciar sesión')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex justify-center mb-8">
            <img src={LOGO_NEGRO_BASE64} alt="SUGGESTION" className="h-10 w-auto" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Portal de Talentos</h1>
            <p className="text-sm text-gray-500 mt-1">Inicia sesión para ver tus tareas asignadas</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Tu contraseña" required className="h-11" />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full h-11 text-white font-semibold" style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}>
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">SUGGESTION — Portal de Talentos</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Talent Dashboard Component
function TalentDashboard({ talent }: { talent: TalentInfo }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchTasks = async () => {
    try {
      // ?mine=true ensures we only get THIS talent's tasks, even if admin cookie is also present
      const res = await fetch('/api/tasks?mine=true')
      if (res.ok) {
        const data = await res.json()
        setTasks(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [])

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) await fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleLogout = async () => {
    document.cookie = 'suggestion_talent_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    window.location.reload()
  }

  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    return true
  })

  const taskStats = {
    pendiente: tasks.filter(t => t.status === 'pendiente').length,
    en_progreso: tasks.filter(t => t.status === 'en_progreso').length,
    completada: tasks.filter(t => t.status === 'completada').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#8B5CF6' }}></div>
          <p className="mt-4 text-gray-500">Cargando tareas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img src={LOGO_NEGRO_BASE64} alt="SUGGESTION" className="h-8 w-auto" />
              <Separator orientation="vertical" className="h-6" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{talent.name}</p>
                <p className="text-xs text-gray-500">{talent.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge style={{ background: '#8B5CF620', color: '#8B5CF6', borderColor: 'transparent' }}>{tasks.length} tareas</Badge>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-600"><LogOut className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === 'pendiente' ? 'ring-2 ring-yellow-400' : ''}`} onClick={() => setStatusFilter(statusFilter === 'pendiente' ? 'all' : 'pendiente')}>
            <CardContent className="p-4 text-center"><p className="text-2xl font-black text-yellow-600">{taskStats.pendiente}</p><p className="text-xs text-gray-500">Pendientes</p></CardContent>
          </Card>
          <Card className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === 'en_progreso' ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setStatusFilter(statusFilter === 'en_progreso' ? 'all' : 'en_progreso')}>
            <CardContent className="p-4 text-center"><p className="text-2xl font-black text-blue-600">{taskStats.en_progreso}</p><p className="text-xs text-gray-500">En Progreso</p></CardContent>
          </Card>
          <Card className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === 'completada' ? 'ring-2 ring-green-400' : ''}`} onClick={() => setStatusFilter(statusFilter === 'completada' ? 'all' : 'completada')}>
            <CardContent className="p-4 text-center"><p className="text-2xl font-black text-green-600">{taskStats.completada}</p><p className="text-xs text-gray-500">Completadas</p></CardContent>
          </Card>
        </div>

        {/* Tasks */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border">
            <ListTodo className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No hay tareas</h3>
            <p className="text-sm text-gray-500 mt-1">{statusFilter !== 'all' ? 'No hay tareas con este filtro.' : 'Aún no tienes tareas asignadas.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => {
              const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completada'
              const isClose = task.deadline && !isOverdue && task.status !== 'completada' && (new Date(task.deadline).getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000
              return (
                <Card key={task.id} className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-300 bg-red-50' : isClose ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{task.title}</h3>
                          <StatusBadge status={task.status} />
                          <PriorityBadge priority={task.priority} />
                        </div>
                        {task.description && <p className="text-xs text-gray-500 mb-2">{task.description}</p>}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span>👤 {task.client?.name || '—'}</span>
                          <span>{task.service?.icon} {task.service?.name || '—'}</span>
                          {task.deadline && (
                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-semibold' : isClose ? 'text-yellow-600 font-semibold' : ''}`}>
                              <Calendar className="h-3 w-3" />
                              {task.deadline}
                              {isOverdue && <AlertCircle className="h-3 w-3" />}
                            </span>
                          )}
                        </div>
                        {task.additionalInfo && <p className="text-xs text-gray-400 mt-1">ℹ️ {task.additionalInfo}</p>}
                      </div>
                      <div className="flex-shrink-0">
                        <Select value={task.status} onValueChange={(val) => handleStatusChange(task.id, val)}>
                          <SelectTrigger className="w-[140px] h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">⏳ Pendiente</SelectItem>
                            <SelectItem value="en_progreso">🔄 En progreso</SelectItem>
                            <SelectItem value="completada">✅ Completada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

// Main Talent Page
export default function TalentPage() {
  const [talent, setTalent] = useState<TalentInfo | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if there's a talent session cookie by trying to fetch tasks
        const res = await fetch('/api/tasks')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length >= 0) {
            // We have a valid session - but we need the talent info
            // Check the cookie manually
            const cookies = document.cookie.split(';')
            const talentCookie = cookies.find(c => c.trim().startsWith('suggestion_talent_session='))
            if (talentCookie) {
              // We have a talent session - for now we don't have the talent info cached
              // We need to store it in localStorage or get it from the cookie
              const storedTalent = localStorage.getItem('suggestion_talent')
              if (storedTalent) {
                setTalent(JSON.parse(storedTalent))
              }
            }
          }
        }
      } catch {
        // Not authenticated
      }
      setChecking(false)
    }
    checkAuth()
  }, [])

  const handleLogin = (talentInfo: TalentInfo) => {
    localStorage.setItem('suggestion_talent', JSON.stringify(talentInfo))
    setTalent(talentInfo)
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#8B5CF6' }}></div>
          <p className="mt-4 text-gray-500">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  if (!talent) {
    return <TalentLoginForm onLogin={handleLogin} />
  }

  return <TalentDashboard talent={talent} />
}
