import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parsePagination, paginatedResponse } from "@/lib/validations/pagination";
import { listUsers } from "@/lib/services/user.service";
import { hasPermission } from "@/lib/permissions";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!hasPermission(session.user.role, "canManageUsers")) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke data anggota" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const pagination = parsePagination(searchParams);

    const { users, total } = await listUsers(session.user.companyId, {
      ...pagination,
    });

    return NextResponse.json(
      paginatedResponse(users, total, pagination.page, pagination.limit),
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}