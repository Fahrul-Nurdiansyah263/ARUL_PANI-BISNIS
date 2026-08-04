import nodemailer from "nodemailer";

/**
 * Membuat transporter Nodemailer untuk Gmail SMTP.
 */
function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass || user.includes("email-anda@gmail.com")) {
    console.warn(
      "[Email Service] GMAIL_USER atau GMAIL_APP_PASSWORD belum dikonfigurasi secara valid di file .env."
    );
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user.trim(),
      // Menghapus spasi pada App Password jika ada
      pass: pass.replace(/\s+/g, "").trim(),
    },
  });
}

const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

interface SendAssignmentEmailParams {
  assigneeEmail: string;
  assigneeName: string;
  ticketTitle: string;
  ticketId: string;
  projectName?: string | null;
  assignedByName: string;
  deadline?: Date | string | null;
  description?: string | null;
}

/**
 * 1. Kirim Email Notifikasi Penugasan Tiket (Assignment)
 */
export async function sendAssignmentEmail(params: SendAssignmentEmailParams) {
  try {
    const transporter = getTransporter();
    if (!transporter) return;

    const deadlineFormatted = params.deadline
      ? new Date(params.deadline).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Tidak ada deadline";

    const senderEmail = process.env.GMAIL_USER || "";
    const ticketUrl = `${APP_URL}/dashboard/tickets`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f5f7; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <!-- Header -->
          <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">🏢 Arul-Pani Agency</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">Notifikasi Penugasan Tiket Baru</p>
          </div>

          <!-- Body -->
          <div style="padding: 24px;">
            <p style="font-size: 15px; margin-top: 0;">Halo <strong>${params.assigneeName}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
              Anda baru saja ditugaskan untuk mengerjakan tiket oleh <strong>${params.assignedByName}</strong>. Berikut adalah rincian tugas Anda:
            </p>

            <!-- Card Detail Tiket -->
            <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin: 20px 0;">
              <h2 style="margin: 0 0 8px 0; font-size: 16px; color: #1e293b;">${params.ticketTitle}</h2>
              <p style="margin: 4px 0; font-size: 13px; color: #64748b;">
                📁 <strong>Proyek:</strong> ${params.projectName || "Tanpa Proyek"}
              </p>
              <p style="margin: 4px 0; font-size: 13px; color: #64748b;">
                📅 <strong>Deadline:</strong> ${deadlineFormatted}
              </p>
              ${
                params.description
                  ? `<div style="margin-top: 10px; font-size: 13px; color: #475569; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
                      <strong>Deskripsi:</strong><br/>${params.description.slice(0, 150)}${params.description.length > 150 ? "..." : ""}
                     </div>`
                  : ""
              }
            </div>

            <!-- Tombol Aksi -->
            <div style="text-align: center; margin: 30px 0 10px 0;">
              <a href="${ticketUrl}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: bold; display: inline-block;">
                Buka Tiket di Dashboard
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
            Email ini dikirim secara otomatis oleh Arul-Pani Agency System.
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Arul-Pani Agency" <${senderEmail}>`,
      to: params.assigneeEmail,
      subject: `📌 [Penugasan Tiket] ${params.ticketTitle}`,
      html: htmlContent,
    });

    console.log(`[Gmail SMTP Success] Email penugasan terkirim ke ${params.assigneeEmail} (MsgID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error("[Gmail SMTP Error - Assignment Email]", error);
  }
}

interface SendDeadlineReminderParams {
  assigneeEmail: string;
  assigneeName: string;
  ticketTitle: string;
  ticketId: string;
  projectName?: string | null;
  deadline?: Date | string | null;
  status: string;
  hoursLeftText?: string;
}

/**
 * 2. Kirim Email Notifikasi Pengingat Deadline Tiket (Mendekati / Belum Selesai)
 */
export async function sendDeadlineReminderEmail(params: SendDeadlineReminderParams) {
  try {
    const transporter = getTransporter();
    if (!transporter) return;

    const deadlineFormatted = params.deadline
      ? new Date(params.deadline).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Tidak ditentukan";

    const senderEmail = process.env.GMAIL_USER || "";
    const ticketUrl = `${APP_URL}/dashboard/tickets`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f5f7; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <!-- Header Warning -->
          <div style="background-color: #dc2626; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px; font-weight: bold;">⚠️ Pengingat Tenggat Waktu (Deadline)</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #fecaca;">Tiket Pengerjaan Anda Belum Selesai</p>
          </div>

          <!-- Body -->
          <div style="padding: 24px;">
            <p style="font-size: 15px; margin-top: 0;">Halo <strong>${params.assigneeName}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
              Pengingat bahwa tiket berikut tenggat waktunya mendekati atau telah lewat dari jadwal, namun statusnya saat ini masih <strong>${params.status}</strong>:
            </p>

            <!-- Card Detail Tiket -->
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin: 20px 0;">
              <h2 style="margin: 0 0 8px 0; font-size: 16px; color: #991b1b;">${params.ticketTitle}</h2>
              <p style="margin: 4px 0; font-size: 13px; color: #7f1d1d;">
                📁 <strong>Proyek:</strong> ${params.projectName || "Tanpa Proyek"}
              </p>
              <p style="margin: 4px 0; font-size: 13px; color: #7f1d1d;">
                ⏰ <strong>Tenggat Waktu:</strong> ${deadlineFormatted} ${params.hoursLeftText ? `(${params.hoursLeftText})` : ""}
              </p>
              <p style="margin: 4px 0; font-size: 13px; color: #7f1d1d;">
                📊 <strong>Status Saat Ini:</strong> ${params.status}
              </p>
            </div>

            <p style="font-size: 13px; color: #64748b;">
              Mohon segera perbarui status tiket atau selesaikan tugas ini pada aplikasi.
            </p>

            <!-- Tombol Aksi -->
            <div style="text-align: center; margin: 30px 0 10px 0;">
              <a href="${ticketUrl}" style="background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: bold; display: inline-block;">
                Buka Tiket Sekarang
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
            Email pengingat ini dikirim otomatis oleh Arul-Pani Agency System.
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Arul-Pani Agency" <${senderEmail}>`,
      to: params.assigneeEmail,
      subject: `⏰ [Pengingat Deadline] Tiket "${params.ticketTitle}" Belum Selesai`,
      html: htmlContent,
    });

    console.log(`[Gmail SMTP Success] Email pengingat deadline terkirim ke ${params.assigneeEmail} (MsgID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error("[Gmail SMTP Error - Deadline Email]", error);
  }
}
