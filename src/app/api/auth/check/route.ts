import { NextResponse } from 'next/server'
import { isValidSession } from '@/lib/auth'

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const sessionCookie = cookieHeader
    .split(';')
    .find(c => c.trim().startsWith('suggestion_session='))
    ?.split('=')[1]

  if (isValidSession(sessionCookie)) {
    return NextResponse.json({ authenticated: true })
  }
  return NextResponse.json({ authenticated: false }, { status: 401 })
}
