import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendDeadlineReminderEmail } from "@/lib/services/email.service";

/**
 * Handler API untuk mengecek dan mengirim email pengingat deadline.
 * Dapat dipanggil secara manual dari dashboard atau via cron job.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Opsi otorisasi: Izinkan jika ada session user ATAU jika header Cron Secret sesuai
    const authHeader = req.headers.get("authorization");
    const isCronAuthorized =
      process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (!session?.user && !isCronAuthorized) {
      return NextResponse.json(
        { success: false, error: "Tidak memiliki hak akses" },
        { status: 401 }
      );
    }

    const companyId = session?.user?.companyId;
    const now = new Date();
    // Cari tiket yang deadlinenya sampai 48 jam ke depan (atau sudah terlewat)
    const thresholdDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const whereClause: any = {
      assigneeId: { not: null },
      status: { not: "DONE" },
      deadline: {
        not: null,
        lte: thresholdDate, // deadline <= 48 jam dari sekarang
      },
    };

    if (companyId) {
      whereClause.companyId = companyId;
    }

    const tickets = await db.ticket.findMany({
      where: whereClause,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    let sentCount = 0;
    const results = [];

    for (const ticket of tickets) {
      if (!ticket.assignee || !ticket.assignee.email || !ticket.deadline) {
        continue;
      }

      // Hitung sisa waktu
      const diffMs = ticket.deadline.getTime() - now.getTime();
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));

      let hoursLeftText = "";
      if (diffHours < 0) {
        hoursLeftText = `Terlewat ${Math.abs(diffHours)} jam`;
      } else if (diffHours === 0) {
        hoursLeftText = "Deadline kurang dari 1 jam lagi!";
      } else {
        hoursLeftText = `Sisa waktu ${diffHours} jam`;
      }

      const emailResult = await sendDeadlineReminderEmail({
        assigneeEmail: ticket.assignee.email,
        assigneeName: ticket.assignee.name,
        ticketTitle: ticket.title,
        ticketId: ticket.id,
        projectName: ticket.project?.name,
        deadline: ticket.deadline,
        status: ticket.status,
        hoursLeftText,
      });

      if (emailResult) {
        sentCount++;
      }

      results.push({
        ticketId: ticket.id,
        title: ticket.title,
        assignee: ticket.assignee.email,
        hoursLeftText,
        sent: !!emailResult,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil memproses ${tickets.length} tiket mendekati deadline.`,
      emailsSent: sentCount,
      details: results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Deadline Reminder API Error]", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}
