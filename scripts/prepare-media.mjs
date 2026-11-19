import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { portraitOutline } from '../shared/portrait-silhouette.js';
import { surferOutline } from './surfer-silhouette.js';

const workspace = new URL('../', import.meta.url);
const referenceRoot = new URL('MAX_SHEMCHUK_PORTFOLIO_CODEX/', workspace);
const outputRoot = new URL('public/media/', workspace);
const inputs = {
  portrait: ['references/08_MAX_PORTRAIT_CUTOUT.jpeg', 'image/jpeg'],
  surfer: ['references/07_SILVER_SURFER_REFERENCE.jpeg', 'image/jpeg'],
  butterfly: ['assets/BUTTERFLY_ORIGINAL.png', 'image/png'],
};

const sourceImages = Object.fromEntries(await Promise.all(
  Object.entries(inputs).map(async ([name, [path, mime]]) => {
    const data = await readFile(new URL(path, referenceRoot));
    return [name, 'data:' + mime + ';base64,' + data.toString('base64')];
  }),
));

const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage();
  const images = await page.evaluate(async ({ sourceImages, portraitOutline, surferOutline }) => {
    async function loadImage(source) {
      const image = new Image();
      image.src = source;
      await image.decode();
      return image;
    }

    function canvasOf(width, height) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      return canvas;
    }

    function encode(canvas) {
      return canvas.toDataURL('image/webp', .89).split(',')[1];
    }

    const [portrait, surfer, butterfly] = await Promise.all(
      Object.values(sourceImages).map(loadImage),
    );
    const { width, height } = portrait;
    const silhouette = new Path2D(portraitOutline);
    const normal = canvasOf(width, height);
    const normalContext = normal.getContext('2d');
    normalContext.clip(silhouette);
    normalContext.drawImage(portrait, 0, 0);
    const cutout = normalContext.getImageData(0, 0, width, height);
    const matteBand = 34;
    for (let y = 0; y < height; y++) {
      const start = y * width * 4;
      let left = 0;
      let right = width - 1;
      while (left < width && cutout.data[start + left * 4 + 3] === 0) left++;
      while (right > left && cutout.data[start + right * 4 + 3] === 0) right--;
      for (let x = left; x <= right; x++) {
        const distance = Math.min(x - left, right - x);
        if (distance >= matteBand) {
          x = Math.max(x, right - matteBand);
          continue;
        }
        const index = start + x * 4;
        const peak = Math.max(cutout.data[index], cutout.data[index + 1], cutout.data[index + 2]);
        const opaque = Math.min(1, Math.max(0, (peak - 4) / 10));
        cutout.data[index + 3] *= opaque + (1 - opaque) * (distance / matteBand) ** 3;
      }
    }
    normalContext.putImageData(cutout, 0, 0);

    const metal = canvasOf(surfer.width, surfer.height);
    const metalContext = metal.getContext('2d');
    metalContext.clip(new Path2D(surferOutline));
    metalContext.drawImage(surfer, 0, 0);

    const parts = {
      'butterfly-left.webp': 'M 0 0 H 850 L 800 522 755 630 681 774 535 1024 H 0Z',
      'butterfly-right.webp': 'M 850 0 H 1536 V 1024 H 520 L 668 770 753 628 797 521Z',
      'butterfly-body.webp': 'M 767 366 L 946 360 956 448 860 562 798 658 750 759 651 836 668 742 703 654 748 595Z',
    };
    const output = { 'max.webp': encode(normal), 'silver-surfer.webp': encode(metal) };
    for (const [name, path] of Object.entries(parts)) {
      const part = canvasOf(235, 222);
      const context = part.getContext('2d');
      context.scale(235 / 1100, 222 / 1010);
      context.translate(-190, -20);
      context.clip(new Path2D(path));
      context.drawImage(butterfly, 0, 0);
      output[name] = encode(part);
    }
    return output;
  }, { sourceImages, portraitOutline, surferOutline });

  await mkdir(outputRoot, { recursive: true });
  await Promise.all(Object.entries(images).map(([name, image]) => (
    writeFile(new URL(name, outputRoot), Buffer.from(image, 'base64'))
  )));
  console.log('Prepared ' + Object.keys(images).join(', '));
} finally {
  await browser.close();
}
