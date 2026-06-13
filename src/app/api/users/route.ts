import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parsePagination, paginatedResponse } from "@/lib/validations/pagination";
import { listUsers } from "@/lib/services/user.service";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const divisionId = searchParams.get("divisionId");
    const pagination = parsePagination(searchParams);

    const { users, total } = await listUsers(session.user.companyId, {
      divisionId,
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