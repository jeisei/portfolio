export const fieldLimits = { name: 100, email: 254, subject: 160, message: 4000 };

export function validateMessage(input) {
  if (!input || typeof input !== 'object') return { error: 'Enter a valid message.' };
  const values = {};
  for (const [field, limit] of Object.entries(fieldLimits)) {
    const value = typeof input[field] === 'string' ? input[field].trim() : '';
    if (!value || value.length > limit) {
      return { field, error: 'Enter a valid ' + field + ' (up to ' + limit + ' characters).' };
    }
    values[field] = value.replace(/\u0000/g, '');
  }

  if (!/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(values.email)) {
    return { field: 'email', error: 'Enter a valid email address.' };
  }
  if (/[\u0000-\u001f\u007f]/.test(values.subject) || /[\r\n]/.test(values.name)) {
    return { error: 'Use a single line for your name and subject.' };
  }
  return { values };
}
