import { finePointer, motionPreference } from './canvas.js';

export const butterflyImages = [
  '/media/butterfly-left.webp',
  '/media/butterfly-right.webp',
  '/media/butterfly-body.webp',
];

export function butterflyRestingPoint() {
  return { x: window.innerWidth * .815, y: window.innerHeight * .43 };
}

function keepInView(value, length, radius) {
  const padding = Math.min(radius, length / 2);
  return Math.min(length - padding, Math.max(padding, value));
}

export function mountButterfly(element, welcome) {
  let target = butterflyRestingPoint();
  let { x, y } = target;
  let radius = 0;
  let vx = 0;
  let vy = 0;
  let directionX = null;
  let frame = 0;
  let lastTime = 0;
  let introComplete = false;
  let welcomeRatio = 0;
  let lastPointer = 0;
  let flightTime = 0;
  const flightPhase = Math.random() * 2 * Math.PI;

  function draw(time) {
    const dt = Math.min(32, time - (lastTime || time)) / 1000;
    lastTime = time;
    if (!finePointer.matches) {
      flightTime += dt;
      const phase = flightTime + flightPhase;
      target.x = innerWidth * (.5 + .24 * Math.sin(phase * .67) + .09 * Math.sin(phase * 1.29));
      target.y = innerHeight * (.45 + .2 * Math.sin(phase * .51) + .08 * Math.cos(phase * 1.17));
    }
    const idle = time - lastPointer > 230;
    const destinationX = target.x + (idle ? Math.sin(time / 660) * 5 : 0);
    const destinationY = target.y + (idle ? Math.sin(time / 380) * 5 : 0);
    const drag = Math.exp(-dt * 12.3);
    vx = (vx + (destinationX - x) * dt * 112) * drag;
    vy = (vy + (destinationY - y) * dt * 112) * drag;
    x += vx * dt;
    y += vy * dt;
    if (!finePointer.matches && Math.abs(vx) > 14) {
      element.classList.toggle('butterfly--facing-left', vx < 0);
    }
    element.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%, -50%)';
    frame = requestAnimationFrame(draw);
  }

  function sync() {
    const inWelcome = welcomeRatio >= (finePointer.matches ? .45 : .85);
    const visible = introComplete && inWelcome && !motionPreference.matches && !document.hidden;
    element.classList.toggle('butterfly--visible', visible);
    if (visible && !frame) {
      radius = element.offsetWidth * .62;
      frame = requestAnimationFrame(draw);
    }
    if (!visible && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    }
  }

  new IntersectionObserver(([entry]) => {
    welcomeRatio = entry.intersectionRatio;
    sync();
  }, { threshold: [.45, .85] }).observe(welcome);

  window.addEventListener('pointermove', (event) => {
    if (!frame || !finePointer.matches || event.pointerType === 'touch') return;
    const horizontalTravel = event.clientX - (directionX ?? x);
    if (Math.abs(horizontalTravel) >= 18) {
      element.classList.toggle('butterfly--facing-left', horizontalTravel < 0);
      directionX = event.clientX;
    }
    const quiet = Boolean(event.target.closest?.('a, button, input, textarea'));
    element.classList.toggle('butterfly--quiet', quiet);
    const offset = radius * (quiet ? .7 : .27);
    const next = {
      x: keepInView(event.clientX + offset, window.innerWidth, radius),
      y: keepInView(event.clientY - offset, window.innerHeight, radius),
    };
    if (Math.hypot(next.x - target.x, next.y - target.y) < 2) return;
    lastPointer = performance.now();
    target = next;
  }, { passive: true });

  function rest() {
    const origin = butterflyRestingPoint();
    radius = element.offsetWidth * .62;
    target = {
      x: keepInView(origin.x, window.innerWidth, radius),
      y: keepInView(origin.y, window.innerHeight, radius),
    };
    directionX = null;
    element.classList.remove('butterfly--quiet', 'butterfly--facing-left');
  }
  window.addEventListener('resize', rest, { passive: true });
  document.documentElement.addEventListener('pointerleave', rest);
  document.addEventListener('visibilitychange', sync);
  finePointer.addEventListener('change', sync);
  motionPreference.addEventListener('change', sync);

  return () => {
    introComplete = true;
    sync();
  };
}
