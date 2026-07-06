# Kamakshi Raheja Coaching — Site

Static site. Plain HTML, CSS, and vanilla JavaScript — no framework, no build step required.

## Structure

- `index.html` — all page markup and content
- `css/style.css` — all styles
- `js/main.js` — quiz logic, FAQ accordion, sticky CTA behavior
- `assets/` — images (hero photo and certification badge are placeholders — swap for real photography before launch)

## Run locally

Any static file server works. Two options:

```
npm run dev
```

or just open `index.html` directly in a browser.

## Before launch

- Replace `assets/hero-placeholder.svg` and `assets/badge-placeholder.svg` with real photography/credential imagery.
- Fill in the real bio numbers, pull-quote, and testimonials in `index.html` (search for `[` placeholders).
- Replace program pricing placeholders (`₹[XX,XXX]`).
- Point the "Book a Free Clarity Call" link and quiz email capture at real booking/email tools (Calendly, Google Form, etc.) instead of the placeholder URL / localStorage stub in `js/main.js`.
