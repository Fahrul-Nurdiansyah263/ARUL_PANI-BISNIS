import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardMetrics } from "@/lib/services/analytics.service";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export const metadata = {
  title: "Dashboard Overview — Arul-Pani",
  description: "Ringkasan metrik alur kerja, progress proyek, dan performa tim Arul-Pani Agency.",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const metrics = await getDashboardMetrics(session.user.companyId);

  return (
    <DashboardOverview
      metrics={metrics}
      userName={session.user.name || "Pengguna"}
      userRole={session.user.role}
    />
  );
}