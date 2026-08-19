"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  FileText,
  BarChart2,
  Users,
  Building2,
  Sparkles,
  FolderKanban,
  X,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/permissions";

const iconMap = {
  LayoutDashboard,
  Ticket,
  FileText,
  BarChart2,
  Sparkles,
  Users,
  Building2,
  FolderKanban,
} as const;

interface SidebarProps {
  role: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const filtered = NAV_ITEMS.filter((item) =>
    (item.roles as readonly string[]).includes(role)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-56 border-r border-zinc-800/80 bg-zinc-950 flex flex-col transform transition-transform duration-200 ease-out lg:static lg:translate-x-0 select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Workspace Header */}
        <div className="h-12 border-b border-zinc-800/80 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-zinc-100 text-zinc-950 font-extrabold text-[11px] flex items-center justify-center tracking-tighter shrink-0">
              A
            </div>
            <div className="min-w-0 flex items-center gap-1.5">
              <span className="font-semibold text-xs text-zinc-100 tracking-tight truncate">
                Arul-Pani
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">v1.0</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
          >
            <X size={14} />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          <div className="px-2 pb-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Menu Utama
          </div>

          {filtered.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-all duration-150 relative font-medium",
                  isActive
                    ? "bg-zinc-800/90 text-zinc-100 shadow-2xs border border-zinc-700/50"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                )}
              >
                <Icon
                  size={14}
                  strokeWidth={1.75}
                  className={cn(
                    "shrink-0",
                    isActive ? "text-zinc-100" : "text-zinc-400"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center gap-1">
            <Command size={11} />
            <span>K</span>
            <span className="text-[10px] ml-1">Quick Search</span>
          </div>
          <span className="text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
            PRO
          </span>
        </div>
      </aside>
    </>
  );
}