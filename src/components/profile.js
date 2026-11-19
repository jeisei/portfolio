import { element, icon, safeUrl, setLink } from './dom.js';

export function renderCv(container, path) {
  const href = safeUrl(path);
  const link = element(href ? 'a' : 'button', 'action about__cv-link');
  if (href) {
    setLink(link, href, true);
    link.setAttribute('aria-label', 'View CV (opens in a new tab)');
  } else {
    link.type = 'button';
    link.disabled = true;
    link.setAttribute('aria-label', 'View CV');
  }
  link.append(icon('file'), 'View CV');
  container.append(link);
}

export function renderContacts(container, contacts) {
  for (const contact of contacts) {
    const item = element('li');
    const href = safeUrl(contact.href, ['https:', 'mailto:', 'tel:']);
    const row = element(href ? 'a' : 'div', 'contact__method');
    if (href) setLink(row, href, href.startsWith('https:'));

    const mark = element('span', 'contact__mark');
    mark.append(icon(contact.icon));
    const destination = element('span', 'contact__destination');
    destination.setAttribute('data-dust-shape', '');
    destination.append(
      element('span', 'contact__name', contact.name),
      element('span', 'contact__address', href ? contact.label : 'Coming soon'),
    );
    if (href) destination.append(icon('arrow-right'));
    row.append(mark, destination);
    item.append(row);
    container.append(item);
  }
}
