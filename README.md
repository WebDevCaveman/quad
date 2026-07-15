# QUAD — Student Living

Marketing site for **QUAD**, a fictional student-housing brand in the fictional city of Northaven: one brand, four dorms with distinct personalities — **Pulse** (athletes), **Social** (extroverts), **Focus** (deep-workers), **Nest** (homebodies, light theme).

Twelve pages: home, four dorm takeover pages, three room pages, a vibe-check quiz + comparison, the lore (about), a demo booking flow, and contact.

## Stack

Plain **HTML / CSS / JS** — no framework, no build step.

- `styles.css` — design tokens + every page's styles
- `quad.js` — injects the shared nav/footer, runs all scroll motion (native, no GSAP), the room flavor switcher, booking/quiz helpers
- `quad-nav.js` — mobile nav (fullscreen overlay) as a small web component
- `assets/` — self-hosted fonts (woff2), images, hero video loops, dorm shield SVGs

## Run locally

Any static server, e.g.:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Notes

- Fully client-side. Booking, the quizzes and contact are **demo-only** — no network calls; the room switcher persists one choice in `localStorage`.
- Every animation has a `prefers-reduced-motion` fallback.
- CSS/JS assets are versioned with `?v=N` for cache-busting.

A fictional brand — but the vibes are real.
