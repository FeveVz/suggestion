import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isValidSession, hashPassword } from '@/lib/auth'
import { normalizeTalent } from '@/lib/normalize'

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('suggestion_session='))
      ?.split('=')[1]

    if (!isValidSession(sessionCookie)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: talents, error } = await supabase
      .from('Talent')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching talents:', error)
      return NextResponse.json({ error: 'Error fetching talents' }, { status: 500 })
    }

    const result = (talents || []).map((t: Record<string, unknown>) => normalizeTalent(t))
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching talents:', error)
    return NextResponse.json({ error: 'Error fetching talents' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('suggestion_session='))
      ?.split('=')[1]

    if (!isValidSession(sessionCookie)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, role, phone, active } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nombre, email y contraseña son requeridos' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('Talent')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Ya existe un talento con ese email' }, { status: 409 })
    }

    const { data: lastTalent } = await supabase
      .from('Talent')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)

    let nextNum = 1
    if (lastTalent && lastTalent.length > 0) {
      const match = lastTalent[0].id.match(/tal(\d+)/)
      if (match) nextNum = parseInt(match[1]) + 1
    }
    const talentId = `tal${String(nextNum).padStart(2, '0')}`

    const hashedPassword = await hashPassword(password)

    const { data: talent, error: insertError } = await supabase
      .from('Talent')
      .insert({
        id: talentId,
        name,
        email,
        password: hashedPassword,
        role: role || '',
        phone: phone || '',
        active: active !== undefined ? active : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError || !talent) {
      console.error('Error creating talent:', insertError)
      return NextResponse.json({ error: 'Error creating talent', details: insertError?.message }, { status: 500 })
    }

    return NextResponse.json(normalizeTalent(talent as Record<string, unknown>), { status: 201 })
  } catch (error) {
    console.error('Error creating talent:', error)
    return NextResponse.json({ error: 'Error creating talent' }, { status: 500 })
  }
}
