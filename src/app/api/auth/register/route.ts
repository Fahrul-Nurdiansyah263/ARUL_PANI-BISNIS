import { NextResponse } from "next/server";
import { registerCompany } from "@/lib/services/auth.service";
import { ServiceError } from "@/lib/services/ticket.service";
import { ZodError } from "zod/v4";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const company = await registerCompany(body);

    return NextResponse.json(
      { message: "Perusahaan berhasil didaftarkan", companyId: company.id },
      { status: 201 },
    );
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
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}