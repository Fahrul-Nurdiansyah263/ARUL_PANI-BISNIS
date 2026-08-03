import { Role } from "@prisma/client";

/**
 * Centralized permission system untuk Arul-Pani Agency.
 * Semua anggota (MEMBER & OWNER) setara dalam mengakses proyek.
 * OWNER hanya memiliki hak tambahan untuk mengelola settings agency.
 */

export const PERMISSIONS = {
  // Tickets — semua member bisa buat, update, dan hapus ticket
  canCreateTicket: [Role.OWNER, Role.MEMBER] as Role[],
  canDeleteTicket: [Role.OWNER, Role.MEMBER] as Role[],
  canUpdateTicket: [Role.OWNER, Role.MEMBER] as Role[],

  // Projects — semua member bisa buat & update, hanya OWNER yang bisa delete
  canCreateProject: [Role.OWNER, Role.MEMBER] as Role[],
  canUpdateProject: [Role.OWNER, Role.MEMBER] as Role[],
  canDeleteProject: [Role.OWNER] as Role[],

  // Comments — semua member bisa berkomentar di tiket manapun
  canCommentOnAnyTicket: [Role.OWNER, Role.MEMBER] as Role[],

  // Users — OWNER bisa kelola anggota tim
  canManageUsers: [Role.OWNER] as Role[],

  // Analytics & AI Insights — terbuka untuk semua
  canViewAnalytics: [Role.OWNER, Role.MEMBER] as Role[],
  canViewAiInsights: [Role.OWNER, Role.MEMBER] as Role[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Check apakah sebuah role punya permission tertentu.
 */
export function hasPermission(role: string, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}

/**
 * Semua anggota bisa melihat semua ticket dalam company (tidak ada batasan divisi).
 */
export function canViewAllTickets(_role: string): boolean {
  return true;
}

/**
 * Semua anggota bisa berkomentar di tiket manapun.
 */
export function canCommentOnTicket(
  user: { id: string; role: string },
  _ticket: { assigneeId: string | null }
): boolean {
  return hasPermission(user.role, "canCommentOnAnyTicket");
}

/**
 * Navigation items — semua item terlihat untuk semua anggota Arul-Pani Agency.
 */
export const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard" as const,
    roles: [Role.OWNER, Role.MEMBER] as Role[],
  },
  {
    label: "Proyek",
    href: "/dashboard/projects",
    icon: "FolderKanban" as const,
    roles: [Role.OWNER, Role.MEMBER] as Role[],
  },
  {
    label: "Tickets",
    href: "/dashboard/tickets",
    icon: "Ticket" as const,
    roles: [Role.OWNER, Role.MEMBER] as Role[],
  },
  {
    label: "AI Insights",
    href: "/dashboard/ai",
    icon: "Sparkles" as const,
    roles: [Role.OWNER, Role.MEMBER] as Role[],
  },
  {
    label: "Anggota",
    href: "/dashboard/users",
    icon: "Users" as const,
    roles: [Role.OWNER] as Role[],
  },
] as const;
