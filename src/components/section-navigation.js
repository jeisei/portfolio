const compactNavigation = matchMedia('(max-width: 767px)');

export function mountSectionLink(link, scroller, onNavigate) {
  const hash = link.hash;
  const section = document.getElementById(hash.slice(1));
  if (!section) return;
  link.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    scroller.move(section, {
      onStart() {
        onNavigate?.();
        if (location.hash !== hash) {
          history.replaceState({ ...history.state, sectionScrollY: window.scrollY }, '');
          history.pushState(null, '', hash);
        }
        section.focus({ preventScroll: true });
      },
    });
  });
}

export function mountSectionNavigation(header, scroller, markViewed) {
  const toggle = header.querySelector('.site-nav__toggle');
  const panel = header.querySelector('.site-nav__panel');
  const links = Array.from(panel.querySelectorAll('a'));
  const sections = links.map((link) => document.getElementById(link.hash.slice(1)));
  let expanded = false;
  let active = 0;
  let pendingFrame = 0;

  function setExpanded(value) {
    expanded = value && compactNavigation.matches;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
    panel.hidden = compactNavigation.matches && !expanded;
  }

  function syncLayout() {
    const compact = compactNavigation.matches;
    const focused = document.activeElement;
    header.classList.toggle('site-nav--compact', compact);
    toggle.hidden = !compact;
    setExpanded(false);
    if (compact && panel.contains(focused)) toggle.focus();
    if (!compact && focused === toggle) links[active].focus();
  }

  function updateActiveSection() {
    pendingFrame = 0;
    const scanLine = Math.max(header.getBoundingClientRect().bottom + 12, window.innerHeight * .2);
    const section = scroller.destination ?? sections.findLast((candidate) => candidate.getBoundingClientRect().top <= scanLine);
    if (!section) return;
    if (!scroller.active) markViewed(section);
    const index = sections.indexOf(section);
    if (index === active) return;
    links[active].removeAttribute('aria-current');
    links[index].setAttribute('aria-current', 'location');
    active = index;
    header.style.setProperty('--active-section', String(index));
  }

  function scheduleUpdate() {
    if (!pendingFrame) pendingFrame = requestAnimationFrame(updateActiveSection);
  }

  function closeOutside(event) {
    if (expanded && !header.contains(event.target)) setExpanded(false);
  }

  toggle.addEventListener('click', () => setExpanded(!expanded));
  header.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !expanded) return;
    event.stopPropagation();
    setExpanded(false);
    toggle.focus();
  });
  document.addEventListener('pointerdown', closeOutside);
  document.addEventListener('focusin', closeOutside);
  compactNavigation.addEventListener('change', syncLayout);
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  window.addEventListener('pageshow', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);

  for (const link of links) mountSectionLink(link, scroller, () => setExpanded(false));
  const linkedSection = sections.find((section) => '#' + section.id === location.hash);
  if (linkedSection) markViewed(linkedSection);
  syncLayout();
  scheduleUpdate();
}
