import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isValidSession, hashPassword } from '@/lib/auth'
import { normalizeTalent } from '@/lib/normalize'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: talent, error } = await supabase
      .from('Talent')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !talent) {
      return NextResponse.json({ error: 'Talento no encontrado' }, { status: 404 })
    }

    return NextResponse.json(normalizeTalent(talent as Record<string, unknown>))
  } catch (error) {
    console.error('Error fetching talent:', error)
    return NextResponse.json({ error: 'Error fetching talent' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('suggestion_session='))
      ?.split('=')[1]

    if (!isValidSession(sessionCookie)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, email, password, role, phone, active } = body

    const { data: existing } = await supabase
      .from('Talent')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Talento no encontrado' }, { status: 404 })
    }

    // Check email uniqueness if changing
    if (email && email !== existing.email) {
      const { data: emailCheck } = await supabase
        .from('Talent')
        .select('id')
        .eq('email', email)
        .maybeSingle()
      if (emailCheck) {
        return NextResponse.json({ error: 'Ya existe un talento con ese email' }, { status: 409 })
      }
    }

    const updateData: Record<string, unknown> = {
      name: name || existing.name,
      email: email || existing.email,
      role: role !== undefined ? role : existing.role,
      phone: phone !== undefined ? phone : existing.phone,
      active: active !== undefined ? active : existing.active,
      updatedAt: new Date().toISOString(),
    }

    // Only update password if a new one is provided
    if (password) {
      updateData.password = await hashPassword(password)
    }

    const { data: talent, error: updateError } = await supabase
      .from('Talent')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError || !talent) {
      console.error('Error updating talent:', updateError)
      return NextResponse.json({ error: 'Error updating talent' }, { status: 500 })
    }

    return NextResponse.json(normalizeTalent(talent as Record<string, unknown>))
  } catch (error) {
    console.error('Error updating talent:', error)
    return NextResponse.json({ error: 'Error updating talent' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('suggestion_session='))
      ?.split('=')[1]

    if (!isValidSession(sessionCookie)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Unassign tasks from this talent
    await supabase
      .from('Task')
      .update({ talentId: null })
      .eq('talentId', id)

    const { error } = await supabase.from('Talent').delete().eq('id', id)

    if (error) {
      console.error('Error deleting talent:', error)
      return NextResponse.json({ error: 'Error deleting talent' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting talent:', error)
    return NextResponse.json({ error: 'Error deleting talent' }, { status: 500 })
  }
}
