import { validateMessage } from '../../shared/contact-fields.js';

export async function mountContactForm(form) {
  const status = form.querySelector('.message-form__status');
  const submit = form.querySelector('button[type="submit"]');
  let available = false;
  let sending = false;

  function setStatus(text, error = false) {
    status.textContent = text;
    status.classList.toggle('message-form__status--error', error);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!available || sending) return;
    const input = Object.fromEntries(new FormData(form));
    const validation = validateMessage(input);
    if (validation.error) {
      setStatus(validation.error, true);
      if (validation.field) form.elements.namedItem(validation.field)?.focus();
      return;
    }

    sending = true;
    form.setAttribute('aria-busy', 'true');
    submit.setAttribute('aria-disabled', 'true');
    setStatus('Sending your message…');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(15000),
      });
      if (response.status === 429) {
        setStatus('Too many messages. Wait a minute and try again.', true);
        return;
      }
      if (!response.ok || !(await response.json()).sent) throw new Error('Delivery was not confirmed');
      form.reset();
      setStatus('Message sent. Thank you for getting in touch.');
    } catch {
      setStatus('Your message could not be sent. Try again or use the email link.', true);
    } finally {
      sending = false;
      form.removeAttribute('aria-busy');
      submit.setAttribute('aria-disabled', 'false');
    }
  });

  try {
    const response = await fetch(form.action, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    available = response.ok && Boolean((await response.json()).available);
  } catch {
    available = false;
  }
  submit.setAttribute('aria-disabled', String(!available));
  setStatus(available ? '' : 'Email delivery is not configured. You can contact me by email.');
}
