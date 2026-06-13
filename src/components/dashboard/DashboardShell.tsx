'use client'

import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import Navbar from '@/components/dashboard/Navbar'

interface DashboardShellProps {
  children: React.ReactNode
  role: string
  user: {
    name?: string | null
    email?: string | null
    role: string
  }
}

/**
 * Client component wrapper untuk dashboard layout.
 * Mengelola state sidebar open/close untuk responsive behavior.
 */
export default function DashboardShell({ children, role, user }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar
          user={user}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
