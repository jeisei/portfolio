import { finePointer, motionPreference } from '../effects/canvas.js';
import { assemblyDuration } from '../effects/section-assembly.js';

const scrollDuration = 520;
const dustTravelStart = .05;

const clamp = (value) => Math.min(1, Math.max(0, value));
const smooth = (value) => value * value * (3 - 2 * value);

export function createSectionScroller({ welcome, about, scene }) {
  const root = document.documentElement;
  let frame = 0;
  let destination = null;
  let dustActive = false;
  let queued = null;
  let viewportWidth = window.innerWidth;

  function finish({ jump = false, proceed = false } = {}) {
    if (!destination) return;
    cancelAnimationFrame(frame);
    frame = 0;
    if (jump) destination.scrollIntoView({ block: 'start', behavior: 'instant' });
    if (dustActive) scene.finish();
    root.classList.remove('page--assembly-active');
    destination = null;
    dustActive = false;
    const next = queued;
    queued = null;
    if (proceed && next) move(next.section, next.options);
  }

  function move(section, options = {}) {
    if (destination === section) {
      options.onStart?.();
      return;
    }
    if (dustActive && !motionPreference.matches && !document.hidden) {
      queued = { section, options };
      return;
    }

    finish();
    options.onStart?.();
    const from = window.scrollY;
    const distance = section.getBoundingClientRect().top;
    if (motionPreference.matches || document.hidden) {
      scene.markShown(section);
      if (Math.abs(distance) >= 2) window.scrollTo({ top: from + distance, behavior: 'instant' });
      return;
    }

    const fromWelcome = section === about && Math.abs(welcome.getBoundingClientRect().top) < 18;
    dustActive = scene.prepare(section, { fromWelcome });
    if (!dustActive && Math.abs(distance) < 2) return;
    const duration = dustActive ? assemblyDuration : scrollDuration;
    const travelStart = dustActive && fromWelcome ? dustTravelStart * assemblyDuration : 0;
    const started = performance.now();
    destination = section;
    root.classList.toggle('page--assembly-active', dustActive);

    function render(time) {
      const progress = clamp((time - started) / duration);
      const travel = clamp((time - started - travelStart) / (scrollDuration - travelStart));
      const offset = distance * smooth(travel);
      window.scrollTo({ top: from + offset, behavior: 'instant' });
      if (dustActive) scene.draw(progress, distance - offset);
      if (progress < 1) frame = requestAnimationFrame(render);
      else finish({ proceed: true });
    }
    frame = requestAnimationFrame(render);
  }

  window.addEventListener('resize', () => {
    if (finePointer.matches || viewportWidth !== window.innerWidth) finish({ jump: true });
    viewportWidth = window.innerWidth;
  }, { passive: true });
  window.addEventListener('popstate', (event) => {
    finish();
    const position = event.state?.sectionScrollY;
    if (!Number.isFinite(position)) return;
    // Restore after the browser has applied its default fragment scroll.
    const url = location.href;
    requestAnimationFrame(() => {
      if (location.href === url && !destination) window.scrollTo({ top: position, behavior: 'instant' });
    });
  });
  window.addEventListener('hashchange', () => finish());
  motionPreference.addEventListener('change', () => finish({ jump: true }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish({ jump: true }); });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    finish({ jump: true });
  });
  return {
    move,
    get destination() { return destination; },
    get active() { return destination !== null; },
  };
}
