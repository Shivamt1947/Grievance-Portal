'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle, Clock, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

function fetchComplaints(userId: string) {
  return fetch(`/api/complaints?userId=${userId}`).then(res => res.json())
}

function deleteComplaint(id: string) {
  return fetch(`/api/complaints/${id}`, { method: 'DELETE' }).then(res => res.json())
}

export function StudentDashboard() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Resolved' | 'Escalated'>('All')

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['complaints', user?.email],
    queryFn: () => fetchComplaints(user!.email),
    enabled: !!user,
    refetchInterval: 5000,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteComplaint,
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Complaint deleted')
        queryClient.invalidateQueries({ queryKey: ['complaints'] })
      }
    },
    onError: () => toast.error('Failed to delete complaint')
  })

  if (isLoading) return <div className="text-slate-400">Loading complaints...</div>

  if (!isLoading && complaints && !Array.isArray(complaints)) {
    return (
      <div className="p-6 bg-red-950/30 border border-red-500/20 rounded-xl">
        <h3 className="text-red-400 font-semibold mb-2">Database Connection Error</h3>
        <p className="text-slate-300 text-sm">Failed to connect to the database. The Vercel Serverless environment requires a cloud database instead of local SQLite for full functionality.</p>
      </div>
    )
  }

  const validComplaints = Array.isArray(complaints) ? complaints : []

  const total = validComplaints.length || 0
  const pending = validComplaints.filter((c: any) => c.status === 'Submitted' || c.status === 'In Progress' || c.status === 'Under Review' || c.status === 'Action Taken').length || 0
  const escalated = validComplaints.filter((c: any) => c.status === 'Escalated').length || 0
  const resolved = validComplaints.filter((c: any) => c.status === 'Resolved' || c.status === 'Closed').length || 0

  const filteredComplaints = validComplaints.filter((c: any) => {
    if (filter === 'Pending') return c.status === 'Submitted' || c.status === 'In Progress' || c.status === 'Under Review' || c.status === 'Action Taken'
    if (filter === 'Escalated') return c.status === 'Escalated'
    if (filter === 'Resolved') return c.status === 'Resolved' || c.status === 'Closed'
    return true
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card 
          onClick={() => setFilter('All')}
          className={`cursor-pointer bg-gradient-to-br from-slate-800 to-slate-950 border border-t-white/10 border-l-white/10 border-b-black/80 border-r-black/80 shadow-[8px_8px_16px_#000000,-4px_-4px_12px_rgba(255,255,255,0.03)] rounded-2xl hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[12px_12px_24px_rgba(0,0,0,0.8),-4px_-4px_16px_rgba(59,130,246,0.1)] transition-all duration-300 ${filter === 'All' ? 'ring-2 ring-blue-500' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Grievances</CardTitle>
            <FileText className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">{total}</div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setFilter('Pending')}
          className={`cursor-pointer bg-gradient-to-br from-slate-800 to-slate-950 border border-t-white/10 border-l-white/10 border-b-black/80 border-r-black/80 shadow-[8px_8px_16px_#000000,-4px_-4px_12px_rgba(255,255,255,0.03)] rounded-2xl hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-[12px_12px_24px_rgba(0,0,0,0.8),-4px_-4px_16px_rgba(245,158,11,0.1)] transition-all duration-300 ${filter === 'Pending' ? 'ring-2 ring-amber-500' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">{pending}</div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setFilter('Resolved')}
          className={`cursor-pointer bg-gradient-to-br from-slate-800 to-slate-950 border border-t-white/10 border-l-white/10 border-b-black/80 border-r-black/80 shadow-[8px_8px_16px_#000000,-4px_-4px_12px_rgba(255,255,255,0.03)] rounded-2xl hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-[12px_12px_24px_rgba(0,0,0,0.8),-4px_-4px_16px_rgba(16,185,129,0.1)] transition-all duration-300 ${filter === 'Resolved' ? 'ring-2 ring-emerald-500' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">{resolved}</div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setFilter('Escalated')}
          className={`cursor-pointer bg-gradient-to-br from-slate-800 to-slate-950 border border-t-white/10 border-l-white/10 border-b-black/80 border-r-black/80 shadow-[8px_8px_16px_#000000,-4px_-4px_12px_rgba(255,255,255,0.03)] rounded-2xl hover:-translate-y-1 hover:border-red-500/50 hover:shadow-[12px_12px_24px_rgba(0,0,0,0.8),-4px_-4px_16px_rgba(239,68,68,0.1)] transition-all duration-300 ${filter === 'Escalated' ? 'ring-2 ring-red-500' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Escalated</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">{escalated}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Link href="/complaints/new">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
            Submit New Grievance
          </Button>
        </Link>
      </div>

      <Card className="bg-gradient-to-br from-slate-800 to-slate-950 border border-t-white/10 border-l-white/10 border-b-black/80 border-r-black/80 shadow-[8px_8px_16px_#000000,-4px_-4px_12px_rgba(255,255,255,0.03)] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-slate-100">Your Recent Grievances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredComplaints?.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">No {filter !== 'All' ? filter.toLowerCase() : ''} grievances found.</p>
            )}
            {filteredComplaints?.map((complaint: any) => (
              <div key={complaint.id} className="p-4 rounded-xl border border-b-white/5 border-r-white/5 border-t-black/80 border-l-black/80 bg-slate-900/80 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-transform hover:scale-[1.01] duration-300">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-slate-500">{complaint.id.split('-')[0]}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      complaint.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                      complaint.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {complaint.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      complaint.status === 'Resolved' || complaint.status === 'Closed' ? 'bg-emerald-500/20 text-emerald-400' :
                      complaint.status === 'Escalated' ? 'bg-red-500/20 text-red-400' :
                      complaint.status === 'Under Review' ? 'bg-violet-500/20 text-violet-400' :
                      complaint.status === 'Action Taken' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {complaint.status}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${complaint.mode === 'Open' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-400'}`}>
                      {complaint.mode === 'Open' ? 'Visible to Admin' : 'Anonymous'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-1 tracking-tight">{complaint.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-1">{complaint.category}</p>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/complaints/${complaint.id}`}>
                    <Button variant="outline" size="sm" className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300">
                      View Details
                    </Button>
                  </Link>
                  {complaint.status === 'Closed' && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteMutation.mutate(complaint.id)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
