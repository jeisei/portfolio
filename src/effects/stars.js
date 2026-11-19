import { fitCanvas, seededRandom } from './canvas.js';

export function paintStarfield(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const random = seededRandom(346219);
  const stars = Array.from({ length: 76 }, () => ({
    x: random(),
    y: random(),
    radius: .42 + random() ** 2 * 1.36,
    opacity: .28 + random() * .63,
  }));

  function draw() {
    const { width, height } = fitCanvas(canvas, ctx);
    const count = Math.round(76 * Math.max(.38, Math.min(1, width / 1200)));
    for (const star of stars.slice(0, count)) {
      ctx.fillStyle = 'rgba(247,247,247,' + star.opacity + ')';
      ctx.beginPath();
      ctx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  draw();
  window.addEventListener('resize', draw, { passive: true });
}
