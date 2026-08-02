import { EmailTemplate } from '@/components/email/email-template';
import { Resend } from 'resend';

export async function POST() {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return Response.json(
        { success: false, error: 'RESEND_API_KEY belum dikonfigurasi di environment.' },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: 'Sejiwa <[EMAIL_ADDRESS]>',
      to: ['[EMAIL_ADDRESS]'],
      subject: 'Ticket Baru Dibuat',
      react: EmailTemplate({ firstName: 'John' }),
    });

    if (error) {
      console.error('[Resend Error]', JSON.stringify(error, null, 2));
      return Response.json(
        { success: false, error: { name: error.name, message: error.message } },
        { status: 500 }
      );
    }

    console.log('[Resend Success]', data);
    return Response.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Resend Exception]', message);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}