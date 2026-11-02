# Shiva Sai Thota — Portfolio

Next.js portfolio with an interactive Three.js keyboard, project filters, work experience, education, a profile photo, and a downloadable resume.

## Local development

Use Node.js 22.13+ and npm 11+.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. If `.env.local` already exists, edit it rather than overwriting it. npm and `package-lock.json` are the package manager and lockfile for this project.

## Contact form: Formspree

1. Create a form at https://formspree.io/ and set its email notification recipient to `shivasaiyadav0803@gmail.com`. Complete any email verification requested by Formspree.
2. Copy the form ID from its endpoint. For `https://formspree.io/f/abcdefgh`, the ID is `abcdefgh`.
3. Set `NEXT_PUBLIC_FORMSPREE_ID=abcdefgh` in `.env.local`, then restart the development server.
4. Add the same variable to your production hosting settings and rebuild/redeploy.
5. Submit the form and confirm that the message appears in the Formspree dashboard and your inbox.

The browser posts `name`, `email`, and `message` directly to Formspree. The form ID is public; no email password, secret API key, custom mail API, or verified sending domain is needed in this repository. Configure validation and spam protection in your Formspree dashboard. Without a form ID, the send button is disabled and a direct email link remains available. Failed requests preserve the visitor's message; successful requests reset the form.

Official setup: https://formspree.io/html/

## Structure

```text
src/app/                  Pages, metadata, and global styles
src/components/keyboard/  Three.js scene, scroll movement, accessible controls, styles
src/components/preloader/ Welcome animation and scene readiness
src/components/sections/  Home page sections and shared project cards
src/components/header/    Navigation panel
src/components/ui/        Shared UI elements and form fields
src/components/contact-form.tsx  Contact UI and submission state
src/data/                 Profile, experience, projects, keyboard content and artwork
src/lib/contact.ts        Formspree submission
public/assets/            Current profile photo, project screenshots, logos, font, sounds
scripts/                  Verification and logo maintenance
```

- Identity, contact links, metadata: `src/data/config.ts`.
- Experience, education, certifications, and skill groups: `src/data/constants.ts`.
- Projects, categories, live URLs, and technology stacks: `src/data/projects.ts`.
- Keyboard descriptions and order: `src/data/keyboard.ts`; logos and colors: `src/data/stack-artwork.ts`.
- Resume: `public/Shiva-Sai-Resume.pdf`, served unchanged from the supplied file.
- Navigation destinations: `src/components/header/config.ts`.

The keyboard uses one persistent scene across sections. Its accessible DOM controls also serve as a fallback if WebGL is unavailable. Hover presses keys and plays the supplied sounds. The intro waits for the first rendered keyboard frame; reduced-motion preferences are respected. Below 1024px, the hero keyboard becomes a translucent background.

Project filters are All, Personal, and Freelancing. The three personal projects are Crebry, Edith, and Decentralized Stablecoin. Bhagyashree Ventures and GreenCost are freelancing projects. All five use screenshots of the supplied websites; asset provenance is recorded in `sources.json` files.

## Optional settings

- `NEXT_PUBLIC_SITE_URL`: your production origin for social metadata.
- `UMAMI_DOMAIN` and `UMAMI_SITE_ID`: analytics, loaded only when both are set.

Public environment values are embedded during the build. Keep `.env.local` out of Git.

## Verification

```powershell
npm test
npm run lint
npm run typecheck
npm run check:unused
npm run build
npm audit --omit=dev
```

With a development or production server running on port 3000:

```powershell
npm run verify
node scripts/verify-keyboard.mjs
```

Contact tests mock the network and do not send messages. Real delivery requires your Formspree form ID and dashboard configuration.

## Template acknowledgement

Adapted from Ferhat Olmez's interactive developer portfolio. The visual direction is retained with Shiva Sai Thota's content. Anonymous chat, shared cursors, reaction menus, Easter eggs, empty blogs, and their supporting code have been removed.
