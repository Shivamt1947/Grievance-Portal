'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'
import { StudentDashboard } from '@/components/StudentDashboard'
import { TeacherDashboard } from '@/components/TeacherDashboard'
import { AdminDashboard } from '@/components/AdminDashboard'

export default function DashboardPage() {
  const { user } = useAuthStore()

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{user?.role} Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Welcome back, {user?.name}. Here is an overview of the grievances.
          </p>
        </div>

        {user?.role === 'Student' && <StudentDashboard />}
        {user?.role === 'Teacher' && <TeacherDashboard />}
        {user?.role === 'Admin' && <AdminDashboard />}
      </div>
    </ProtectedRoute>
  )
}
