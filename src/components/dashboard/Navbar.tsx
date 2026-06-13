'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut, Bell, Menu } from 'lucide-react'

interface NavbarProps {
  user: {
    name?: string | null
    email?: string | null
    role: string
  }
  onMenuToggle: () => void
}

export default function Navbar({ user, onMenuToggle }: NavbarProps) {
  return (
    <header className="h-14 border-b bg-card px-4 sm:px-6 flex items-center justify-between">
      <button
        onClick={onMenuToggle}
        className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3 sm:gap-4">
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Bell size={18} />
        </button>
        <div className="text-sm text-right hidden sm:block">
          <p className="font-medium leading-none">{user.name}</p>
          <p className="text-muted-foreground text-xs mt-0.5">{user.role}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  )
}