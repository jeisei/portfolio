import { fitCanvas, seededRandom } from './canvas.js';
import { sampleTitle } from './dust-sampling.js';

export function createIntroDust(canvas, title, origin, animatedButterfly) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const random = seededRandom(16811);
  const fewParticles = window.innerWidth < 700 || (navigator.hardwareConcurrency || 4) <= 4;
  const particles = Array.from({ length: fewParticles ? 1450 : 3200 }, (_, index) => ({
    phase: random() * Math.PI * 2,
    tilt: (random() - .5) * .26,
    spiral: random(),
    speed: .25 + random() * .65,
    size: .45 + random() ** 3 * 1.9,
    opacity: .22 + random() * .72,
    target: index,
  }));
  let viewport = fitCanvas(canvas, ctx, 1.5);
  let glyphs = [];

  function prepare() {
    viewport = fitCanvas(canvas, ctx, 1.5);
    glyphs = sampleTitle(title, viewport.width, viewport.height, fewParticles ? 3 : 2);
    for (let i = glyphs.length - 1; i > 0; i--) {
      const swap = Math.floor(random() * (i + 1));
      [glyphs[i], glyphs[swap]] = [glyphs[swap], glyphs[i]];
    }
  }

  function draw(elapsed, gather, fade) {
    const { width, height } = viewport;
    ctx.clearRect(0, 0, width, height);
    const eased = gather * gather * (3 - 2 * gather);
    const rest = origin();
    ctx.fillStyle = '#f6f6f7';
    for (const p of particles) {
      const phase = p.phase + elapsed * .00024 * p.speed;
      const radius = .7 + p.spiral * .32;
      const x = width * (.5 + Math.cos(phase) * radius * .255);
      const y = height * (.465 + Math.sin(phase) * radius * .18 + Math.cos(phase) * .11 + p.tilt * .32);
      const butterfly = animatedButterfly && p.target % 15 === 0;
      const target = butterfly
        ? { x: rest.x + Math.cos(p.phase) * 28 * p.spiral, y: rest.y + Math.sin(p.phase * 2) * 26 * p.spiral }
        : glyphs[p.target % glyphs.length];
      const shimmer = .85 + Math.sin(phase * 7) * .15;
      ctx.globalAlpha = (p.opacity * .55 * shimmer + (target ? eased * .48 : 0)) * (1 - fade);
      ctx.fillRect(
        target ? x + (target.x - x) * eased : x,
        target ? y + (target.y - y) * eased : y,
        p.size,
        p.size,
      );
    }
    ctx.globalAlpha = 1;
  }

  return { prepare, draw };
}
