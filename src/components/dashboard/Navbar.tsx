"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
  onMenuToggle: () => void;
}

const roleLabel: Record<string, string> = {
  OWNER: "Owner",
  MEMBER: "Member",
};

export default function Navbar({ user, onMenuToggle }: NavbarProps) {
  const initial = user.name ? user.name[0]?.toUpperCase() : "U";

  return (
    <header className="h-12 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-5 flex items-center justify-between shrink-0 select-none z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={16} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* User Profile Info */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center font-bold text-[10px] shrink-0">
            {initial}
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-semibold text-zinc-200 leading-none">
              {user.name}
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-medium">
            {roleLabel[user.role] ?? user.role}
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-800" />

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="icon"
          title="Keluar / Logout"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="h-7 w-7 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
        >
          <LogOut size={13} />
        </Button>
      </div>
    </header>
  );
}