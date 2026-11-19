import { finePointer, fitCanvas, motionPreference } from './canvas.js';

const lifetime = 600;
const maxPoints = 19;
const maxTrailLength = 210;

export function mountCursorTrail(canvas, isIntroActive) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const points = [];
  const motes = [];
  const particleLimit = (navigator.hardwareConcurrency || 4) <= 4 ? 32 : 70;
  let frame = 0;
  let viewport;

  function clear() {
    cancelAnimationFrame(frame);
    frame = 0;
    points.length = 0;
    motes.length = 0;
    if (viewport) ctx.clearRect(0, 0, viewport.width, viewport.height);
  }

  function draw(time) {
    frame = 0;
    ctx.clearRect(0, 0, viewport.width, viewport.height);
    while (points.length && time - points[0].time > lifetime) points.shift();
    while (motes.length && time - motes[0].time > lifetime) motes.shift();

    ctx.lineCap = 'round';
    let length = 0;
    for (let i = points.length - 1; i > 0; i--) {
      const previous = points[i - 1];
      const point = points[i];
      const distance = Math.hypot(previous.x - point.x, previous.y - point.y);
      if (distance > 115 || point.time - previous.time > 95) break;
      length += distance;
      if (length > maxTrailLength) break;
      const recency = Math.max(0, 1 - (time - previous.time) / lifetime);
      const opacity = recency ** 2 * (1 - length / maxTrailLength);
      ctx.beginPath();
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(point.x, point.y);
      ctx.lineWidth = 1.4 + opacity * 3.4;
      ctx.strokeStyle = 'rgba(180,186,195,' + (opacity * .13) + ')';
      ctx.stroke();
      ctx.lineWidth = .35 + opacity * .68;
      ctx.strokeStyle = 'rgba(245,245,246,' + (opacity * .55) + ')';
      ctx.stroke();
    }

    for (const mote of motes) {
      const age = (time - mote.time) / lifetime;
      ctx.fillStyle = 'rgba(240,240,241,' + (1 - age) ** 2 * .58 + ')';
      ctx.beginPath();
      ctx.arc(mote.x + mote.dx * age, mote.y + mote.dy * age, mote.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    if (points.length || motes.length) frame = requestAnimationFrame(draw);
  }

  function resize() {
    clear();
    viewport = finePointer.matches && !motionPreference.matches ? fitCanvas(canvas, ctx, 1.5) : null;
    if (!viewport) canvas.width = canvas.height = 1;
  }

  window.addEventListener('pointermove', (event) => {
    if (!viewport || event.pointerType === 'touch' || document.hidden || isIntroActive()) return;
    const { clientX: x, clientY: y } = event;
    const time = performance.now();
    const last = points.at(-1);
    const distance = last ? Math.hypot(x - last.x, y - last.y) : 0;
    if (last && distance < 2) return;
    points.push({ x, y, time });
    if (points.length > maxPoints) points.shift();
    if (distance > 7 && motes.length < particleLimit) {
      motes.push({
        x, y, time,
        radius: .45 + Math.random() * .7,
        dx: (Math.random() - .5) * 23,
        dy: (Math.random() - .5) * 19,
      });
    }
    if (!frame) frame = requestAnimationFrame(draw);
  }, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  finePointer.addEventListener('change', resize);
  motionPreference.addEventListener('change', resize);
  resize();
}
