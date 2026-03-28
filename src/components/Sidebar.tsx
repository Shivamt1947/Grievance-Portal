'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LayoutDashboard, FileText, Menu, X, LogOut, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const getLinks = () => {
    switch (user.role) {
      case 'Student':
        return [
          { href: '/dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
          { href: '/complaints/new', label: 'New Complaint', icon: FileText },
        ]
      case 'Teacher':
        return [
          { href: '/dashboard', label: 'Teacher Dashboard', icon: LayoutDashboard },
        ]
      case 'Admin':
        return [
          { href: '/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
          { href: '/analytics', label: 'Analytics', icon: FileText },
        ]
      default:
        return []
    }
  }

  const links = getLinks()

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-slate-900 border-r border-slate-800 text-slate-100 w-64">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Grievance Portal
        </h2>
        <p className="text-sm text-slate-400 mt-2">{user.name} ({user.role})</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.15)]'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{link.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={logout}>
          <LogOut size={20} className="mr-3" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-50 flex items-center justify-between px-4">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Smart Portal
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-slate-300">
          {isOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="absolute top-16 bottom-0 left-0 w-64 shadow-2xl transition-transform transform translate-x-0" onClick={e => e.stopPropagation()}>
             <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-screen fixed left-0 top-0">
        <SidebarContent />
      </div>
    </>
  )
}
