import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyPassword, createTalentSessionToken, TALENT_SESSION_COOKIE } from '@/lib/auth'
import { normalizeTalent } from '@/lib/normalize'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
    }

    const { data: talent, error } = await supabase
      .from('Talent')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !talent) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    if (!talent.active) {
      return NextResponse.json({ error: 'Tu cuenta está desactivada. Contacta al administrador.' }, { status: 403 })
    }

    const isValid = await verifyPassword(password, talent.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    const token = createTalentSessionToken(talent.id)

    const response = NextResponse.json({
      success: true,
      talent: normalizeTalent(talent as Record<string, unknown>),
    })

    response.cookies.set(TALENT_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error in talent login:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
