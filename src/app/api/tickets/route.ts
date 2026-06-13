import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parsePagination, paginatedResponse } from "@/lib/validations/pagination";
import { listTickets, createTicket, ServiceError } from "@/lib/services/ticket.service";
import { ZodError } from "zod/v4";

// GET — ambil semua ticket sesuai scope user, dengan pagination
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const divisionId = searchParams.get("divisionId");
    const pagination = parsePagination(searchParams);

    const { tickets, total } = await listTickets(session.user, {
      divisionId,
      ...pagination,
    });

    return NextResponse.json(
      paginatedResponse(tickets, total, pagination.page, pagination.limit),
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Parameter tidak valid", details: error.issues },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST — buat ticket baru
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const ticket = await createTicket(body, session.user);

    return NextResponse.json(ticket, { status: 201 });
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