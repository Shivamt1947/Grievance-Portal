import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

// Apply SLA logic when fetching complaints
async function applySlaLogic() {
  const now = new Date()
  
  // Find complaints that breached SLA
  const breached = await prisma.complaint.findMany({
    where: {
      slaDeadline: { lt: now },
      status: { notIn: ['Resolved', 'Closed', 'Escalated'] }
    }
  })

  // Escalate them
  for (const complaint of breached) {
    const timeline = JSON.parse(complaint.timeline)
    timeline.push({
      status: 'Escalated',
      note: 'SLA breached. Automatically escalated to Admin.',
      date: new Date().toISOString()
    })

    await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        status: 'Escalated',
        priority: 'High',
        assignedTo: 'admin@tsec.edu',
        timeline: JSON.stringify(timeline)
      }
    })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const assignedTo = searchParams.get('assignedTo')
    
    // Auto-apply SLA
    await applySlaLogic()

    const whereClause: any = {}
    if (userId) whereClause.userId = userId
    if (assignedTo) whereClause.assignedTo = assignedTo

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(complaints)
  } catch (error) {
    console.error('Failed to fetch complaints:', error)
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, category, priority, mode, userId, attachmentBase64 } = body

    let attachmentUrl = null
    if (attachmentBase64) {
      try {
        const base64Data = attachmentBase64.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')
        const match = attachmentBase64.match(/^data:image\/(\w+);base64,/)
        const extension = match ? match[1] : 'png'
        
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadsDir, { recursive: true })
        
        const filename = `grievance-${Date.now()}.${extension}`
        const filepath = path.join(uploadsDir, filename)
        await writeFile(filepath, buffer)
        
        attachmentUrl = `/uploads/${filename}`
      } catch(e) {
        console.error('Image upload failed', e)
      }
    }

    const timeline = [{
      status: 'Submitted',
      note: 'Complaint submitted by student.',
      date: new Date().toISOString()
    }]

    // 24 hours SLA
    const slaDeadline = new Date()
    slaDeadline.setHours(slaDeadline.getHours() + 24)

    // All new complaints are initially assigned to the teacher.
    // If not resolved in 24 hours, the SLA logic automatically escalates them to the admin.
    const assignedTo = 'teacher@tsec.edu'

    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        category,
        priority: priority || 'Medium',
        mode: mode || 'Public',
        userId,
        assignedTo,
        slaDeadline,
        timeline: JSON.stringify(timeline),
        attachment: attachmentUrl
      }
    })

    return NextResponse.json(complaint, { status: 201 })
  } catch (error) {
    console.error('Create complaint error:', error)
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 })
  }
}
