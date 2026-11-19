export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS(svg.namespaceURI, 'use');
  svg.classList.add('icon');
  svg.setAttribute('aria-hidden', 'true');
  use.setAttribute('href', '/icons.svg#' + name);
  svg.append(use);
  return svg;
}

export function safeUrl(value, protocols = ['https:', 'http:']) {
  if (!value) return null;
  try {
    const url = new URL(value, window.location.origin);
    return protocols.includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function setLink(node, href, external = false) {
  node.href = href;
  if (external) {
    node.target = '_blank';
    node.rel = 'noreferrer noopener';
  }
}
