'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react'

function fetchAllComplaints() {
  return fetch('/api/complaints').then(res => res.json())
}

function updateStatus(id: string, status: string, note: string) {
  return fetch(`/api/complaints/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note })
  }).then(res => res.json())
}

const COLORS = {
  Submitted: '#3b82f6', // blue-500
  'In Progress': '#f59e0b', // amber-500
  'Under Review': '#8b5cf6', // violet-500
  'Action Taken': '#f59e0b', // amber-500
  Resolved: '#10b981', // emerald-500
  Escalated: '#ef4444', // red-500
  Closed: '#64748b' // slate-500
}

export function AdminDashboard() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'All' | 'Escalated' | 'Resolved'>('Escalated')

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['complaints', 'all'],
    queryFn: fetchAllComplaints,
    refetchInterval: 5000 // Polling every 5s for SLAs
  })

  const updateMutation = useMutation({
    mutationFn: (args: { id: string, status: string, note: string }) => updateStatus(args.id, args.status, args.note),
    onSuccess: (res) => {
      if (res.error) toast.error(res.error)
      else {
        toast.success(`Complaint manually marked as ${res.status}`)
        queryClient.invalidateQueries({ queryKey: ['complaints', 'all'] })
      }
    },
    onError: () => toast.error('Failed to update status')
  })

  if (isLoading) return <div className="text-slate-400">Loading all complaints...</div>

  // Handle fetch error from API
  if (!isLoading && complaints && !Array.isArray(complaints)) {
    return (
      <div className="p-6 bg-red-950/30 border border-red-500/20 rounded-xl">
        <h3 className="text-red-400 font-semibold mb-2">Database Connection Error</h3>
        <p className="text-slate-300 text-sm">Failed to connect to the database. The Vercel Serverless environment requires a cloud database instead of local SQLite for full functionality.</p>
      </div>
    )
  }

  // Analytics preparation
  const validComplaints = Array.isArray(complaints) ? complaints : []
  const statusCounts = validComplaints.reduce((acc: any, curr: any) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1
    return acc
  }, {}) || {}

  const pieData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key],
    color: COLORS[key as keyof typeof COLORS] || '#8884d8'
  }))

  const escalatedCount = complaints?.filter((c: any) => c.status === 'Escalated').length || 0

  const filteredComplaints = complaints?.filter((c: any) => {
    if (filter === 'Escalated') return c.status === 'Escalated'
    if (filter === 'Resolved') return c.status === 'Resolved' || c.status === 'Closed'
    return true
  })

  const sectionTitle = filter === 'Escalated' ? 'Escalated' : filter === 'Resolved' ? 'Resolved Grievances' : 'All System Grievances'
  const sectionIcon = filter === 'Escalated' ? <AlertCircle className="text-red-500 h-5 w-5" /> : filter === 'Resolved' ? <CheckCircle className="text-emerald-500 h-5 w-5" /> : <AlertCircle className="text-blue-500 h-5 w-5" />
  const borderColor = filter === 'Escalated' ? 'border-red-500/30' : filter === 'Resolved' ? 'border-emerald-500/30' : 'border-blue-500/30'

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          onClick={() => setFilter('Escalated')}
          className={`cursor-pointer bg-gradient-to-br from-slate-800 to-slate-950 border border-t-white/10 border-l-white/10 border-b-black/80 border-r-black/80 shadow-[8px_8px_16px_#000000,-4px_-4px_12px_rgba(255,255,255,0.03)] rounded-2xl hover:-translate-y-1 hover:border-red-500/50 hover:shadow-[12px_12px_24px_rgba(0,0,0,0.8),-4px_-4px_16px_rgba(239,68,68,0.1)] transition-all duration-300 ${filter === 'Escalated' ? 'ring-2 ring-red-500' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-400 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" /> Escalated (SLA Breached)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">{escalatedCount}</div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setFilter('All')}
          className={`cursor-pointer bg-gradient-to-br from-slate-800 to-slate-950 border border-t-white/10 border-l-white/10 border-b-black/80 border-r-black/80 shadow-[8px_8px_16px_#000000,-4px_-4px_12px_rgba(255,255,255,0.03)] rounded-2xl hover:-translate-y-1 hover:border-blue-500/50 transition-all duration-300 ${filter === 'All' ? 'ring-2 ring-blue-500' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total System Grievances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">{complaints?.length || 0}</div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setFilter('Resolved')}
          className={`cursor-pointer bg-gradient-to-br from-slate-800 to-slate-950 border border-t-white/10 border-l-white/10 border-b-black/80 border-r-black/80 shadow-[8px_8px_16px_#000000,-4px_-4px_12px_rgba(255,255,255,0.03)] rounded-2xl hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-[12px_12px_24px_rgba(0,0,0,0.8),-4px_-4px_16px_rgba(16,185,129,0.1)] transition-all duration-300 ${filter === 'Resolved' ? 'ring-2 ring-emerald-500' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Resolved / Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">
              {(statusCounts['Resolved'] || 0) + (statusCounts['Closed'] || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-950 border border-t-white/10 border-l-white/10 border-b-black/80 border-r-black/80 shadow-[8px_8px_16px_#000000,-4px_-4px_12px_rgba(255,255,255,0.03)] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-slate-100">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart key={JSON.stringify(pieData)}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No data</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-950 border border-t-white/10 border-l-white/10 border-b-black/80 border-r-black/80 shadow-[8px_8px_16px_#000000,-4px_-4px_12px_rgba(255,255,255,0.03)] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-slate-100">Recent System Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] overflow-y-auto pr-2 space-y-3">
            {complaints?.slice(0, 5).map((complaint: any) => (
               <Link href={`/complaints/${complaint.id}`} key={`act-${complaint.id}`} className="block p-3 rounded-lg border border-b-white/5 border-r-white/5 border-t-black/80 border-l-black/80 bg-slate-900/80 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)] text-sm transition-all hover:scale-[1.01] hover:bg-slate-800/80 cursor-pointer duration-300">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-slate-300">ID: {complaint.id.split('-')[0]}</span>
                    <span className={`px-2 rounded-full text-[10px] ${
                      complaint.status === 'Escalated' ? 'bg-red-500/20 text-red-400' : 
                      complaint.status === 'Resolved' || complaint.status === 'Closed' ? 'bg-emerald-500/20 text-emerald-400' :
                      complaint.status === 'Under Review' ? 'bg-violet-500/20 text-violet-400' :
                      complaint.status === 'Action Taken' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-slate-200 truncate">{complaint.title}</p>
               </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Escalated Action Board */}
      <Card className={`bg-gradient-to-br from-slate-800 to-slate-950 border border-t-white/10 border-l-white/10 border-b-black/80 border-r-black/80 shadow-[8px_8px_16px_#000000,-4px_-4px_12px_rgba(255,255,255,0.03)] rounded-2xl ${borderColor}`}>
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            {sectionIcon} {sectionTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredComplaints?.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">No complaints found in this category.</p>
            )}
            {filteredComplaints?.map((complaint: any) => (
              <div key={complaint.id} className="p-4 rounded-xl border border-b-white/5 border-r-white/5 border-t-black/80 border-l-black/80 bg-gradient-to-br from-red-950/40 to-slate-950 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-transform hover:scale-[1.01] duration-300">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      ID: {complaint.id.split('-')[0]}
                    </span>
                    {complaint.status === 'Escalated' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 font-medium">
                        Escalated from SLA Breach
                      </span>
                    )}
                    {complaint.status !== 'Escalated' && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${complaint.status === 'Resolved' || complaint.status === 'Closed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {complaint.status}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-1 tracking-tight">{complaint.title}</h3>
                  <p className="text-sm text-slate-400 mb-2">
                    Category: {complaint.category} 
                    {complaint.mode === 'Open' ? (
                      <span className="text-blue-400"> • Filed by {complaint.userId}</span>
                    ) : (
                      <span className="text-slate-500 italic"> • Identity Protected</span>
                    )}
                  </p>
                  
                  {complaint.status !== 'Closed' && complaint.status !== 'Resolved' && (complaint.status === 'Escalated' || complaint.assignedTo === 'admin@tsec.edu') && (
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                        onClick={() => updateMutation.mutate({ id: complaint.id, status: 'Resolved', note: 'Admin forcibly resolved escalated complaint' })}
                        disabled={updateMutation.isPending}
                      >
                        Admin Resolve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                        onClick={() => updateMutation.mutate({ id: complaint.id, status: 'In Progress', note: 'Admin reassigned or demoted status' })}
                        disabled={updateMutation.isPending}
                      >
                        Demote to In Progress
                      </Button>
                    </div>
                  )}
                </div>
                
                <div>
                  <Link href={`/complaints/${complaint.id}`}>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                      View Logs
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
