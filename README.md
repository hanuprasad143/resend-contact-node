# Node.js + Resend contact backend for Framer

No database. This converts the PHP project's six fields and HTML email template to Node.js.

## Local setup

1. Install Node.js 20 or later.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `RESEND_API_KEY`, `FROM_EMAIL` (verified sending domain), `TO_EMAIL`, `ALLOWED_ORIGIN` (your exact published Framer origin), and `PORT`.
4. Run `npm start` and open `http://localhost:10000` to test the standalone form. For local Framer preview, add its origin to ALLOWED_ORIGIN temporarily.
5. Run `npm test` for validation/template tests.

## Render deployment

1. Push this folder to GitHub (never commit `.env`).
2. In Render, create **New > Web Service**, connect the repository, and select **Node**.
3. Build command: `npm install`. Start command: `npm start`.
4. Add `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`, and `ALLOWED_ORIGIN` in Render Environment. Render supplies `PORT` automatically.
5. Deploy. Health check path: `/health`.
6. In Framer, set **PHP Backend** (your existing property label) to `https://YOUR-SERVICE.onrender.com/contact`. Optionally rename that property to `Backend URL`.

The existing Framer `fetch(backendURL, {method:'POST',body:new FormData(...)})` works unchanged. The API returns JSON with `success` and `message`.

## Production considerations

- The configured CORS origin restricts browsers, but **does not prevent bots or direct HTTP clients**. Add CAPTCHA verification and a persistent, shared rate limiter before public launch.
- Resend accepting the API request does not guarantee inbox delivery; monitor Resend logs.
- Avoid exposing your Resend API key in Framer, public code, or GitHub.
- For production, prefer a paid Render instance if you need to avoid free-tier spin-down delays.
