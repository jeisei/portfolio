import { portraitOutline } from '../../shared/portrait-silhouette.js';
import { butterflyImages } from './butterfly.js';
import { finePointer, fitCanvas, seededRandom } from './canvas.js';
import { sampleImages, sampleSectionBoxes, sampleSectionText, sampleSilhouette, sampleTitle } from './dust-sampling.js';

const clamp = (value) => Math.min(1, Math.max(0, value));
const range = (value, start, end) => clamp((value - start) / (end - start));
const mix = (start, end, amount) => start + (end - start) * amount;

export const assemblyDuration = 1750;

export function createSectionAssembly({ canvas, welcome, title, butterfly }) {
  let context;
  let viewport;
  let particles = [];
  let section;
  let dissolveWelcome = false;
  const shown = new WeakSet([welcome]);
  const wingImages = finePointer.matches ? butterflyImages.map((path) => {
    const image = new Image();
    image.src = path;
    return image;
  }) : [];

  function prepare(target, { fromWelcome = false } = {}) {
    finish();
    if (shown.has(target)) return false;
    shown.add(target);
    context ??= canvas.getContext('2d');
    if (!context) return false;
    viewport = fitCanvas(canvas, context, 1.5);
    const { width, height } = viewport;
    const mobile = width < 700;
    const random = seededRandom(917);
    const origin = fromWelcome ? sampleTitle(title, width, height, mobile ? 2 : 3) : [];

    if (fromWelcome && finePointer.matches && butterfly.classList.contains('butterfly--visible')) {
      const wings = sampleImages(wingImages, butterfly.getBoundingClientRect(), 4, {
        mirrored: butterfly.classList.contains('butterfly--facing-left'),
      });
      origin.push(...wings);
    }

    const landingOffset = -target.getBoundingClientRect().top;
    const portrait = target.querySelector('.portrait__photo');
    const shapes = (portrait
      ? sampleSilhouette(portrait, portraitOutline, mobile ? 5 : 8, landingOffset)
      : sampleSectionBoxes(target, width, height, mobile ? 2 : 3, landingOffset))
      .filter(({ x, y }) => x >= 0 && x < width && y >= 0 && y < height);
    const text = sampleSectionText(target, width, height, 2, landingOffset);
    const pointCount = shapes.length + text.length;
    if (!pointCount) return false;

    const particleBudget = mobile ? 1250 : 2850;
    particles = Array.from({ length: Math.min((origin.length || pointCount) * 2, particleBudget) }, () => {
      const destination = text.length && (!shapes.length || random() < .54) ? text : shapes;
      const end = destination[Math.floor(random() * destination.length)];
      const start = origin[Math.floor(random() * origin.length)] ?? {
        x: end.x + (random() - .5) * width * .40,
        y: end.y - (.12 + random() * .25) * height,
      };
      return {
        start, end,
        phase: random() * Math.PI * 2,
        drift: (random() - .5) * width * .29,
        spread: (.10 + random() * .19) * height,
        release: .02 + (start.x / width) * .035 + random() * .08,
        settle: .465 + clamp(end.y / height) * .40 + random() * .035,
        size: .55 + random() ** 2 * 1.75,
        opacity: .32 + random() * .65,
      };
    });

    section = target;
    dissolveWelcome = fromWelcome;
    canvas.hidden = false;
    section.classList.add('page__section--assembling');
    if (dissolveWelcome) {
      welcome.classList.add('welcome--dissolving');
      butterfly.classList.add('butterfly--dissolving');
    }
    draw(0);
    return true;
  }

  function draw(progress, remainingScroll = 0) {
    const { width, height } = viewport;
    if (dissolveWelcome) {
      const titleOpacity = 1 - range(progress, .015, .17);
      welcome.style.setProperty('--welcome-opacity', titleOpacity);
      butterfly.style.setProperty('--butterfly-opacity', titleOpacity * .88);
    }
    const assemblyEdge = mix(-.15, 1.15, range(progress, .44, .96)) * height;
    section.style.setProperty('--assembly-edge', assemblyEdge + 'px');

    context.clearRect(0, 0, width, height);
    const appear = range(progress, 0, .09);
    context.fillStyle = '#f6f6f7';
    for (const particle of particles) {
      const movement = range(progress, particle.release, particle.settle);
      const arch = Math.sin(movement * Math.PI);
      const flight = movement * movement * (3 - 2 * movement);
      const x = mix(particle.start.x, particle.end.x, flight) + arch * (particle.drift + Math.cos(particle.phase + flight * 7) * width * .07);
      const y = mix(particle.start.y, particle.end.y + remainingScroll, flight) - arch * (particle.spread + Math.sin(particle.phase + flight * 6) * height * .09);
      const fade = 1 - range(progress, particle.settle + .025, Math.min(.995, particle.settle + .14));
      context.globalAlpha = appear * fade * particle.opacity;
      context.fillRect(x, y, particle.size + arch * particle.size * .9, particle.size);
    }
    context.globalAlpha = 1;
  }

  function finish() {
    if (!section) return;
    canvas.hidden = true;
    particles = [];
    section.classList.remove('page__section--assembling');
    section.style.removeProperty('--assembly-edge');
    if (dissolveWelcome) {
      welcome.classList.remove('welcome--dissolving');
      butterfly.classList.remove('butterfly--dissolving');
      welcome.style.removeProperty('--welcome-opacity');
      butterfly.style.removeProperty('--butterfly-opacity');
    }
    section = null;
  }

  return {
    prepare, draw, finish,
    markShown: (target) => shown.add(target),
  };
}
