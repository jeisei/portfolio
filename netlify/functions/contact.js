import { validateMessage } from '../../shared/contact-fields.js';

const maxRequestBytes = 24_000;
const resendEndpoint = 'https://api.resend.com/emails';

function response(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function readBody(request) {
  if (!request.body || Number(request.headers.get('content-length')) > maxRequestBytes) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let json = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maxRequestBytes) {
        await reader.cancel();
        return null;
      }
      json += decoder.decode(value, { stream: true });
    }
    return JSON.parse(json + decoder.decode());
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export function createContactHandler(env = process.env, send = fetch) {
  const { CONTACT_FROM_EMAIL: from, CONTACT_TO_EMAIL: to, RESEND_API_KEY: key } = env;
  const available = Boolean(from && to && key);

  return async function handleContact(request) {
    if (request.method === 'GET') return response({ available });
    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'GET, POST' } });
    }
    if (!available) return response({ error: 'Email delivery is not configured' }, 503);

    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return response({ error: 'Forbidden' }, 403);
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
      return response({ error: 'Send a JSON body' }, 415);
    }

    const body = await readBody(request);
    if (body?.website) return response({ error: 'Invalid submission' }, 400);
    const { values, error } = validateMessage(body);
    if (error) return response({ error }, 400);

    try {
      const delivery = await send(resendEndpoint, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: values.email,
          subject: 'Portfolio: ' + values.subject,
          text: ['Name: ' + values.name, 'Email: ' + values.email, '', values.message].join('\n'),
        }),
        signal: AbortSignal.timeout(9000),
      });
      if (delivery.ok && (await delivery.json()).id) return response({ sent: true });
    } catch {
      return response({ error: 'Email delivery failed' }, 502);
    }
    return response({ error: 'Email delivery failed' }, 502);
  };
}

export const config = {
  rateLimit: { windowLimit: 12, windowSize: 60, aggregateBy: ['ip'] },
};

export default createContactHandler();
