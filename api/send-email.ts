import type { VercelRequest, VercelResponse } from '@vercel/node';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured' });
  }

  try {
    const { type, data } = req.body;

    let subject: string;
    let html: string;

    if (type === 'contact') {
      subject = `Formularz kontaktowy: ${data.subject}`;
      html = `
        <h2>Nowa wiadomość z formularza kontaktowego</h2>
        <p><strong>Imię i nazwisko:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Temat:</strong> ${data.subject}</p>
        <hr />
        <p>${data.message.replace(/\n/g, '<br />')}</p>
      `;
    } else if (type === 'youth') {
      subject = `Zgłoszenie na trening - ${data.childName}`;
      html = `
        <h2>Nowe zgłoszenie na trening młodzieżowy</h2>
        <p><strong>Imię dziecka:</strong> ${data.childName}</p>
        <p><strong>Wiek:</strong> ${data.age}</p>
        <p><strong>Rodzic:</strong> ${data.parentName}</p>
        <p><strong>Telefon:</strong> ${data.phone}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Preferowana grupa:</strong> ${data.group}</p>
      `;
    } else {
      return res.status(400).json({ error: 'Unknown form type' });
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Liszczanka <onboarding@resend.dev>',
        to: ['liszczanka.liszki@gmail.com'],
        subject,
        html,
        reply_to: data.email,
      }),
    });

    const result = await resendRes.json();

    if (!resendRes.ok) {
      throw new Error(`Resend API error [${resendRes.status}]: ${JSON.stringify(result)}`);
    }

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
}
