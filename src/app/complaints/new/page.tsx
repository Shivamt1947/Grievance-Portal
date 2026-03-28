'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function createComplaint(data: any) {
  return fetch('/api/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json())
}

export default function NewComplaintPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Lecturer')
  const [priority, setPriority] = useState('Medium')
  const [mode, setMode] = useState('Protected')
  const [attachmentBase64, setAttachmentBase64] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setAttachmentBase64(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const mutation = useMutation({
    mutationFn: createComplaint,
    onSuccess: (data) => {
      if (data.error) toast.error(data.error)
      else {
        toast.success('Grievance filed successfully!')
        queryClient.invalidateQueries({ queryKey:['complaints']})
        router.push('/dashboard')
      }
    },
    onError: () => toast.error('Failed to submit grievance')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description) return toast.error('Please fill all required fields')
    
    mutation.mutate({
      title,
      description,
      category,
      priority,
      mode,
      userId: user?.email,
      attachmentBase64
    })
  }

  return (
    <ProtectedRoute allowedRoles={['Student']}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-slate-400 hover:text-blue-400 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </Link>
        
        <Card className="bg-slate-900 border-slate-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-100">Submit New Grievance</CardTitle>
            <CardDescription className="text-slate-400">
              Please provide clear details about your issue. This will be automatically assigned to the relevant department head.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="E.g., Missing marks in Internal Assessment"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-100 focus:ring-1 focus:ring-blue-500 transition-all h-auto shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl rounded-xl overflow-hidden backdrop-blur-md">
                      <SelectItem className="cursor-pointer py-3 pl-4 pr-8 focus:bg-blue-600/20 focus:text-blue-400 transition-colors" value="Marks">Examination / Marks</SelectItem>
                      <SelectItem className="cursor-pointer py-3 pl-4 pr-8 focus:bg-blue-600/20 focus:text-blue-400 transition-colors" value="Lecturer">Lecturer / Teaching</SelectItem>
                      <SelectItem className="cursor-pointer py-3 pl-4 pr-8 focus:bg-blue-600/20 focus:text-blue-400 transition-colors" value="Maintenance">Maintenance</SelectItem>
                      <SelectItem className="cursor-pointer py-3 pl-4 pr-8 focus:bg-blue-600/20 focus:text-blue-400 transition-colors" value="Facilities">Campus Facilities</SelectItem>
                      <SelectItem className="cursor-pointer py-3 pl-4 pr-8 focus:bg-blue-600/20 focus:text-blue-400 transition-colors" value="Administration">Administration</SelectItem>
                      <SelectItem className="cursor-pointer py-3 pl-4 pr-8 focus:bg-blue-600/20 focus:text-blue-400 transition-colors" value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Priority</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-100 focus:ring-1 focus:ring-blue-500 transition-all h-auto shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl rounded-xl overflow-hidden backdrop-blur-md">
                      <SelectItem className="cursor-pointer py-3 pl-4 pr-8 focus:bg-blue-600/20 focus:text-blue-400 transition-colors" value="Low">Low - Informational</SelectItem>
                      <SelectItem className="cursor-pointer py-3 pl-4 pr-8 focus:bg-amber-500/20 focus:text-amber-400 transition-colors" value="Medium">Medium - Standard</SelectItem>
                      <SelectItem className="cursor-pointer py-3 pl-4 pr-8 focus:bg-red-500/20 focus:text-red-400 transition-colors" value="High">High - Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Privacy Mode</label>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-100 focus:ring-1 focus:ring-blue-500 transition-all h-auto shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]">
                      <SelectValue placeholder="Select Privacy Mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl rounded-xl overflow-hidden backdrop-blur-md">
                      <SelectItem className="cursor-pointer py-3 pl-4 pr-8 focus:bg-violet-600/20 focus:text-violet-400 transition-colors" value="Protected">Protected (Anonymous to all)</SelectItem>
                      <SelectItem className="cursor-pointer py-3 pl-4 pr-8 focus:bg-emerald-600/20 focus:text-emerald-400 transition-colors" value="Open">Open (Visible to Admin only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Detailed Description</label>
                <textarea
                  className="w-full h-32 px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                  placeholder="Provide as much context as possible..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Upload UI */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Attach Evidence (Optional)</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex flex-col items-center justify-center w-full h-32 border-2 border-slate-800 border-dashed rounded-xl cursor-pointer bg-slate-900 hover:bg-slate-900/80 hover:border-blue-500/50 transition-all shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)]">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-blue-400">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-slate-500">PNG, JPG or WebP (MAX. 5MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  {attachmentBase64 && (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-slate-700 shadow-xl">
                      <img src={attachmentBase64} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setAttachmentBase64(null)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/50 flex justify-end gap-3">
                <Button type="button" variant="ghost" className="text-slate-400 hover:text-slate-200" onClick={() => router.push('/dashboard')}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 px-8"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? 'Submitting...' : 'Submit Grievance'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
