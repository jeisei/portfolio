import { portraitOutline } from '../../shared/portrait-silhouette.js';
import { finePointer, motionPreference } from './canvas.js';

export function mountPortraitReveal(portrait) {
  const overlay = portrait.querySelector('[data-surfer]');
  const reveal = overlay.parentElement;
  const art = reveal.parentElement;
  const transform = portrait.querySelector('[data-portrait-transform]');
  const outlineContext = document.createElement('canvas').getContext('2d');
  const outline = new Path2D(portraitOutline);
  let ready = false;
  let active = false;
  let center;
  let target;
  let offset = { x: 0, y: 0 };
  let frame = 0;
  let lastTime = 0;
  let isSurfer = false;
  let sweepFrame = 0;

  function resetTransform() {
    cancelAnimationFrame(sweepFrame);
    sweepFrame = 0;
    isSurfer = false;
    portrait.classList.remove('portrait--sweep', 'portrait--returning');
    transform.textContent = 'Become Silver Surfer';
    transform.removeAttribute('aria-disabled');
  }

  transform.addEventListener('click', () => {
    if (!ready || finePointer.matches || sweepFrame) return;
    const duration = motionPreference.matches ? 0 : 1850;
    let started;
    portrait.classList.add('portrait--sweep');
    portrait.classList.toggle('portrait--returning', isSurfer);
    transform.setAttribute('aria-disabled', 'true');

    function paintSweep(time) {
      started ??= time;
      const progress = duration ? Math.min(1, (time - started) / duration) : 1;
      const eased = progress * progress * (3 - 2 * progress);
      portrait.style.setProperty('--sweep-edge', (-10 + 132 * eased) + '%');
      if (progress < 1) {
        sweepFrame = requestAnimationFrame(paintSweep);
        return;
      }
      sweepFrame = 0;
      if (isSurfer) {
        resetTransform();
      } else {
        isSurfer = true;
        transform.textContent = 'Return to human';
        transform.removeAttribute('aria-disabled');
      }
    }

    if (duration) {
      portrait.style.setProperty('--sweep-edge', '-10%');
      sweepFrame = requestAnimationFrame(paintSweep);
    } else {
      paintSweep(performance.now());
    }
  });

  function hide() {
    portrait.classList.remove('portrait--revealed');
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    center = null;
  }

  function paint() {
    portrait.style.setProperty('--reveal-x', center.x + 'px');
    portrait.style.setProperty('--reveal-y', center.y + 'px');
    portrait.style.setProperty('--surfer-x', (center.x + offset.x) + 'px');
    portrait.style.setProperty('--surfer-y', (center.y + offset.y) + 'px');
  }

  function track(time) {
    const dt = Math.min(32, time - (lastTime || time - 16));
    const follow = 1 - Math.exp(-dt / 40);
    lastTime = time;
    center.x += (target.x - center.x) * follow;
    center.y += (target.y - center.y) * follow;
    if (Math.hypot(target.x - center.x, target.y - center.y) < .5) {
      center = { ...target };
      frame = 0;
      lastTime = 0;
    } else {
      frame = requestAnimationFrame(track);
    }
    paint();
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !overlay.hasAttribute('src')) {
      overlay.src = '/media/silver-surfer.webp';
    }
  }, { rootMargin: '300px' });

  function sync() {
    const touch = !finePointer.matches;
    active = !touch && !motionPreference.matches;
    transform.hidden = !touch || !ready;
    if (!touch) resetTransform();
    if (!active) hide();
    if (active || touch) observer.observe(portrait);
    else observer.unobserve(portrait);
  }

  overlay.addEventListener('load', () => {
    ready = true;
    observer.unobserve(portrait);
    transform.hidden = finePointer.matches;
  });
  overlay.addEventListener('error', hide);
  art.addEventListener('pointermove', (event) => {
    if (!ready || !active || event.pointerType === 'touch') return;
    const { left, top, width, height } = art.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;
    if (outlineContext && !outlineContext.isPointInPath(outline, x * 1102 / width, y * 1427 / height)) {
      hide();
      return;
    }
    target = { x, y };
    if (!center) {
      const overlayBox = reveal.getBoundingClientRect();
      offset = { x: left - overlayBox.left, y: top - overlayBox.top };
      center = { ...target };
      portrait.style.setProperty('--reveal-radius', Math.min(198.45, Math.max(85.05, width * .2997)) + 'px');
      paint();
      portrait.classList.add('portrait--revealed');
    } else if (!frame) {
      frame = requestAnimationFrame(track);
    }
  }, { passive: true });
  art.addEventListener('pointerleave', hide);
  window.addEventListener('scroll', hide, { passive: true });
  window.addEventListener('resize', hide, { passive: true });
  finePointer.addEventListener('change', sync);
  motionPreference.addEventListener('change', sync);
  sync();
}
