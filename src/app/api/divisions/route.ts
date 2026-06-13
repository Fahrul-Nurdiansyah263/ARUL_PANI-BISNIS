import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parsePagination, paginatedResponse } from "@/lib/validations/pagination";
import {
  listDivisions,
  createDivision,
} from "@/lib/services/division.service";
import { ServiceError } from "@/lib/services/ticket.service";
import { ZodError } from "zod/v4";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const pagination = parsePagination(searchParams);

    const { divisions, total } = await listDivisions(
      session.user.companyId,
      pagination,
    );

    return NextResponse.json(
      paginatedResponse(divisions, total, pagination.page, pagination.limit),
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const division = await createDivision(body, session.user);

    return NextResponse.json(division, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 },
      );
    }
    if (error instanceof ServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}