'use client'

import { useAuthStore } from '@/store/authStore'
import { ReactNode } from 'react'

export function MainLayout({ children }: { children: ReactNode }) {
  const { user } = useAuthStore()

  return (
    <main className={`flex-1 min-h-screen transition-all duration-300 ${user ? 'md:pl-64 pt-16 md:pt-0' : ''}`}>
      <div className="p-6 md:p-8">
        {children}
      </div>
    </main>
  )
}
