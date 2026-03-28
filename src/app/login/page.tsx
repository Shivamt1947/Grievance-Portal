'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@tsec.edu')) {
      setError('Please use a valid @tsec.edu email')
      return
    }
    
    login(email)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 border border-slate-700 shadow-inner text-blue-400">
            <UserCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-2 text-center">
            Sign in to the Smart Grievance Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="relative z-10 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <input
              type="email"
              required
              className={cn(
                "w-full px-4 py-3 rounded-xl bg-slate-950/50 border outline-none transition-all duration-300",
                error 
                  ? "border-red-500/50 focus:border-red-400 focus:ring-1 focus:ring-red-400"
                  : "border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100"
              )}
              placeholder="student@tsec.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
            />
            {error && <p className="text-sm text-red-400 ml-1 mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 transform active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 relative z-10">
          <p className="text-xs text-slate-500 text-center uppercase tracking-wider font-semibold mb-3">
            Demo Roles
          </p>
          <div className="flex flex-col gap-2 text-sm text-slate-400">
            <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
              <span>Admin:</span> <code className="text-blue-400 bg-blue-950/30 px-2 py-0.5 rounded">admin@tsec.edu</code>
            </div>
            <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
              <span>Teacher:</span> <code className="text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded">teacher@tsec.edu</code>
            </div>
            <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
              <span>Student:</span> <code className="text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded">*@tsec.edu</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
