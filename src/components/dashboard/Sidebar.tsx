'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Ticket,
  FileText,
  BarChart2,
  Users,
  Building2,
  Sparkles,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/permissions'

const iconMap = {
  LayoutDashboard,
  Ticket,
  FileText,
  BarChart2,
  Sparkles,
  Users,
  Building2,
} as const

interface SidebarProps {
  role: string
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const filtered = NAV_ITEMS.filter((item) =>
    (item.roles as readonly string[]).includes(role),
  )

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 border-r bg-card flex flex-col transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Sejiwa</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Project Management Agency
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {filtered.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}