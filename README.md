# Max Shemchuk Portfolio

An English-language frontend portfolio built with vanilla JavaScript, CSS and Vite. It features six projects, including Gym Tracker, an installable strength training PWA, plus an interactive portrait and contact form.

## Run locally

Use Node.js 22.12 or later.

```sh
npm ci
npm run dev
```

Open the URL printed in the terminal. To check the production bundle:

```sh
npm run build
npm run preview
```

The default preview is served at http://127.0.0.1:4173. Vite serves the static application. The contact panel describes the unavailable email transport in a static preview.

## Source map

| Path | Responsibility |
| --- | --- |
| `index.html` | Semantic page sections, metadata, tab and form markup |
| `src/styles/` | Shared tokens and BEM styles organized by section and effect |
| `src/components/` | Section navigation, project and skill grids, contacts, CV and contact form |
| `src/effects/` | Intro, stars, butterfly, cursor trail and portrait reveal |
| `src/config/site.js` | CV, six project slots, skills and confirmed contact destinations |
| `shared/` | Shared validation and portrait outline |
| `netlify/functions/contact.js` | Server-side validation, delivery and rate limit configuration |
| `public/media/` | WebP derivatives, skill marks and the project placeholder |
| `scripts/` | Reproducible media preparation and local screenshot capture |
| `tests/` | Contact handler and browser interaction tests |

BEM classes use `block`, `block__element` and `block--modifier`. JavaScript finds components using `data-*` attributes. State changes update BEM modifiers and the relevant accessibility attributes.

## Update content

- **CV:** add the PDF under `public/` and set `site.cv` to its local URL.
- **Projects:** edit `src/config/site.js` and add optimized covers to `public/media/projects/`. Each card contains `title`, `summary`, `image`, `imageAlt` and `url`. Visit Website opens the configured link in a new tab. The optional `imageLayout` supports `cinematic` for tall artwork and `framed` for standard photographs with softly blended side edges.
- **Public website URL:** add canonical and Open Graph URLs and a share image after the final hostname is assigned.
- **Email credentials:** see the next section.

## Deploy on Netlify

For a manual static deployment, run `npm run build` and upload the resulting `dist/` folder to [Netlify Drop](https://app.netlify.com/drop). The build includes the browser headers from `public/_headers`. The contact links work in the static build. The contact form needs the serverless function and Resend settings below.

1. Import the GitHub repository into Netlify for a deployment with the contact function. The supplied `netlify.toml` defines the build, publish folder and Functions directory.
2. Verify a sending domain in Resend. Configure `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` and `CONTACT_TO_EMAIL` as server-side environment variables. Start with the names in `.env.example`.
3. Set the confirmed Gmail address as the recipient and use an address under the verified domain as the sender. The visitor's email becomes Reply-To.
4. Check the form with a provider sandbox or an approved test submission after deployment. Confirm both the browser success state and mailbox receipt.

The function rejects cross-origin browser submissions and invalid or oversized messages. It uses a honeypot and Netlify's per-IP limit. Provider errors preserve form values. The local test suite simulates provider responses using a fake sender and recipient.

## Check and capture

```sh
npm test
npx playwright install firefox webkit
npm run test:browser
```

The browser suite uses the installed Google Chrome and Playwright's Firefox and desktop/mobile WebKit. It runs against the production bundle. Run `npm run build` before starting it.

See [local preview verification](docs/verification.md) for test results and desktop and mobile screenshots.

With `npm run preview` running, use `node scripts/capture-preview.mjs` to regenerate screenshots. The optimized media used by the site is checked in under `public/media/`. To regenerate the portrait and butterfly assets, place the original reference files at the paths listed in `scripts/prepare-media.mjs`, then run that script with Chrome installed.

The source pack contains the portrait, Silver Surfer art and original butterfly/trail PNGs. The Surfer uses its original proportions and highlights, with the backdrop removed and the entire cutout scaled uniformly. Two soft masks fade between the portrait and Surfer around the pointer. The butterfly's three WebP layers come from the source PNG. Horizontal travel turns the butterfly around its vertical axis. Vertical travel preserves its heading. The trail PNG guides the Canvas 2D glow, taper and sparse motes.

Skill marks for HTML, CSS, JavaScript, Figma and React come from [Devicon v2.17.0](https://github.com/devicons/devicon/tree/v2.17.0). The OpenAI mark used for Codex and the Claude mark come from [Simple Icons](https://github.com/simple-icons/simple-icons). Manrope is distributed through [Fontsource](https://fontsource.org/fonts/manrope).
