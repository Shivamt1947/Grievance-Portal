'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BarChart3, PieChart as PieIcon } from 'lucide-react'

const COLORS = {
  Submitted: '#3b82f6',
  'In Progress': '#f59e0b',
  'Under Review': '#8b5cf6',
  'Action Taken': '#f59e0b',
  Resolved: '#10b981',
  Escalated: '#ef4444',
  Closed: '#64748b'
}

export default function AnalyticsPage() {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== 'Admin') {
      router.push('/dashboard')
    }
  }, [user, router])

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['complaints', 'all'],
    queryFn: () => fetch('/api/complaints').then(res => res.json()),
    enabled: user?.role === 'Admin',
  })

  // Prevent flash of content if routing student/teacher out
  if (!user || user.role !== 'Admin') return null
  if (isLoading) return <div className="text-slate-400">Loading comprehensive analytics...</div>

  // Status Data
  const statusCounts = complaints?.reduce((acc: any, curr: any) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1
    return acc
  }, {}) || {}

  const pieData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key],
    color: COLORS[key as keyof typeof COLORS] || '#8884d8'
  }))

  // Category Data
  const categoryCounts = complaints?.reduce((acc: any, curr: any) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1
    return acc
  }, {}) || {}

  const barData = Object.keys(categoryCounts).map(key => ({
    name: key,
    amount: categoryCounts[key]
  }))

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Analytics</h1>
          <p className="text-slate-400 mt-1">Deep-dive into grievance trends and categorical data.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-950 border border-t-white/10 border-l-white/10 border-b-black/80 border-r-black/80 shadow-[8px_8px_16px_#000000,-4px_-4px_12px_rgba(255,255,255,0.03)] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-indigo-400" /> Complete Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart key={JSON.stringify(pieData)}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
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
                <div className="h-full flex items-center justify-center text-slate-500">No data available</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-950 border border-t-white/10 border-l-white/10 border-b-black/80 border-r-black/80 shadow-[8px_8px_16px_#000000,-4px_-4px_12px_rgba(255,255,255,0.03)] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" /> Complaints by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                      cursor={{ fill: '#1e293b' }}
                    />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
