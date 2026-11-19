import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, devices, webkit } from 'playwright';

const siteUrl = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4173';
const directory = resolve('docs', 'screenshots');
await mkdir(directory, { recursive: true });

const scenes = [
  ['welcome', '.welcome'],
  ['about', '.about'],
  ['projects', '.portfolio'],
  ['contact', '.contact'],
];

async function save(page, selector, name, viewport = false) {
  const locator = page.locator(selector);
  const options = { path: resolve(directory, name + '.png'), animations: 'disabled' };
  if (viewport) {
    await locator.evaluate((section) => section.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.screenshot(options);
  } else {
    await locator.screenshot(options);
  }
}

const desktop = await chromium.launch({ channel: 'chrome' });
const mobile = await webkit.launch();
try {
  for (const mode of ['desktop', 'mobile']) {
    const browser = mode === 'desktop' ? desktop : mobile;
    const environment = mode === 'desktop'
      ? { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 }
      : { ...devices['iPhone 13'], deviceScaleFactor: 1 };
    const page = await browser.newPage({ ...environment, reducedMotion: 'reduce' });
    await page.goto(siteUrl);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => !document.getElementById('contact-status').textContent.startsWith('Checking'));
    for (const [name, selector] of scenes) {
      await save(page, selector, mode + '-' + name, mode === 'desktop');
    }
    await page.getByRole('tab', { name: 'Skills' }).click();
    await save(page, '.portfolio', mode + '-skills', mode === 'desktop');
    await page.close();
  }

  const page = await desktop.newPage({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 });
  await page.route('**/butterfly-*.webp', async (route) => {
    await new Promise((done) => setTimeout(done, 500));
    await route.continue();
  });
  await page.goto(siteUrl, { waitUntil: 'domcontentloaded' });
  await save(page, '.intro', 'desktop-intro');
  await page.unrouteAll({ behavior: 'wait' });
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await page.locator('.welcome__scroll').evaluate((link) => link.blur());
  await page.locator('.butterfly--visible').waitFor();
  await save(page, '.welcome', 'desktop-butterfly', true);
  await page.goto(siteUrl + '/#about');
  await page.locator('#about').evaluate((section) => window.scrollTo({ top: section.offsetTop, behavior: 'instant' }));
  const portrait = page.locator('.portrait');
  await page.waitForFunction(() => document.querySelector('[data-surfer]').hasAttribute('src'));
  await portrait.locator('[data-surfer]').evaluate((image) => image.decode());
  const box = await portrait.boundingBox();
  await page.mouse.move(box.x + box.width * .5, box.y + box.height * .25, { steps: 12 });
  await page.waitForFunction(() => document.querySelector('.portrait--revealed'));
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.portrait__reveal')).opacity) >= .99);
  await page.screenshot({ path: resolve(directory, 'desktop-surfer-reveal.png'), animations: 'disabled' });
  const encodedBytes = await page.evaluate(() => performance.getEntriesByType('resource')
    .reduce((sum, entry) => sum + (entry.encodedBodySize || 0), performance.getEntriesByType('navigation')[0]?.encodedBodySize || 0));
  console.log('Desktop navigation, including the hovered portrait: ' + encodedBytes + ' encoded resource bytes.');
  await page.close();
} finally {
  await Promise.all([desktop.close(), mobile.close()]);
}
