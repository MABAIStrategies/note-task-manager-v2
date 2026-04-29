# WifeOS

WifeOS is a cozy personal AI command center for a stay-at-home mother with a 6-month-old baby. This MVP is mock-first, demo-ready, and structured for later real integrations with AI APIs, Gmail, Google Calendar, Ring, Alexa, notifications, and multimodal image generation/editing.

## Run locally

```bash
npm install
npm run dev
```

Optional mock API server:

```bash
npm run dev:api
```

## Checks

```bash
npm run typecheck
npm test
npm run build
```

## Structure

- `apps/web`: React, Vite, TypeScript, Tailwind app.
- `apps/api`: Express mock API routes and service boundaries.
- `prisma`: Future-ready schema and seed outline.
- `docs`: Product, architecture, privacy, integration, deployment, and design notes.
- `tests`: Unit tests for core planning and agent behavior.
