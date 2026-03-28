'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ArrowLeft, Clock, ShieldAlert, CheckCircle, MessageSquare, User } from 'lucide-react'
import Link from 'next/link'

function fetchComplaint(id: string) {
  return fetch(`/api/complaints/${id}`).then(res => res.json())
}

function submitFeedback(id: string, rating: number, feedback: string) {
  return fetch(`/api/complaints/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, feedback })
  }).then(res => res.json())
}

function updateStatus(id: string, status: string, note: string) {
  return fetch(`/api/complaints/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note })
  }).then(res => res.json())
}

export default function ComplaintDetailsPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')

  const { data: complaint, isLoading, error } = useQuery({
    queryKey: ['complaints', id],
    queryFn: () => fetchComplaint(id as string),
    enabled: !!id,
  })

  const feedbackMutation = useMutation({
    mutationFn: () => submitFeedback(id as string, rating, feedback),
    onSuccess: (data) => {
      if (data.error) toast.error(data.error)
      else {
        toast.success('Feedback submitted and complaint closed.')
        queryClient.invalidateQueries({ queryKey: ['complaints', id] })
      }
    },
    onError: () => toast.error('Failed to submit feedback')
  })

  const teacherUpdateMutation = useMutation({
    mutationFn: (args: { status: string, note: string }) => updateStatus(id as string, args.status, args.note),
    onSuccess: (data) => {
      if (data.error) toast.error(data.error)
      else {
        toast.success(`Complaint moved to ${data.status}`)
        queryClient.invalidateQueries({ queryKey: ['complaints', id] })
      }
    },
    onError: () => toast.error('Failed to update status')
  })

  if (isLoading) return <div className="p-8 text-slate-400">Loading details...</div>
  if (error || !complaint || complaint.error) return <div className="p-8 text-red-500">Complaint not found.</div>

  const timeline = JSON.parse(complaint.timeline || '[]')
  const isResolved = complaint.status === 'Resolved' && user?.role === 'Student'
  const isClosed = complaint.status === 'Closed'

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-slate-400 hover:text-blue-400 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-blue-600 to-blue-400" />
              <CardHeader className="pb-4 border-b border-slate-800/50">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-slate-500 px-2 py-1 bg-slate-950 rounded-md border border-slate-800">
                    ID: {complaint.id}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    complaint.status === 'Closed' ? 'bg-slate-800 text-slate-400' :
                    complaint.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                    complaint.status === 'Escalated' ? 'bg-red-500/20 text-red-400' :
                    complaint.status === 'Under Review' ? 'bg-violet-500/20 text-violet-400' :
                    complaint.status === 'Action Taken' || complaint.status === 'In Progress' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {complaint.status}
                  </span>
                </div>
                <CardTitle className="text-xl md:text-2xl text-slate-100">{complaint.title}</CardTitle>
                <CardDescription className="flex flex-wrap gap-4 text-sm mt-2 text-slate-400">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(complaint.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> {complaint.priority} Priority</span>
                  {user?.role === 'Admin' && complaint.mode === 'Open' ? (
                    <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                      <User className="w-4 h-4" /> Filed by: {complaint.userId}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-slate-500 italic">
                      <User className="w-4 h-4" /> Reporter Identity Protected
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <h4 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Description</h4>
                <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
              </CardContent>
            </Card>

            {/* Attachment Display */}
            {complaint.attachment && (
              <Card className="bg-slate-900 border-slate-800 mt-6 shadow-xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-800/50">
                  <CardTitle className="text-xl text-slate-100 flex items-center gap-2">Attached Evidence</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="bg-slate-950/50 flex justify-center p-4">
                    <img 
                      src={complaint.attachment} 
                      alt="Complaint Evidence" 
                      className="max-w-full max-h-[500px] object-contain rounded-xl shadow-2xl border border-slate-800/50"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Teacher Action Panel (Locked if Escalated) */}
            {user?.role === 'Teacher' && !isClosed && complaint.status === 'Escalated' && (
              <Card className="bg-gradient-to-br from-red-950/50 to-slate-950 border-red-500/30 shadow-lg mt-6">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" /> Action Panel Locked
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    You cannot resolve this complaint because the 24-hour SLA deadline was breached. It has been automatically escalated to the Administration for resolution.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {user?.role === 'Teacher' && !isClosed && complaint.status !== 'Escalated' && (
              <Card className="bg-slate-900 border-indigo-500/30 shadow-lg shadow-indigo-900/10 mt-6">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-indigo-400" /> Resolution Action Panel
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Advance the complaint through the 4-step resolution process.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                    {/* Stepper Line Background */}
                    <div className="hidden md:block absolute top-1/2 left-4 right-4 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
                    
                    {/* Step 1 */}
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        ['Submitted', 'Under Review', 'Action Taken', 'Resolved', 'Closed'].includes(complaint.status) 
                        ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-800 text-slate-500'
                      }`}>
                        1
                      </div>
                      <span className="text-xs font-semibold text-slate-300">Submitted</span>
                    </div>

                    {/* Step 2 */}
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        ['Under Review', 'Action Taken', 'Resolved', 'Closed'].includes(complaint.status) 
                        ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]' : 'bg-slate-800 text-slate-500'
                      }`}>
                        2
                      </div>
                      {complaint.status === 'Submitted' ? (
                        <Button 
                          size="sm" 
                          className="bg-violet-600 hover:bg-violet-500 w-full md:w-auto text-xs"
                          onClick={() => teacherUpdateMutation.mutate({ status: 'Under Review', note: 'Teacher started reviewing the complaint' })}
                          disabled={teacherUpdateMutation.isPending}
                        >
                          Acknowledge
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-slate-300 text-center">Under Review</span>
                      )}
                    </div>

                    {/* Step 3 */}
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        ['Action Taken', 'Resolved', 'Closed'].includes(complaint.status) 
                        ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-slate-500'
                      }`}>
                        3
                      </div>
                      {complaint.status === 'Under Review' || complaint.status === 'In Progress' ? (
                        <Button 
                          size="sm" 
                          className="bg-amber-600 hover:bg-amber-500 w-full md:w-auto text-xs"
                          onClick={() => teacherUpdateMutation.mutate({ status: 'Action Taken', note: 'Teacher has taken action to resolve the issue' })}
                          disabled={teacherUpdateMutation.isPending}
                        >
                          Mark Action Taken
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-slate-300 text-center">Action Taken</span>
                      )}
                    </div>

                    {/* Step 4 */}
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        ['Resolved', 'Closed'].includes(complaint.status) 
                        ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-800 text-slate-500'
                      }`}>
                        4
                      </div>
                      {complaint.status === 'Action Taken' ? (
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-500 w-full md:w-auto text-xs"
                          onClick={() => teacherUpdateMutation.mutate({ status: 'Resolved', note: 'Teacher has formally marked the complaint as resolved' })}
                          disabled={teacherUpdateMutation.isPending}
                        >
                          Mark Resolved
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-slate-300 text-center">Resolved</span>
                      )}
                    </div>

                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feedback Section (If Resolved && Student) */}
            {isResolved && (
              <Card className="bg-slate-900 border-emerald-500/30 shadow-lg shadow-emerald-900/10">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" /> Issue Resolved
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    The department has marked this issue as resolved. Please provide your feedback to close the grievance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Rate the resolution (1-5 Stars)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`w-10 h-10 rounded-full font-bold transition-all ${
                            rating >= star ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/40' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {star}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Feedback Comments</label>
                    <textarea
                      className="w-full h-24 px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none"
                      placeholder="Were you satisfied with the outcome?"
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={() => feedbackMutation.mutate()} 
                    disabled={feedbackMutation.isPending || !feedback}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                  >
                    {feedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback & Close File'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {isClosed && complaint.feedback && (
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-amber-400" /> Student Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-lg ${i < JSON.parse(complaint.feedback).rating ? 'text-amber-400' : 'text-slate-700'}`}>★</span>
                      ))}
                    </div>
                    <p className="text-slate-300 italic">"{JSON.parse(complaint.feedback).comment}"</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Timeline Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-900 border-slate-800 h-full">
              <CardHeader>
                <CardTitle className="text-slate-100">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative border-l-2 border-slate-800 ml-3 space-y-6 pb-4">
                  {timeline.map((entry: any, index: number) => (
                    <div key={index} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                        entry.status === 'Resolved' || entry.status === 'Closed' ? 'bg-emerald-500' :
                        entry.status === 'Escalated' ? 'bg-red-500' :
                        entry.status === 'In Progress' || entry.status === 'Action Taken' ? 'bg-amber-500' :
                        entry.status === 'Under Review' ? 'bg-violet-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-200">{entry.status}</span>
                        <span className="text-xs text-slate-500 mt-0.5">{new Date(entry.date).toLocaleString()}</span>
                        <p className="text-sm text-slate-400 mt-2 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                          {entry.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  )
}
