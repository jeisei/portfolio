function readPixels(context, width, height, step) {
  const { data } = context.getImageData(0, 0, width, height);
  const points = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] > 120) points.push({ x, y });
    }
  }
  return points;
}

function scratch(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext('2d', { willReadFrequently: true });
}

function setTextStyle(context, style) {
  context.font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
  if ('letterSpacing' in context) context.letterSpacing = style.letterSpacing;
}

function textBaseline(context, text, bounds, fontSize) {
  const metrics = context.measureText(text);
  const ascent = metrics.fontBoundingBoxAscent ?? parseFloat(fontSize) * .8;
  const descent = metrics.fontBoundingBoxDescent ?? parseFloat(fontSize) * .2;
  return bounds.top + (bounds.height + ascent - descent) / 2;
}

export function sampleTitle(title, width, height, step) {
  const ctx = scratch(width, height);
  if (!ctx) return [];
  ctx.fillStyle = '#fff';

  for (const line of title.children) {
    const style = getComputedStyle(line);
    const bounds = line.getBoundingClientRect();
    setTextStyle(ctx, style);
    const baseline = textBaseline(ctx, line.textContent, bounds, style.fontSize);
    ctx.save();
    ctx.translate(bounds.left, 0);
    ctx.scale(style.transform === 'none' ? 1 : new DOMMatrixReadOnly(style.transform).a, 1);
    ctx.fillText(line.textContent, 0, baseline);
    ctx.restore();
  }

  return readPixels(ctx, width, height, step);
}

export function sampleSectionText(section, width, height, step, offsetY) {
  const ctx = scratch(width, height);
  if (!ctx) return [];
  ctx.fillStyle = '#fff';
  const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.data.trim()) continue;
    const style = getComputedStyle(node.parentElement);
    if (style.visibility === 'hidden') continue;
    setTextStyle(ctx, style);
    for (const match of node.data.matchAll(/\S+/g)) {
      // Each word is painted on its actual DOM line, including responsive wrapping.
      const [word] = match;
      range.setStart(node, match.index);
      range.setEnd(node, match.index + word.length);
      const bounds = range.getBoundingClientRect();
      if (bounds.width && bounds.bottom + offsetY > 0 && bounds.top + offsetY < height) {
        const baseline = textBaseline(ctx, word, bounds, style.fontSize);
        ctx.fillText(word, bounds.left, baseline + offsetY);
      }
    }
  }
  return readPixels(ctx, width, height, step);
}

export function sampleSectionBoxes(section, width, height, step, offsetY) {
  const ctx = scratch(width, height);
  if (!ctx) return [];
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = step;
  for (const element of section.querySelectorAll('[data-dust-shape]')) {
    const { left, top, width, height } = element.getBoundingClientRect();
    if (!width || !height || getComputedStyle(element).visibility === 'hidden') continue;
    const radius = parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(left, top + offsetY, width, height, radius);
    else ctx.rect(left, top + offsetY, width, height);
    ctx.stroke();
  }
  return readPixels(ctx, width, height, step);
}

function sampleGraphic(bounds, step, offsetY, paint) {
  const width = Math.max(1, Math.ceil(bounds.width));
  const height = Math.max(1, Math.ceil(bounds.height));
  const ctx = scratch(width, height);
  if (!ctx) return [];
  paint(ctx, width, height);
  return readPixels(ctx, width, height, step).map(({ x, y }) => ({
    x: x + bounds.left,
    y: y + bounds.top + offsetY,
  }));
}

export function sampleImages(images, bounds, step, { mirrored = false } = {}) {
  return sampleGraphic(bounds, step, 0, (ctx, width, height) => {
    if (mirrored) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    for (const image of images) {
      if (image.complete && image.naturalWidth) ctx.drawImage(image, 0, 0, width, height);
    }
  });
}

export function sampleSilhouette(portrait, path, step, offsetY) {
  const sourceWidth = Number(portrait.getAttribute('width'));
  const sourceHeight = Number(portrait.getAttribute('height'));
  return sampleGraphic(portrait.getBoundingClientRect(), step, offsetY, (ctx, width, height) => {
    ctx.scale(width / sourceWidth, height / sourceHeight);
    ctx.fill(new Path2D(path));
  });
}
