import { NextResponse } from "next/server";
import { sendAssignmentEmail } from "@/lib/services/email.service";

export async function GET(req: Request) {
  return POST(req);
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const toEmail = searchParams.get("to") || process.env.GMAIL_USER;

    if (!toEmail) {
      return NextResponse.json(
        { success: false, error: "Email tujuan tidak ditemukan." },
        { status: 400 }
      );
    }

    const result = await sendAssignmentEmail({
      assigneeEmail: toEmail,
      assigneeName: "Test Assignee",
      ticketTitle: "Uji Coba Notifikasi Penugasan Tiket",
      ticketId: "test-id",
      projectName: "Arul-Pani Agency",
      assignedByName: "System Admin",
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      description: "Ini adalah email tes penugasan tugas dari sistem Arul-Pani Agency.",
    });

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Gagal mengirim email. Periksa konfigurasi GMAIL_USER dan GMAIL_APP_PASSWORD di .env",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email uji coba berhasil dikirim ke ${toEmail}`,
      messageId: result.messageId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Email Test Exception]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}