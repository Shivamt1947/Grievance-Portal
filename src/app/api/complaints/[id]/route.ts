import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: params.id }
    })

    if (!complaint) return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })

    // Check SLA Breach here dynamically just like the main route
    if (new Date(complaint.slaDeadline) < new Date() && !['Resolved', 'Closed', 'Escalated'].includes(complaint.status)) {
      const timeline = JSON.parse(complaint.timeline)
      timeline.push({
        status: 'Escalated',
        note: 'SLA breached. Automatically escalated to Admin.',
        date: new Date().toISOString()
      })
      const updated = await prisma.complaint.update({
        where: { id: params.id },
        data: {
          status: 'Escalated',
          priority: 'High',
          assignedTo: 'admin@tsec.edu',
          timeline: JSON.stringify(timeline)
        }
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json(complaint)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch complaint' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status, note, feedback, rating } = body

    const existing = await prisma.complaint.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updateData: any = {}

    if (status) {
      updateData.status = status
      const timeline = JSON.parse(existing.timeline)
      timeline.push({
        status,
        note: note || `Status updated to ${status}`,
        date: new Date().toISOString()
      })
      updateData.timeline = JSON.stringify(timeline)
    }

    if (feedback !== undefined && rating !== undefined) {
      updateData.feedback = JSON.stringify({ rating, comment: feedback })
      updateData.status = 'Closed' // Getting feedback closes the complaint
      
      const timeline = JSON.parse(existing.timeline || '[]')
      timeline.push({
        status: 'Closed',
        note: `Feedback received: ${rating} Stars. Complaint Closed.`,
        date: new Date().toISOString()
      })
      updateData.timeline = JSON.stringify(timeline)
    }

    const complaint = await prisma.complaint.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(complaint)
  } catch (error) {
    console.error('Update err:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const complaint = await prisma.complaint.findUnique({ where: { id: params.id } })
    if (!complaint) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (complaint.status !== 'Closed') {
      return NextResponse.json({ error: 'Only closed complaints can be deleted' }, { status: 400 })
    }

    await prisma.complaint.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
