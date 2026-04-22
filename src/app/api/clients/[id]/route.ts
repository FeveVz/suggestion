import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isValidSession } from '@/lib/auth'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await db.client.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            service: {
              include: {
                plans: {
                  orderBy: { order: 'asc' }
                }
              }
            },
            selectedPlan: true
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch {
    return NextResponse.json({ error: 'Error fetching client' }, { status: 500 })
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
    const { name, activity, startDate, location, phone, email, serviceIds,
            // New fields for acceptance flow
            status, anticipoPagado, descuento, fechaAceptacion,
            // Plan selections: array of { serviceId, selectedPlanId }
            planSelections } = body

    // If this is an acceptance update (has planSelections or status change)
    if (status === 'aceptado' && planSelections) {
      // Update client status fields
      const updatedClient = await db.client.update({
        where: { id },
        data: {
          status: 'aceptado',
          anticipoPagado: anticipoPagado ?? false,
          descuento: descuento ?? 0,
          fechaAceptacion: fechaAceptacion || new Date().toISOString().split('T')[0],
          startDate: startDate || undefined,
        },
        include: {
          services: {
            include: {
              service: {
                include: {
                  plans: {
                    orderBy: { order: 'asc' }
                  }
                }
              },
              selectedPlan: true
            }
          }
        }
      })

      // Update plan selections for each service
      for (const selection of planSelections as Array<{ serviceId: string; selectedPlanId: string | null }>) {
        await db.clientService.updateMany({
          where: {
            clientId: id,
            serviceId: selection.serviceId,
          },
          data: {
            selectedPlanId: selection.selectedPlanId,
          }
        })
      }

      // Refetch with updated data
      const refreshedClient = await db.client.findUnique({
        where: { id },
        include: {
          services: {
            include: {
              service: {
                include: {
                  plans: {
                    orderBy: { order: 'asc' }
                  }
                }
              },
              selectedPlan: true
            }
          }
        }
      })

      return NextResponse.json(refreshedClient)
    }

    // Standard client update (edit form)
    // Delete existing service connections and recreate
    await db.clientService.deleteMany({
      where: { clientId: id }
    })

    const client = await db.client.update({
      where: { id },
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
            service: {
              include: {
                plans: {
                  orderBy: { order: 'asc' }
                }
              }
            },
            selectedPlan: true
          }
        }
      }
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json({ error: 'Error updating client' }, { status: 500 })
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

    await db.clientService.deleteMany({
      where: { clientId: id }
    })

    await db.client.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Error deleting client' }, { status: 500 })
  }
}
