/**
 * Shared helpers for API route handlers.
 *
 * getAdminSession  — validates the admin cookie and returns a typed result
 *                    so route handlers can early-return without repeating auth logic.
 *
 * computeCobroEstado — pure function that derives the estado string for a Cobro
 *                      from its financial and date state.
 */

import { NextRequest, NextResponse } from 'next/server'
import { isValidSession, SESSION_COOKIE } from './auth'

// ─── Auth ────────────────────────────────────────────────────────────────────

type AuthOk    = { ok: true }
type AuthFail  = { ok: false; response: NextResponse }
export type AuthResult = AuthOk | AuthFail

/**
 * Extracts the admin session cookie from a NextRequest and validates it.
 *
 * Usage:
 *   const auth = getAdminSession(request)
 *   if (!auth.ok) return auth.response
 */
export function getAdminSession(request: NextRequest): AuthResult {
  const cookieHeader = request.headers.get('cookie') || ''
  const token = cookieHeader
    .split(';')
    .find(c => c.trim().startsWith(`${SESSION_COOKIE}=`))
    ?.split('=')[1]

  if (!isValidSession(token)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
    }
  }

  return { ok: true }
}

// ─── Cobro estado ────────────────────────────────────────────────────────────

export type CobroEstado = 'pendiente' | 'parcial' | 'pagado' | 'vencido' | 'anulado'

/**
 * Derives the estado of a Cobro based on its financial state and due date.
 *
 * Rules (in priority order):
 *   1. pagado  — montoPagado >= cobroTotal
 *   2. parcial — montoPagado > 0  (even if fechaVencimiento has passed)
 *   3. vencido — montoPagado == 0 AND fechaVencimiento < today
 *   4. pendiente — everything else
 *
 * 'vencido' solo aplica si no hay ningún pago.
 * Si hay pago parcial, mantiene 'parcial' aunque la fecha haya pasado.
 * El frontend muestra la condición 'vencido visual' con:
 *   estaVencido = fechaVencimiento < hoy && estado !== 'pagado' && estado !== 'anulado'
 *
 * NOTE: 'anulado' is set explicitly via PUT /api/cobros/[id] and is never
 * returned by this function — it must be preserved by the caller.
 *
 * @param cobroTotal      - Cobro.total (subtotal + igv, generated column)
 * @param montoPagado     - SUM of all Pago.monto for this Cobro (0 if no pagos)
 * @param fechaVencimiento - Cobro.fechaVencimiento (ISO date string, e.g. "2026-05-01")
 * @returns CobroEstado string
 */
export function computeCobroEstado(
  cobroTotal: number,
  montoPagado: number,
  fechaVencimiento: string,
): CobroEstado {
  if (montoPagado >= cobroTotal) return 'pagado'
  if (montoPagado > 0)           return 'parcial'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const vencimiento = new Date(fechaVencimiento + 'T00:00:00')

  if (vencimiento < today) return 'vencido'

  return 'pendiente'
}
