# Architecture

The MVP uses React + Vite + TypeScript + Tailwind for the app and Express for mock API boundaries.

Shared typed mock agents live in `apps/web/src/agents`. The mock API wraps those outputs through service modules so future server integrations can replace deterministic data without redesigning the frontend.

Gmail and Google Calendar are summarized through mock services. Later versions should keep raw connector payloads server-side and expose only normalized assistant context to the UI.
