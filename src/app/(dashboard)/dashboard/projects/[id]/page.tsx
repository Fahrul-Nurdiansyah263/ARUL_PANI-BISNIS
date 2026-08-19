import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProjectDetailView from "@/components/projects/ProjectDetailView";

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          tickets: true,
          docs: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Ensure user has access to this company's project
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true },
  });

  const userCompanyId = currentUser?.companyId || session.user.companyId;

  if (project.companyId !== userCompanyId) {
    redirect("/dashboard/projects");
  }

  return (
    <ProjectDetailView
      project={{
        id: project.id,
        name: project.name,
        description: project.description,
        imageUrl: project.imageUrl,
        status: project.status,
        ticketsCount: project._count.tickets,
        docsCount: project._count.docs,
      }}
      sessionUser={{
        id: session.user.id,
        role: session.user.role,
        companyId: userCompanyId,
      }}
    />
  );
}
