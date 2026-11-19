import { element, icon, safeUrl, setLink } from './dom.js';

export function mountTabs(tablist) {
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  function select(index, focus = false) {
    for (const [position, tab] of tabs.entries()) {
      const active = index === position;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      panel.hidden = !active;
      panel.inert = !active;
    }
    tablist.classList.toggle('portfolio__tabs--skills', tabs[index].id === 'skills-tab');
    if (focus) tabs[index].focus({ preventScroll: true });
  }

  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', (event) => {
      const positions = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: tabs.length - 1 };
      if (!Object.hasOwn(positions, event.key)) return;
      event.preventDefault();
      select((positions[event.key] + tabs.length) % tabs.length, true);
    });
  }
  return select;
}

function projectPreview(project) {
  const preview = element('div', 'project-card__preview');
  preview.setAttribute('data-dust-shape', '');
  const source = safeUrl(project?.image);
  if (!source) {
    preview.setAttribute('aria-hidden', 'true');
    return preview;
  }

  preview.classList.add('project-card__preview--image');
  const image = element('img', 'project-card__image');
  image.src = source;
  image.alt = project.imageAlt || '';
  image.loading = 'lazy';
  image.decoding = 'async';
  if (project.imageLayout === 'cinematic' || project.imageLayout === 'framed') {
    preview.classList.add('project-card__preview--' + project.imageLayout);
    const backdrop = element('img', 'project-card__backdrop');
    backdrop.src = source;
    backdrop.alt = '';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.loading = 'lazy';
    backdrop.decoding = 'async';
    preview.append(backdrop);
  }
  preview.append(image);
  return preview;
}

export function renderProjects(container, projects) {
  for (const [index, project] of projects.entries()) {
    const card = element('li', 'project-card');
    card.append(projectPreview(project));
    if (project) {
      card.append(
        element('h3', 'project-card__title', project.title),
        element('p', 'project-card__summary', project.summary),
      );
    }

    const actions = element('div', 'project-card__actions');
    const href = safeUrl(project?.url);
    const visit = element(href ? 'a' : 'button', 'project-card__button', 'Visit Website');
    visit.append(icon('arrow-up-right'));
    actions.append(visit);
    if (href) {
      setLink(visit, href, true);
      visit.setAttribute('aria-label', 'Visit Website for ' + project.title + ' (opens in a new tab)');
    } else {
      visit.type = 'button';
      visit.disabled = true;
      visit.setAttribute('aria-label', 'Visit Website for project ' + (index + 1));
      const status = element('span', 'project-card__status', 'Coming soon');
      status.id = 'project-status-' + (index + 1);
      visit.setAttribute('aria-describedby', status.id);
      actions.append(status);
    }
    card.append(actions);
    container.append(card);
  }
}

export function renderSkills(container, skills) {
  for (const { name, mark } of skills) {
    const tile = element('li', 'skills__tile');
    tile.setAttribute('data-dust-shape', '');
    tile.title = name;
    const image = element('img', 'skills__mark');
    image.src = '/media/brands/' + mark + '.svg';
    image.alt = name;
    image.width = 84;
    image.height = 84;
    image.loading = 'lazy';
    tile.append(image);
    container.append(tile);
  }
}
