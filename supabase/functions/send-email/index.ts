const ALLOWED_ORIGINS = [
  'https://www.liszczanka.pl',
  'https://id-preview--482e1b89-860d-4b66-899c-349bfdeb7a5b.lovable.app',
  'https://482e1b89-860d-4b66-899c-349bfdeb7a5b.lovableproject.com',
];

const getCorsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
});

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { type, data } = await req.json();

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
      return new Response(JSON.stringify({ error: 'Unknown form type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch('https://api.resend.com/emails', {
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

    const result = await res.json();

    if (!res.ok) {
      throw new Error(`Resend API error [${res.status}]: ${JSON.stringify(result)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
