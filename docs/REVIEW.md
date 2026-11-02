# Cleanup review — 2 November 2026

## Current structure

The portfolio keeps the requested keyboard and sound, scroll transitions, welcome loader, theme toggle, responsive menu, profile photo, experience, education, five project cards and filters, resume download, and contact form. Keyboard scene, controls, and scrolling styles live together in `src/components/keyboard/`; shared keyboard types no longer depend on a component module.

## Removed

- Anonymous chat and its server, Socket.IO context, remote cursors, reaction menu, profile editing, notification sounds, and chat-only hooks/UI.
- Nyan Cat Easter egg and supporting animation/assets.
- Empty blog pages, MDX parser, and unrelated sample articles.
- Disabled repository star widget and its animation code.
- Resend mail API and packages; Formspree now handles submissions directly.
- Unreachable components, unused compact keyboard modes/styles, stale screenshots, old portrait, Spline models, and superseded SVG project covers.
- Duplicated technology metadata, unused animation exports, unnecessary animation controllers, recursive cloning in Button, and unused Tailwind plugins/variables.

The three personal projects and two freelancing projects keep their supplied URLs, technology stacks, and screenshots. The community name remains undecided; no academic qualification is claimed for the Sydney client. The original downloadable resume PDF remains unchanged.

## Contact delivery

Set `NEXT_PUBLIC_FORMSPREE_ID` to the public form ID and configure the receiving address in Formspree. Browser fields are named `name`, `email`, and `message`. The UI prevents duplicate submissions while sending, resets only after success, preserves input after failure, announces results accessibly, and offers a direct email alternative. A missing ID never produces a false success.

## Verification

Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run check:unused`, and `npm run build`. With a server running, use `npm run verify` and `node scripts/verify-keyboard.mjs`. Contact tests mock success, configuration errors, validation/service errors, and network failure; they never send real email. A real delivery check remains dependent on the owner's Formspree ID and dashboard settings.
