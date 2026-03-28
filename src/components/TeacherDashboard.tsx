'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'
import { Clock } from 'lucide-react'

function fetchAssignedComplaints(email: string) {
  return fetch(`/api/complaints?assignedTo=${email}`).then(res => res.json())
}



export function TeacherDashboard() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['complaints', 'assigned', user?.email],
    queryFn: () => fetchAssignedComplaints(user!.email),
    enabled: !!user,
    refetchInterval: 5000,
  })



  if (isLoading) return <div className="text-slate-400">Loading assigned complaints...</div>

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-slate-800 to-slate-950 border border-t-white/10 border-l-white/10 border-b-black/80 border-r-black/80 shadow-[8px_8px_16px_#000000,-4px_-4px_12px_rgba(255,255,255,0.03)] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-slate-100">Complaints Assigned to You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complaints?.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">No complaints assigned.</p>
            )}
            {complaints?.map((complaint: any) => (
              <div key={complaint.id} className="p-4 rounded-xl border border-b-white/5 border-r-white/5 border-t-black/80 border-l-black/80 bg-slate-900/80 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-transform hover:scale-[1.01] duration-300">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      ID: {complaint.id.split('-')[0]}
                    </span>
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
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-1 tracking-tight">{complaint.title}</h3>
                  <p className="text-sm text-slate-400 mb-1">{complaint.category} • Filed by student</p>
                  {complaint.status !== 'Resolved' && complaint.status !== 'Closed' && (
                    <div className="flex items-center gap-1 text-xs text-amber-400/90 mb-2">
                      <Clock size={12} />
                      <span>SLA Deadline: {new Date(complaint.slaDeadline).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  )}
                  

                </div>
                
                <div>
                  <Link href={`/complaints/${complaint.id}`}>
                    <Button variant="outline" size="sm" className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300">
                      View Timeline Logs
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
