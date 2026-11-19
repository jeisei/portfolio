import { expect, test } from '@playwright/test';

const endpoint = '**/.netlify/functions/contact';

async function openSectionNav(page, isMobile) {
  if (isMobile) await page.getByRole('button', { name: 'Open navigation' }).click();
  return page.getByRole('navigation', { name: 'Page sections' });
}

test('page anchors, keyboard tabs, placeholder states and confirmed contacts', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome to my Portfolio');
  await page.getByRole('link', { name: 'Scroll to learn more' }).click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.getByRole('button', { name: 'View CV' })).toBeDisabled();
  await page.getByRole('link', { name: 'View Projects' }).click();
  await expect(page).toHaveURL(/#portfolio$/);
  const projects = page.getByRole('tab', { name: 'Projects' });
  const skills = page.getByRole('tab', { name: 'Skills' });
  const activePanel = page.getByRole('tabpanel');
  await expect(activePanel.getByRole('link', { name: /Visit Website/ })).toHaveCount(6);
  const cards = activePanel.locator('.project-card');
  await expect(cards).toHaveCount(6);
  const beeTattoo = cards.first();
  await expect(beeTattoo.getByRole('heading', { name: 'Bee Tattoo Studio' })).toBeVisible();
  await expect(beeTattoo).toContainText('An interactive website for Bee Tattoo Studio, featuring an animated tattoo reveal, a browsable gallery, and the process from first sketch to finished ink.');
  const beeWebsite = beeTattoo.getByRole('link', { name: /Visit Website/ });
  await expect(beeWebsite).toHaveAttribute('href', 'https://bee-tattoo-studio.netlify.app/');
  await expect(beeWebsite).toHaveAttribute('target', '_blank');
  await expect.poll(() => beeTattoo.getByRole('img').evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
  const novex = cards.nth(1);
  await expect(novex.getByRole('heading', { name: 'NOVEX' })).toBeVisible();
  await expect(novex).toContainText('A sneaker store concept with an animated showroom, interactive 3D product views, and a demo shopping bag.');
  const novexWebsite = novex.getByRole('link', { name: /Visit Website/ });
  await expect(novexWebsite).toHaveAttribute('href', 'https://sneakerssh.netlify.app/');
  await expect(novexWebsite).toHaveAttribute('target', '_blank');
  await expect.poll(() => novex.getByRole('img').evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
  const lostCherry = cards.nth(2);
  await expect(lostCherry.getByRole('heading', { name: 'Tom Ford — Lost Cherry' })).toBeVisible();
  await expect(lostCherry).toContainText('An editorial fragrance concept for Tom Ford Lost Cherry');
  const website = lostCherry.getByRole('link', { name: /Visit Website/ });
  await expect(website).toHaveAttribute('href', 'https://glistening-sopapillas-050b2b.netlify.app/');
  await expect(website).toHaveAttribute('target', '_blank');
  await expect.poll(() => lostCherry.getByRole('img').evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
  const lounge = cards.nth(3);
  await expect(lounge.getByRole('heading', { name: 'Lounge' })).toBeVisible();
  await expect(lounge).toContainText('A restaurant website concept showcasing modern Ukrainian cuisine, with a browsable menu, dining room photography, and an animated wine pour.');
  const loungeWebsite = lounge.getByRole('link', { name: /Visit Website/ });
  await expect(loungeWebsite).toHaveAttribute('href', 'https://loungez.netlify.app/');
  await expect(loungeWebsite).toHaveAttribute('target', '_blank');
  const loungeCover = lounge.getByRole('img', { name: /Warmly lit arched windows/ });
  await loungeCover.scrollIntoViewIfNeeded();
  await expect.poll(() => loungeCover.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
  const monster = cards.nth(4);
  await expect(monster.getByRole('heading', { name: 'Monster Ultra Black' })).toBeVisible();
  await expect(monster).toContainText('An independent product concept for Monster Ultra Black, with a scroll-driven 3D can showcase and close-ups of the Black Cherry label.');
  const monsterWebsite = monster.getByRole('link', { name: /Visit Website/ });
  await expect(monsterWebsite).toHaveAttribute('href', 'https://energydrinkz.netlify.app/');
  await expect(monsterWebsite).toHaveAttribute('target', '_blank');
  const monsterCover = monster.getByRole('img', { name: /A tilted black Monster Ultra Black can/ });
  await monsterCover.scrollIntoViewIfNeeded();
  await expect.poll(() => monsterCover.evaluate(({ naturalWidth, naturalHeight }) => [naturalWidth, naturalHeight])).toEqual([1040, 400]);
  const gymTracker = cards.nth(5);
  await expect(gymTracker.getByRole('heading', { name: 'Gym Tracker' })).toBeVisible();
  await expect(gymTracker).toContainText('A strength training PWA for planning workouts, logging sets and weights, timing rest, and tracking progress.');
  const gymWebsite = gymTracker.getByRole('link', { name: /Visit Website/ });
  await expect(gymWebsite).toHaveAttribute('href', 'https://gymtrackerz4.netlify.app/');
  await expect(gymWebsite).toHaveAttribute('target', '_blank');
  const gymCover = gymTracker.getByRole('img', { name: /Gym Tracker screens showing the weekly plan/ });
  await gymCover.scrollIntoViewIfNeeded();
  await expect.poll(() => gymCover.evaluate(({ naturalWidth, naturalHeight }) => [naturalWidth, naturalHeight])).toEqual([1040, 400]);
  await projects.focus();
  await page.keyboard.press('ArrowRight');
  await expect(skills).toBeFocused();
  await expect(skills).toHaveAttribute('aria-selected', 'true');
  await expect(activePanel.getByRole('img')).toHaveCount(7);
  await page.keyboard.press('Home');
  await expect(projects).toBeFocused();
  await expect(projects).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.contact__method')).toHaveCount(5);
  await expect(page.getByRole('link', { name: /Email/ })).toHaveAttribute('href', 'mailto:maximus17power@gmail.com');
  const phone = page.getByRole('link', { name: /Phone/ });
  await expect(phone).toContainText('+380 67 600 56 05');
  await expect(phone).toHaveAttribute('href', 'tel:+380676005605');
  await expect(page.getByRole('link', { name: /LinkedIn/ })).toHaveCount(0);
  await expect(page.locator('.contact__method').filter({ hasText: 'LinkedIn' })).toContainText('Coming soon');
  await expect(page.locator('[data-contact-form] [role="status"]')).toContainText('Email delivery is not configured');
  const covers = activePanel.locator('.project-card__preview');
  for (const width of [320, 390, 768, 1024, 1536, 1920]) {
    await page.setViewportSize({ width, height: 864 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), {
      message: 'Page fits at ' + width + ' pixels',
    }).toBe(true);
    const heights = await covers.evaluateAll((previews) => previews.map((preview) => preview.getBoundingClientRect().height));
    expect(Math.max(...heights) - Math.min(...heights), 'Cover heights match at ' + width + ' pixels').toBeLessThan(1);
  }
  expect(errors).toEqual([]);
});

test('the Welcome intro plays again after reloading, including the Welcome hash', async ({ page }) => {
  await page.goto('/');
  const skip = page.getByRole('button', { name: 'Skip intro' });
  await expect(skip).toBeVisible();
  await skip.click();
  await expect(page.getByRole('link', { name: 'Scroll to learn more' })).toBeFocused();
  await page.reload();
  await expect(skip).toBeVisible();
  await skip.click();
  await page.goto('/#welcome');
  await page.reload();
  await expect(skip).toBeVisible();
  await expect(skip).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('the Welcome intro still plays when the main script loads slowly', async ({ page }) => {
  await page.route(/\/(?:assets\/index-[^/]+|src\/main)\.js(?:\?.*)?$/, async (route) => {
    const response = await route.fetch();
    // Wait for the startup overlay to give way to the page before delivering the module.
    await expect(page.locator('html')).toHaveClass(/page--intro-pending/);
    await expect(page.locator('html')).not.toHaveClass(/page--intro-pending/);
    await route.fulfill({ response });
  });

  const skip = page.getByRole('button', { name: 'Skip intro' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(skip).toBeVisible();
  await skip.click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(skip).toBeVisible();
  await expect(skip).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('the Welcome intro waits until a background tab becomes visible', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  });
  await page.goto('/');
  const skip = page.getByRole('button', { name: 'Skip intro' });
  await expect(skip).toBeHidden();
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(skip).toBeVisible();
  await expect(skip).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('desktop sections fill the viewport and Portfolio tabs share an aligned track', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The three-column layout applies to desktop.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/#about');
  await page.evaluate(() => document.fonts.ready);
  const layout = await page.evaluate(() => {
    const portrait = document.querySelector('.portrait').getBoundingClientRect();
    const about = document.querySelector('#about').getBoundingClientRect();
    return {
      viewportWidth: document.body.getBoundingClientRect().width,
      portraitCenterX: portrait.left + portrait.width / 2,
      portraitBottomGap: about.bottom - portrait.bottom,
      sectionSizes: Array.from(document.querySelectorAll('.page__section'), ({ offsetWidth, offsetHeight }) => [offsetWidth, offsetHeight]),
      snap: getComputedStyle(document.documentElement).scrollSnapType,
    };
  });
  expect(layout.snap).toBe('none');
  for (const [width, height] of layout.sectionSizes) {
    expect(width).toBe(layout.viewportWidth);
    expect(height).toBeGreaterThanOrEqual(1080);
  }
  expect(layout.portraitCenterX).toBeCloseTo(layout.viewportWidth / 2, 0);
  expect(layout.portraitBottomGap).toBeCloseTo(0, 0);
  await expect(page.locator('[data-cv]')).toHaveText('View CV');
  await expect(page.locator('[data-cv] use')).toHaveAttribute('href', '/icons.svg#file');

  await page.goto('/#portfolio');
  await expect(page.getByRole('heading', { name: 'Portfolio', exact: true })).toBeInViewport();
  const title = page.locator('.portfolio__title');
  const before = await title.boundingBox();
  const tabs = await page.getByRole('tablist', { name: 'Portfolio sections' }).boundingBox();
  const project = await page.locator('.project-card').first().boundingBox();
  await page.getByRole('tab', { name: 'Skills' }).click();
  const after = await title.boundingBox();
  const skill = await page.locator('.skills__tile').first().boundingBox();
  expect(after.y).toBeCloseTo(before.y, 0);
  expect(project.y - (tabs.y + tabs.height)).toBeCloseTo(skill.y - (tabs.y + tabs.height), 0);
});

test('the butterfly mirrors horizontally and keeps its heading on vertical movement', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The butterfly follows a fine pointer.');
  await page.goto('/#welcome');
  await page.getByRole('button', { name: 'Skip intro' }).click();
  const butterfly = page.locator('[data-butterfly]');
  await expect(butterfly).toHaveClass(/butterfly--visible/);
  const yaw = () => butterfly.locator('.butterfly__pose').evaluate((element) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return Math.abs(Math.atan2(-matrix.m13, matrix.m11) * 180 / Math.PI);
  });
  const foldedDepth = () => butterfly.locator('.butterfly__wing--left').evaluate((wing) => {
    const [flap] = wing.getAnimations();
    flap.pause();
    flap.currentTime = Number(flap.effect.getTiming().duration) * .4;
    return new DOMMatrixReadOnly(getComputedStyle(wing).transform).m23;
  });

  await page.mouse.move(1170, 360);
  await page.mouse.move(550, 360, { steps: 8 });
  await expect.poll(yaw).toBeGreaterThan(179);
  await page.mouse.move(550, 650, { steps: 8 });
  expect(await yaw()).toBeGreaterThan(179);
  const leftFold = await foldedDepth();
  expect(Math.abs(leftFold)).toBeGreaterThan(.3);
  await page.mouse.move(980, 650, { steps: 8 });
  await expect.poll(yaw).toBeLessThan(1);
  await page.mouse.move(980, 320, { steps: 8 });
  expect(await yaw()).toBeLessThan(1);
  expect(await foldedDepth()).toBeCloseTo(-leftFold, 1);

  const upright = await butterfly.evaluate((element) => {
    const motion = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return motion.m22 === 1 && motion.m12 === 0 && motion.m21 === 0;
  });
  expect(upright).toBe(true);
});

test('the About anchor dissolves Welcome into About on the first visit', async ({ page, isMobile }) => {
  await page.goto('/#welcome');
  await page.getByRole('button', { name: 'Skip intro' }).click();
  const welcome = page.locator('#welcome');
  const about = page.locator('#about');
  const dust = page.locator('[data-scene-dust]');
  const nav = await openSectionNav(page, isMobile);
  await nav.getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/#about$/);
  if (isMobile) await expect(nav).toBeHidden();
  await expect(dust).toBeVisible();
  await expect(welcome).toHaveClass(/welcome--dissolving/);
  await expect(about).toHaveClass(/page__section--assembling/);
  await expect.poll(() => dust.evaluate((canvas) => (
    canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.some((value) => value !== 0)
  ))).toBe(true);
  await expect(dust).toBeHidden();
  await expect(welcome).not.toHaveClass(/welcome--dissolving/);
  await expect(about).not.toHaveClass(/page__section--assembling/);
  await expect.poll(() => about.evaluate((section) => Math.abs(section.getBoundingClientRect().top))).toBeLessThan(2);
  await welcome.evaluate((section) => section.scrollIntoView({ behavior: 'instant' }));
  await page.getByRole('link', { name: 'Scroll to learn more' }).click();
  await expect.poll(() => about.evaluate((section) => Math.abs(section.getBoundingClientRect().top))).toBeLessThan(2);
  await expect(dust).toBeHidden();
});

test('Portfolio and Contact assemble on their first visit and stay assembled on return', async ({ page, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/#about');
  const portfolio = page.locator('#portfolio');
  const contact = page.locator('#contact');
  const dust = page.locator('[data-scene-dust]');
  const assembling = /page__section--assembling/;

  await page.getByRole('link', { name: 'View Projects' }).click();
  await expect(portfolio).toHaveClass(assembling);
  await expect(dust).toBeVisible();
  await expect(portfolio).not.toHaveClass(assembling);

  await expect(portfolio.getByRole('link', { name: 'Contact', exact: true })).toHaveCount(0);
  const nav = await openSectionNav(page, isMobile);
  await nav.getByRole('link', { name: 'Contact' }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(contact).toHaveClass(assembling);
  await expect(dust).toBeVisible();
  await expect(contact).not.toHaveClass(assembling);

  await portfolio.evaluate((section) => section.scrollIntoView({ behavior: 'instant' }));
  await expect(portfolio.getByRole('tab', { name: 'Projects' })).toBeInViewport();
  await contact.evaluate((section) => section.scrollIntoView({ behavior: 'instant' }));
  await expect(contact.getByRole('heading', { name: 'Contact Me' })).toBeInViewport();
  await expect(dust).toBeHidden();
});

test('rapid anchor clicks keep each dust assembly intact', async ({ page }) => {
  await page.goto('/#about');
  const projectsLink = page.getByRole('link', { name: 'View Projects' });
  await expect(projectsLink).toBeVisible();
  const transitions = await projectsLink.evaluate((link) => {
    const portfolio = document.querySelector('#portfolio');
    const contact = document.querySelector('#contact');
    const marker = 'page__section--assembling';

    return new Promise((resolve) => {
      const transitions = [];
      const observer = new MutationObserver((records) => {
        for (const { target } of records) {
          const phase = target.classList.contains(marker) ? 'start' : 'end';
          transitions.push(target.id + ':' + phase);
        }
        if (!transitions.includes('contact:end')) return;
        observer.disconnect();
        resolve(transitions);
      });
      for (const section of [portfolio, contact]) {
        observer.observe(section, { attributes: true, attributeFilter: ['class'] });
      }

      link.click();
      document.querySelector('.site-nav__link[href="#contact"]').click();
    });
  });
  expect(transitions).toEqual(['portfolio:start', 'portfolio:end', 'contact:start', 'contact:end']);
  await expect(page.locator('[data-scene-dust]')).toBeHidden();
});

test('free scrolling reaches the lower project cards and tracks the visible section', async ({ page, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/#portfolio');
  const lounge = page.getByRole('heading', { name: 'Lounge', exact: true });
  const lowerRow = await lounge.evaluate((heading) => heading.getBoundingClientRect().top - innerHeight / 2);
  if (isMobile) await page.evaluate((offset) => window.scrollBy(0, offset), lowerRow);
  else await page.mouse.wheel(0, lowerRow);
  await expect(lounge).toBeInViewport();
  const nav = await openSectionNav(page, isMobile);
  const portfolioLink = nav.getByRole('link', { name: 'Portfolio' });
  await expect(portfolioLink).toHaveAttribute('aria-current', 'location');
  await expect(page.locator('[data-scene-dust]')).toBeHidden();
  await expect(page).toHaveURL(/#portfolio$/);

  if (isMobile) {
    await nav.getByRole('link', { name: 'Welcome' }).focus();
    await page.keyboard.press('Escape');
    await expect(nav).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  }
  const projectScroll = await page.evaluate(() => window.scrollY);
  await openSectionNav(page, isMobile);
  await nav.getByRole('link', { name: 'Contact' }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('[data-scene-dust]')).toBeHidden();
  await page.goBack();
  await expect(page).toHaveURL(/#portfolio$/);
  await expect.poll(() => page.evaluate((position) => Math.abs(window.scrollY - position), projectScroll)).toBeLessThan(3);

  await page.locator('#contact').evaluate((section) => section.scrollIntoView());
  await openSectionNav(page, isMobile);
  await expect(nav.getByRole('link', { name: 'Contact' })).toHaveAttribute('aria-current', 'location');
  await expect(page.locator('[data-scene-dust]')).toBeHidden();
});

test('the global trail and portrait reveal respond to a fine pointer', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Pointer effects are intentionally disabled on touch.');
  await page.goto('/#about');
  const portrait = page.locator('[data-portrait]');
  const overlay = portrait.locator('[data-surfer]');
  await page.locator('#about').evaluate((section) => section.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await expect(overlay).toHaveAttribute('src', /silver-surfer/);
  await expect.poll(() => overlay.evaluate((image) => image.complete && image.naturalWidth)).toBe(1102);
  await expect(page.locator('#about')).toBeInViewport({ ratio: .99 });
  await expect(portrait).toBeInViewport({ ratio: .9 });
  const box = await portrait.boundingBox();
  await page.mouse.move(box.x + box.width * .5, box.y + box.height * .28, { steps: 12 });
  await expect(portrait).toHaveClass(/portrait--revealed/);
  await expect.poll(() => page.locator('[data-trail]').evaluate((canvas) => {
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return data.some((value) => value !== 0);
  })).toBe(true);
  await page.mouse.move(3, 3);
  await expect(portrait).not.toHaveClass(/portrait--revealed/);
  await expect.poll(() => page.locator('[data-trail]').evaluate((canvas) => {
    const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    return data.some((value) => value !== 0);
  })).toBe(false);
});

test('touch or reduced motion retains the regular portrait', async ({ page, isMobile }) => {
  if (!isMobile) await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#about');
  await expect(page.locator('.portrait__photo')).toBeVisible();
  await expect(page.locator('[data-surfer]')).toBeHidden();
  await expect(page.locator('[data-butterfly]')).toBeHidden();
  await expect(page.locator('[data-trail]')).toBeHidden();
});

test('on touch, the butterfly flies in Welcome and the portrait sweeps in both directions', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'The autonomous flight and portrait button are for touch.');
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip intro' }).click();
  const butterfly = page.locator('[data-butterfly]');
  await expect(butterfly).toBeVisible();
  const before = await butterfly.boundingBox();
  await expect.poll(async () => {
    const box = await butterfly.boundingBox();
    return Math.hypot(box.x - before.x, box.y - before.y);
  }).toBeGreaterThan(18);
  await page.goto('/#about');
  await expect(butterfly).toBeHidden();

  const portrait = page.locator('[data-portrait]');
  const become = page.getByRole('button', { name: 'Become Silver Surfer' });
  const returnToHuman = page.getByRole('button', { name: 'Return to human' });
  const sweepEdge = () => portrait.evaluate((element) => parseFloat(element.style.getPropertyValue('--sweep-edge')));
  await become.click();
  await expect(portrait).toHaveClass(/portrait--sweep/);
  await expect.poll(sweepEdge).toBeGreaterThan(20);
  await expect(returnToHuman).toBeEnabled();
  const art = portrait.locator('.portrait__art');
  await expect(art).toHaveCSS('clip-path', 'inset(-10% -10% 0px)');
  const image = await art.boundingBox();
  const button = await returnToHuman.boundingBox();
  const description = await page.locator('.about__description').boundingBox();
  expect(button.y + button.height).toBeLessThan(image.y + image.height);
  expect(image.y + image.height).toBeLessThan(description.y);
  await returnToHuman.click();
  await expect(portrait).toHaveClass(/portrait--returning/);
  await expect.poll(sweepEdge).toBeGreaterThan(20);
  await expect(become).toBeEnabled();
  await expect(page.locator('[data-surfer]')).toBeHidden();
});

test('form preserves values on failure and clears them after a confirmed send', async ({ page }) => {
  let available = true;
  let sends = 0;
  await page.route(endpoint, (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { available } });
    sends++;
    return sends === 1
      ? route.fulfill({ status: 502, json: { error: 'Delivery failed' } })
      : route.fulfill({ json: { sent: true } });
  });
  await page.goto('/#contact');
  const send = page.getByRole('button', { name: 'Send Message' });
  const status = page.locator('[data-contact-form] [role="status"]');
  await expect(send).toBeEnabled();
  await page.getByLabel('Your name').fill('Test visitor');
  await page.getByLabel('Your email').fill('visitor@example.com');
  await page.getByLabel('Subject').fill('A test subject');
  await page.getByLabel('Message', { exact: true }).fill('A test message');
  await send.click();
  await expect(status).toContainText('could not be sent');
  await expect(page.getByLabel('Subject')).toHaveValue('A test subject');
  await send.click();
  await expect(status).toContainText('Message sent');
  await expect(page.getByLabel('Subject')).toHaveValue('');
  available = false;
  await page.reload();
  await expect(send).toBeDisabled();
});
