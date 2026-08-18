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
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
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
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Tidak ada batas waktu";

    const senderEmail = process.env.GMAIL_USER || "";
    const ticketUrl = `${APP_URL}/dashboard/tickets`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 32px 16px; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);">
          
          <!-- Brand Header -->
          <div style="padding: 24px 28px 20px 28px; border-bottom: 1px solid #f4f4f5; display: flex; align-items: center; justify-content: space-between;">
            <div style="font-size: 14px; font-weight: 700; letter-spacing: -0.2px; color: #09090b;">
              ARUL-PANI <span style="font-weight: 400; color: #71717a;">AGENCY</span>
            </div>
          </div>

          <!-- Main Content -->
          <div style="padding: 28px;">
            <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.5; color: #27272a;">
              Hai <strong>${params.assigneeName}</strong>,
            </p>
            <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #52525b;">
              <strong>${params.assignedByName}</strong> baru saja menugaskan sebuah tiket untuk Anda kerjakan:
            </p>

            <!-- Ticket Card -->
            <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
              <h2 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #09090b; line-height: 1.4;">
                ${params.ticketTitle}
              </h2>
              
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #52525b;">
                ${
                  params.projectName
                    ? `<tr>
                        <td style="padding: 4px 0; width: 90px; color: #71717a;">Proyek</td>
                        <td style="padding: 4px 0; font-weight: 500; color: #18181b;">${params.projectName}</td>
                      </tr>`
                    : ""
                }
                <tr>
                  <td style="padding: 4px 0; width: 90px; color: #71717a;">Deadline</td>
                  <td style="padding: 4px 0; font-weight: 500; color: #18181b;">${deadlineFormatted}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; width: 90px; color: #71717a;">Diberikan oleh</td>
                  <td style="padding: 4px 0; font-weight: 500; color: #18181b;">${params.assignedByName}</td>
                </tr>
              </table>

              ${
                params.description
                  ? `<div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #e4e4e7; font-size: 13px; line-height: 1.5; color: #3f3f46;">
                      ${params.description.slice(0, 200)}${params.description.length > 200 ? "..." : ""}
                     </div>`
                  : ""
              }
            </div>

            <!-- CTA Button -->
            <div style="margin-top: 24px;">
              <a href="${ticketUrl}" style="display: inline-block; background-color: #09090b; color: #ffffff; font-size: 13px; font-weight: 500; text-decoration: none; padding: 10px 20px; border-radius: 8px; text-align: center;">
                Lihat di Board &rarr;
              </a>
            </div>
          </div>

          <!-- Subtle Footer -->
          <div style="padding: 16px 28px; background-color: #fafafa; border-top: 1px solid #f4f4f5; font-size: 12px; color: #a1a1aa; line-height: 1.5;">
            Notifikasi penugasan tiket &bull; Arul-Pani Agency
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"Arul-Pani" <${senderEmail}>`,
      to: params.assigneeEmail,
      subject: `${params.assignedByName} menugaskan Anda: "${params.ticketTitle}"`,
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
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Tidak ditentukan";

    const senderEmail = process.env.GMAIL_USER || "";
    const ticketUrl = `${APP_URL}/dashboard/tickets`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 32px 16px; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);">
          
          <!-- Brand Header -->
          <div style="padding: 24px 28px 20px 28px; border-bottom: 1px solid #f4f4f5; display: flex; align-items: center; justify-content: space-between;">
            <div style="font-size: 14px; font-weight: 700; letter-spacing: -0.2px; color: #09090b;">
              ARUL-PANI <span style="font-weight: 400; color: #71717a;">AGENCY</span>
            </div>
            <div style="display: inline-block; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 9999px; background-color: #fff7ed; color: #c2410c; border: 1px solid #ffedd5;">
              Pengingat Deadline
            </div>
          </div>

          <!-- Main Content -->
          <div style="padding: 28px;">
            <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.5; color: #27272a;">
              Hai <strong>${params.assigneeName}</strong>,
            </p>
            <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #52525b;">
              Tugas berikut mendekati batas waktu pengerjaan dan statusnya saat ini masih <strong style="color: #09090b;">${params.status}</strong>:
            </p>

            <!-- Ticket Card -->
            <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
              <h2 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #09090b; line-height: 1.4;">
                ${params.ticketTitle}
              </h2>
              
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #52525b;">
                ${
                  params.projectName
                    ? `<tr>
                        <td style="padding: 4px 0; width: 100px; color: #71717a;">Proyek</td>
                        <td style="padding: 4px 0; font-weight: 500; color: #18181b;">${params.projectName}</td>
                      </tr>`
                    : ""
                }
                <tr>
                  <td style="padding: 4px 0; width: 100px; color: #71717a;">Batas Waktu</td>
                  <td style="padding: 4px 0; font-weight: 600; color: #b91c1c;">
                    ${deadlineFormatted} ${params.hoursLeftText ? `(${params.hoursLeftText})` : ""}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; width: 100px; color: #71717a;">Status Saat Ini</td>
                  <td style="padding: 4px 0; font-weight: 500; color: #18181b;">${params.status}</td>
                </tr>
              </table>
            </div>

            <!-- CTA Button -->
            <div style="margin-top: 24px;">
              <a href="${ticketUrl}" style="display: inline-block; background-color: #09090b; color: #ffffff; font-size: 13px; font-weight: 500; text-decoration: none; padding: 10px 20px; border-radius: 8px; text-align: center;">
                Buka & Perbarui Tiket &rarr;
              </a>
            </div>
          </div>

          <!-- Subtle Footer -->
          <div style="padding: 16px 28px; background-color: #fafafa; border-top: 1px solid #f4f4f5; font-size: 12px; color: #a1a1aa; line-height: 1.5;">
            Pengingat batas waktu tiket &bull; Arul-Pani Agency
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"Arul-Pani" <${senderEmail}>`,
      to: params.assigneeEmail,
      subject: `[Pengingat] "${params.ticketTitle}" mendekati batas waktu (${params.hoursLeftText || 'H-1'})`,
      html: htmlContent,
    });

    console.log(`[Gmail SMTP Success] Email pengingat deadline terkirim ke ${params.assigneeEmail} (MsgID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error("[Gmail SMTP Error - Deadline Email]", error);
  }
}
