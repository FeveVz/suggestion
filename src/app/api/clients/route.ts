import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isValidSession } from '@/lib/auth'

export async function GET() {
  try {
    const clients = await db.client.findMany({
      include: {
        services: {
          include: {
            service: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(clients)
  } catch {
    return NextResponse.json({ error: 'Error fetching clients' }, { status: 500 })
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
    const { name, activity, startDate, location, phone, email, serviceIds } = body

    if (!name || !activity) {
      return NextResponse.json({ error: 'Nombre y actividad son requeridos' }, { status: 400 })
    }

    const client = await db.client.create({
      data: {
        name,
        activity,
        startDate: startDate || '',
        location: location || '',
        phone: phone || '',
        email: email || '',
        services: serviceIds && serviceIds.length > 0 ? {
          create: serviceIds.map((serviceId: string) => ({
            serviceId
          }))
        } : undefined
      },
      include: {
        services: {
          include: {
            service: true
          }
        }
      }
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Error creating client' }, { status: 500 })
  }
}
