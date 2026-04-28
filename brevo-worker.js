// Cloudflare Worker — brevo-subscribe.kuba-houser.workers.dev
// Deploy via: Cloudflare Dashboard → Workers & Pages → Edit Code
// Requires env secret: BREVO_KEY

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    let email;
    try {
      const body = await request.json();
      email = body.email;
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    if (!email || !email.includes('@')) {
      return new Response('Invalid email', { status: 400 });
    }

    const headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': env.BREVO_KEY
    };

    // 1. Add contact to Brevo list #2
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        listIds: [2],
        updateEnabled: true
      })
    });

    // 2. Send notification to info@cashpoolmodel.com
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sender: { name: 'CashPoolModel', email: 'info@cashpoolmodel.com' },
        to: [{ email: 'info@cashpoolmodel.com' }],
        subject: 'New waitlist signup — CashPoolModel',
        htmlContent: `<p>New signup: <strong>${email}</strong></p>`
      })
    });

    // 3. Send welcome email to new subscriber
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sender: { name: 'CashPoolModel', email: 'info@cashpoolmodel.com' },
        to: [{ email }],
        subject: 'You are on the list — CashPoolModel',
        htmlContent: `
          <div style="font-family:'DM Sans',sans-serif;max-width:520px;margin:0 auto;color:#1a2233">
            <div style="border-bottom:2px solid #0b1929;padding-bottom:20px;margin-bottom:28px">
              <span style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#0b1929">CashPoolModel</span>
              <span style="font-size:11px;color:#9babbe;margin-left:8px">by Intercompany.io</span>
            </div>
            <p style="font-size:15px;line-height:1.7;margin-bottom:16px">You are on the early access list.</p>
            <p style="font-size:14px;color:#3d4f6a;line-height:1.7;margin-bottom:24px">
              We will notify you the moment the simulator goes live. Early access users receive their first PDF report at no charge.
            </p>
            <p style="font-size:13px;color:#6b7d96;line-height:1.7;margin-bottom:32px">
              In the meantime, our treasury insights blog covers practical cash pooling topics — netting efficiency, transfer pricing, bank RFP strategy, and more.
            </p>
            <a href="https://cashpoolmodel.com/blog.html"
               style="display:inline-block;background:#0b1929;color:#fff;padding:11px 24px;border-radius:5px;font-size:13px;font-weight:600;text-decoration:none">
              Read Treasury Insights →
            </a>
            <div style="margin-top:40px;padding-top:20px;border-top:1px solid #ddd9d0;font-size:11px;color:#9babbe">
              Intercompany.io · Rue François-Perréard 19, 1225 Chêne-Bourg, Switzerland<br>
              <a href="https://cashpoolmodel.com" style="color:#9babbe">cashpoolmodel.com</a>
            </div>
          </div>
        `
      })
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
