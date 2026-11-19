# Local preview verification

The production preview runs on loopback at http://127.0.0.1:4173.

## Completed checks

| Check | Result |
| --- | --- |
| Production bundle | `npm run build` succeeded. |
| Static upload | Served the `dist/` files with the Netlify response headers and without a contact function. Verified the Gym Tracker card and the unavailable email status at mobile and desktop widths. |
| Contact handler | Four tests passed for availability, validation, fixed recipient and Reply-To, provider success, and provider rejection. |
| Browser suite | 50 checks passed across Google Chrome, Playwright Firefox, desktop WebKit and iPhone-emulated WebKit. Six profile-specific checks were skipped as designed. |
| Interaction | The browser suite covers the intro, anchor navigation, keyboard tabs and focus, project card order and links, the Gym Tracker cover and PWA description in slot six, seven skill marks, contact links, cursor trail fade, portrait reveal, reduced motion, and form error and success states with simulated responses. |
| Responsive layout | Checked 320, 390, 768, 1024, 1536 and 1920 CSS pixels for horizontal overflow. At 1920 × 1080 all four sections fill the viewport. The portrait is horizontally centered and reaches the bottom edge. The Portfolio title stays fixed across tab changes. |
| Butterfly and portrait | Verified mirrored left and right poses, an unchanged heading on vertical movement, and an upright flight transform. The cursor reveal and its touch fallback remain covered by the browser suite. |
| Section navigation | Checked the desktop anchor bar, mobile hamburger and keyboard dismissal, the Contact menu item, and free scrolling to the lower project cards. The menu tracks the visible section and direct anchor destinations. |
| Section assembly | Checked first-time anchor transitions to About, Portfolio, and Contact. Viewed sections scroll into place without another assembly. Rapid anchor clicks queue the next section after the current one finishes. |
| Intro | Checked first loads and reloads of Welcome with the main script delayed beyond the startup timeout, reloads with the Welcome hash, and a background tab becoming visible. A failed decorative image still allows the title animation to complete. |
| Dependencies | `npm audit --audit-level=low` reported zero vulnerabilities at the time of the check. |

## Screenshots

| Scene | Desktop | Mobile |
| --- | --- | --- |
| Intro | [Loading frame](screenshots/desktop-intro.png) | |
| Welcome | [Desktop](screenshots/desktop-welcome.png), [Butterfly](screenshots/desktop-butterfly.png) | [Mobile](screenshots/mobile-welcome.png) |
| About | [Desktop](screenshots/desktop-about.png), [Surfer reveal](screenshots/desktop-surfer-reveal.png) | [Mobile](screenshots/mobile-about.png) |
| Projects | [Desktop](screenshots/desktop-projects.png) | [Mobile](screenshots/mobile-projects.png) |
| Skills | [Desktop](screenshots/desktop-skills.png) | [Mobile](screenshots/mobile-skills.png) |
| Contact | [Desktop](screenshots/desktop-contact.png) | [Mobile](screenshots/mobile-contact.png) |

## Differences and open items

- Manrope approximates the reference typography. The mockups provide raster images, so exact font identification remains open. Both Portfolio views share the Projects title and tab placement.
- The portrait reveal uses the original Surfer proportions and highlights with its background removed. The two soft masks fade between the two stills. The alternate layer is 12% larger, and its silhouette can extend beyond the portrait within the reveal.
- A portrait extension showing the full hands and waist is pending because the image-generation tool reached its usage limit. The current source portrait is bottom-aligned on desktop.
- Email delivery is intentionally unavailable in local preview. Resend credentials and a verified sending domain are still required. Provider behavior was simulated. Mailbox receipt, the hosted function, and its platform rate limit still require live verification.
- Safari coverage uses Playwright WebKit on Windows with an emulated iPhone profile. Physical iOS and macOS Safari remain unverified. The performance sample describes the test environment.
- The CV PDF, final public hostname and social share image remain open. The preview is local.
