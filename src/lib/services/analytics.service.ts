import { db } from "@/lib/db";

export async function getDashboardMetrics(companyId: string) {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [
    projectsCount,
    activeProjectsCount,
    completedProjectsCount,
    ticketsByStatus,
    urgentTickets,
    recentProjects,
    recentTickets,
    totalUsers,
    activeUsers,
  ] = await Promise.all([
    // Total Projects
    db.project.count({ where: { companyId } }),

    // Active Projects
    db.project.count({ where: { companyId, status: "ACTIVE" } }),

    // Completed Projects
    db.project.count({ where: { companyId, status: "COMPLETED" } }),

    // Tickets grouped by status
    db.ticket.groupBy({
      by: ["status"],
      where: { companyId },
      _count: { id: true },
    }),

    // Urgent / Overdue tickets (< 24h or overdue, not done)
    db.ticket.findMany({
      where: {
        companyId,
        status: { not: "DONE" },
        deadline: {
          not: null,
          lte: next24Hours,
        },
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatarUrl: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
      orderBy: { deadline: "asc" },
      take: 5,
    }),

    // Recent active projects with stats
    db.project.findMany({
      where: { companyId },
      include: {
        _count: {
          select: {
            tickets: true,
            docs: true,
          },
        },
        tickets: {
          select: { status: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),

    // Recent updated tickets
    db.ticket.findMany({
      where: { companyId },
      include: {
        assignee: {
          select: { id: true, name: true, avatarUrl: true },
        },
        project: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),

    // Total Users
    db.user.count({ where: { companyId } }),

    // Active Users
    db.user.count({ where: { companyId, isActive: true } }),
  ]);

  // Status mapping
  const statusMap = {
    TODO: 0,
    IN_PROGRESS: 0,
    REVIEW: 0,
    PRIORITY: 0,
    DONE: 0,
  };

  let totalTickets = 0;
  ticketsByStatus.forEach((item) => {
    statusMap[item.status as keyof typeof statusMap] = item._count.id;
    totalTickets += item._count.id;
  });

  const completionRate =
    totalTickets > 0 ? Math.round((statusMap.DONE / totalTickets) * 100) : 0;

  // Process recent projects with progress calculation
  const processedProjects = recentProjects.map((p) => {
    const totalProjTickets = p._count.tickets;
    const doneTickets = p.tickets.filter((t) => t.status === "DONE").length;
    const progress =
      totalProjTickets > 0
        ? Math.round((doneTickets / totalProjTickets) * 100)
        : 0;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      imageUrl: p.imageUrl,
      status: p.status,
      ticketsCount: totalProjTickets,
      docsCount: p._count.docs,
      doneCount: doneTickets,
      progress,
    };
  });

  return {
    projects: {
      total: projectsCount,
      active: activeProjectsCount,
      completed: completedProjectsCount,
    },
    tickets: {
      total: totalTickets,
      byStatus: statusMap,
      completionRate,
      urgentCount: urgentTickets.length,
    },
    users: {
      total: totalUsers,
      active: activeUsers,
    },
    urgentTickets,
    recentProjects: processedProjects,
    recentTickets,
  };
}
