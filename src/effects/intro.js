import { butterflyImages, butterflyRestingPoint } from './butterfly.js';
import { finePointer, motionPreference } from './canvas.js';
import { createIntroDust } from './intro-dust.js';

const introDuration = 2500;
const gatherDuration = 1400;
const earliestFinish = 1800;

function preloadImage(url) {
  const image = new Image();
  image.src = url;
  return image.decode();
}

export function playIntro(intro, title, onComplete) {
  const root = document.documentElement;

  function startWhenVisible() {
    if (motionPreference.matches || (location.hash && location.hash !== '#welcome')) {
      document.removeEventListener('visibilitychange', startWhenVisible);
      root.classList.remove('page--intro-pending');
      onComplete();
      return;
    }

    if (document.hidden) {
      document.addEventListener('visibilitychange', startWhenVisible);
      return;
    }

    document.removeEventListener('visibilitychange', startWhenVisible);
    startIntro(intro, title, onComplete);
  }

  startWhenVisible();
}

function startIntro(intro, title, onComplete) {
  const root = document.documentElement;
  const main = document.querySelector('main');
  const skipLink = document.querySelector('.skip-link');
  const loading = intro.querySelector('.intro__loading');
  const label = intro.querySelector('.intro__label');
  const progress = intro.querySelector('progress');
  const skip = intro.querySelector('.intro__skip');
  const animatedButterfly = finePointer.matches;
  const dust = createIntroDust(intro.querySelector('canvas'), title, butterflyRestingPoint, animatedButterfly);
  if (!dust) {
    root.classList.remove('page--intro-pending');
    onComplete();
    return;
  }

  let done = false;
  let frame;
  let completedAssets = 0;
  let settledAssets = 0;
  let formingSince = null;
  const start = performance.now();

  main.inert = true;
  skipLink.inert = true;
  intro.hidden = false;
  intro.inert = false;
  intro.removeAttribute('aria-hidden');
  root.classList.remove('page--intro-pending');
  root.classList.add('page--intro-running');
  window.scrollTo({ top: 0, behavior: 'instant' });

  const assets = [
    document.fonts.load('300 54px "Manrope Variable"'),
    ...(animatedButterfly ? butterflyImages.map(preloadImage) : []),
  ];
  function finish({ immediate = false, focus = false } = {}) {
    if (done) return;
    done = true;
    cancelAnimationFrame(frame);
    clearTimeout(deadline);
    window.removeEventListener('resize', resize);
    motionPreference.removeEventListener('change', onMotionChange);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    main.inert = false;
    skipLink.inert = false;
    intro.inert = true;
    intro.setAttribute('aria-hidden', 'true');
    root.classList.remove('page--intro-running');
    if (immediate) intro.hidden = true;
    else {
      intro.classList.add('intro--exiting');
      setTimeout(() => { intro.hidden = true; }, 290);
    }
    if (focus) document.querySelector('.welcome__scroll').focus({ preventScroll: true });
    onComplete();
  }

  function onMotionChange() {
    if (motionPreference.matches) finish({ immediate: true });
  }

  function onVisibilityChange() {
    if (document.hidden) finish({ immediate: true });
  }

  function resize() {
    dust.prepare();
  }

  for (const asset of assets) {
    Promise.resolve(asset).then(() => {
      if (done) return;
      completedAssets++;
      const percentage = Math.floor(completedAssets * 100 / assets.length);
      progress.value = percentage;
      label.textContent = 'Loading ' + percentage + '%';
    }).catch(() => {
      // The title can still form if a decorative asset fails to load.
    }).finally(() => { settledAssets++; });
  }

  function draw(time) {
    if (done) return;
    const elapsed = time - start;
    if (formingSince === null && elapsed > 470 && (settledAssets === assets.length || elapsed > 920)) {
      formingSince = time;
      dust.prepare();
    }
    const remaining = Math.max(1, introDuration - (formingSince - start));
    const gather = formingSince === null ? 0 : Math.min(1, (time - formingSince) / Math.min(gatherDuration, remaining));
    loading.style.opacity = String(Math.max(0, 1 - gather * 2.2));
    dust.draw(elapsed, gather, Math.max(0, (gather - .8) * 4));
    if (gather >= 1 && elapsed > earliestFinish) finish();
    else frame = requestAnimationFrame(draw);
  }

  const deadline = setTimeout(finish, introDuration);
  skip.addEventListener('click', () => finish({ immediate: true, focus: true }), { once: true });
  window.addEventListener('resize', resize, { passive: true });
  motionPreference.addEventListener('change', onMotionChange);
  document.addEventListener('visibilitychange', onVisibilityChange);
  frame = requestAnimationFrame(draw);
}
