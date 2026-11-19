import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createContactHandler } from '../../netlify/functions/contact.js';

const endpoint = 'http://localhost/.netlify/functions/contact';
const env = { CONTACT_FROM_EMAIL: 'portfolio@example.com', CONTACT_TO_EMAIL: 'owner@example.com', RESEND_API_KEY: 'test' };
const message = { name: 'Test Visitor', email: 'visitor@example.com', subject: 'Test', message: 'A test message' };

function request(body, headers = {}) {
  return new Request(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

test('reports unconfigured delivery and refuses to send', async () => {
  const handler = createContactHandler({});
  assert.deepEqual(await (await handler(new Request(endpoint))).json(), { available: false });
  assert.equal((await handler(request(message))).status, 503);
});

test('uses the fixed recipient and visitor Reply-To and returns success after provider confirmation', async () => {
  const handler = createContactHandler(env, async (url, parameters) => {
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(parameters.headers.Authorization, 'Bearer test');
    const sent = JSON.parse(parameters.body);
    assert.deepEqual(sent.to, [env.CONTACT_TO_EMAIL]);
    assert.equal(sent.from, env.CONTACT_FROM_EMAIL);
    assert.equal(sent.reply_to, message.email);
    assert.match(sent.text, /A test message/);
    return Response.json({ id: 'test-email-id' });
  });
  assert.deepEqual(await (await handler(new Request(endpoint))).json(), { available: true });
  assert.deepEqual(await (await handler(request({ ...message, to: 'ignored@example.com' }))).json(), { sent: true });
});

test('rejects invalid submissions before calling the provider', async () => {
  let deliveries = 0;
  const handler = createContactHandler(env, async () => { deliveries++; });
  assert.equal((await handler(request({ ...message, email: 'bad-email' }))).status, 400);
  assert.equal((await handler(request({ ...message, subject: 'Hello\r\nBcc: example@example.com' }))).status, 400);
  assert.equal((await handler(request({ ...message, website: 'bot' }))).status, 400);
  assert.equal((await handler(request({ ...message, message: 'a'.repeat(26000) }))).status, 400);
  assert.equal((await handler(request(message, { Origin: 'https://unrelated.example' }))).status, 403);
  assert.equal(deliveries, 0);
});

test('requires an acceptance ID and reports provider failure', async () => {
  const failure = createContactHandler(env, async () => Response.json({ error: 'failed' }, { status: 500 }));
  assert.equal((await failure(request(message))).status, 502);
  const empty = createContactHandler(env, async () => Response.json({}));
  assert.equal((await empty(request(message))).status, 502);
});
