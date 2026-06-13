import { Role } from "@prisma/client";

/**
 * Centralized permission system.
 * Semua role check harus melalui file ini — jangan hardcode string role di tempat lain.
 */

export const PERMISSIONS = {
  // Tickets
  canCreateTicket: [Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE] as Role[],
  canDeleteTicket: [Role.SUPER_ADMIN, Role.ADMIN] as Role[],
  canUpdateTicket: [
    Role.SUPER_ADMIN,
    Role.ADMIN,
    Role.EMPLOYEE,
    Role.INTERN,
  ] as Role[],

  // Comments
  canCommentOnAnyTicket: [Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE] as Role[],
  canCommentOnAssignedOnly: [Role.INTERN] as Role[],

  // Divisions
  canManageDivisions: [Role.SUPER_ADMIN] as Role[],

  // Users
  canManageUsers: [Role.SUPER_ADMIN, Role.ADMIN] as Role[],

  // View scope
  canViewAllDivisions: [Role.SUPER_ADMIN] as Role[],

  // Analytics
  canViewAnalytics: [Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE] as Role[],

  // AI Insights
  canViewAiInsights: [Role.SUPER_ADMIN, Role.ADMIN] as Role[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Check apakah sebuah role punya permission tertentu.
 */
export function hasPermission(role: string, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}

/**
 * Check apakah role bisa melihat semua divisi (SUPER_ADMIN).
 */
export function canViewAllDivisions(role: string): boolean {
  return hasPermission(role, "canViewAllDivisions");
}

/**
 * Check apakah user bisa berkomentar di tiket tertentu.
 */
export function canCommentOnTicket(
  user: { id: string; role: string },
  ticket: { assigneeId: string | null }
): boolean {
  if (hasPermission(user.role, "canCommentOnAnyTicket")) return true;
  if (hasPermission(user.role, "canCommentOnAssignedOnly")) {
    return ticket.assigneeId === user.id;
  }
  return false;
}

/**
 * Navigation items config — digunakan oleh Sidebar.
 * Setiap item memiliki daftar permission yang minimal salah satu harus dipenuhi.
 */
export const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard" as const,
    // Semua role bisa akses dashboard
    roles: [
      Role.SUPER_ADMIN,
      Role.ADMIN,
      Role.EMPLOYEE,
      Role.INTERN,
    ] as Role[],
  },
  {
    label: "Tickets",
    href: "/dashboard/tickets",
    icon: "Ticket" as const,
    roles: [
      Role.SUPER_ADMIN,
      Role.ADMIN,
      Role.EMPLOYEE,
      Role.INTERN,
    ] as Role[],
  },
  {
    label: "Daily Report",
    href: "/dashboard/reports",
    icon: "FileText" as const,
    roles: [
      Role.SUPER_ADMIN,
      Role.ADMIN,
      Role.EMPLOYEE,
      Role.INTERN,
    ] as Role[],
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: "BarChart2" as const,
    roles: PERMISSIONS.canViewAnalytics,
  },
  {
    label: "AI Insights",
    href: "/dashboard/ai",
    icon: "Sparkles" as const,
    roles: PERMISSIONS.canViewAiInsights,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: "Users" as const,
    roles: PERMISSIONS.canManageUsers,
  },
  {
    label: "Divisi",
    href: "/dashboard/divisions",
    icon: "Building2" as const,
    roles: PERMISSIONS.canManageDivisions,
  },
] as const;
