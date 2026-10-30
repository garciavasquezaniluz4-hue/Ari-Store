# AGENTS.md

## Overview
Single-package Vite SPA using React 19 and plain JavaScript (no TypeScript). The README is the stock Vite template and does not describe this app. Entry flow: `index.html` -> `src/main.jsx` -> `src/App.jsx`, which acts as an auth gate between `src/page/login.jsx` and `src/page/account.jsx`. There is no router, backend/API client, or test suite yet.

## Commands
- Install: `npm install` (npm lockfile is the source of truth; do not introduce another package manager)
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Preview build: `npm run preview`
- No test runner and no typecheck script exist. Do not run `npm test` or `tsc`; verify changes with `npm run lint` and `npm run build` (both currently pass).

## Styling
- Tailwind CSS v4 is wired through the `@tailwindcss/vite` plugin.
- There is intentionally no `tailwind.config.js` or PostCSS config. Add theme/utilities in `src/index.css`, which contains only `@import "tailwindcss";`.
- `src/index.css` is imported once in `src/main.jsx`. `src/App.css` still exists but is no longer imported; the login and account pages use Tailwind utilities only.

## Auth flow (client-side demo)
- Login logic lives in `src/services/auth.js`; it is not a real backend. Wrong credentials always return the generic `Correo o contraseña incorrectos.` message.
- Demo credentials default to `cliente@aristore.com` / `AriStore2026!`; override with `VITE_DEMO_EMAIL` and `VITE_DEMO_PASSWORD` if needed.
- Lockout is per normalized email: 5 consecutive failures block login for 15 minutes, stored in `localStorage` under `aristore.login.attempts:<email>`; a successful login clears it.
- The active session is stored in `sessionStorage` (`aristore.session`) and only keeps the email. `src/App.jsx` switches to the account view on success and back to login on logout.
- Login validation: email syntax regex, password minimum 12 characters, empty fields blocked before auth is attempted. Any real security enforcement must move to a backend.

## Estado actual (memoria de sesión)
- 2026-10-23: los 9 criterios de inicio de sesión ya están implementados y verificados en `src/page/login.jsx` (validación, mostrar/ocultar contraseña, mensajes genéricos, bloqueo) apoyados en `src/services/auth.js`.
- Dev server levantado en segundo plano en `http://127.0.0.1:5173/`; log en `C:\Users\ALUMNOS\AppData\Local\Temp\opencode\vite-dev.log`. Si el puerto está ocupado, Vite usa el siguiente libre.
- Credenciales demo vigentes: `cliente@aristore.com` / `AriStore2026!`.

## Conventions and gotchas
- ESLint uses flat config restricted to `**/*.{js,jsx}` and ignores `dist`. Keep the react-refresh rule happy: component files should export only components; put helpers in separate modules.
- Use `.jsx` for components and keep explicit extensions in local imports (`./App.jsx`), matching existing code.
- Static assets referenced by absolute URL (e.g. `public/icons.svg#...`, `public/favicon.svg`) live in `public/`; bundled images live in `src/assets/`.
- `dist/` and `node_modules/` are gitignored. This directory is not currently a git repository.
