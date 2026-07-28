# Financer

Multi-user stock portfolio tracker with live market prices, USD/ILS earnings, and role-based access. Built with Next.js and backed by Firebase (Firestore + Cloud Functions).

## Features

- **Password-gated access** — admin and viewer roles via `/api/auth`
- **Multi-user portfolios** — create, rename, and delete users; view one user or combined “all”
- **Buy / sell transactions** — update holdings and keep a transaction history
- **Live stock prices** — Yahoo Finance proxy at `/api/stocks`
- **Portfolio visualization** — holdings table and allocation pie chart (Recharts)
- **Earnings in USD and ILS** — unrealized P/L with live USD→ILS conversion
- **Persistent storage** — Firestore via a Cloud Function (`manageUsers`), proxied by `/api/users`

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Charts | Recharts |
| API | Next.js App Router route handlers |
| Backend | Firebase Cloud Functions, Firestore |
| Hosting | Firebase Hosting (Next.js source) |
| Runtime | Node.js 24 (see `.nvmrc`) |

## Project structure

```
src/
  app/                 # App Router pages and API routes
    api/auth/          # Role-based password login
    api/stocks/        # Live ticker price proxy
    api/users/         # Proxy to Cloud Function for portfolio CRUD
    page.js            # Main portfolio dashboard
  components/          # UI: holdings, charts, modals, history
  lib/                 # Firestore helper and migration script
functions/             # Firebase Cloud Function (manageUsers)
firebase.json          # Hosting + Functions config
API-README.md          # API endpoint reference
```

## Getting started

### Prerequisites

- Node.js 24+
- A Firebase project with Firestore and Cloud Functions enabled
- npm

### Install

```bash
npm install
cd functions && npm install && cd ..
```

### Environment

Create a `.env.local` in the project root (never commit secrets):

```bash
ADMIN_PASSWORD=your-admin-password
VIEWER_PASSWORD=your-viewer-password
```

Defaults used only for local/dev if unset: `admin123` / `viewer123`.

Firebase Admin credentials should be available in the environment where Cloud Functions and any local Admin SDK scripts run (for example Application Default Credentials or a service account).

### Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build and run production locally

```bash
npm run build
npm start
```

## API overview

| Endpoint | Purpose |
| --- | --- |
| `POST /api/auth` | Authenticate; returns `{ role: "admin" \| "viewer" }` |
| `GET /api/stocks?tickers=AAPL,MSFT` | Current and previous-close prices |
| `GET/POST/PATCH/DELETE /api/users` | Portfolio users, holdings, history, totals |

See [API-README.md](./API-README.md) for query parameters and response shapes.

## Firebase

- **Project alias:** configured in `.firebaserc`
- **Function:** `manageUsers` — HTTPS handler for user/holdings CRUD and aggregates
- **Next proxy:** `src/app/api/users/route.js` forwards to the deployed function URL

Optional one-time seed from local JSON:

```bash
node src/lib/migrate.mjs
```

(Requires Firebase Admin credentials and a populated `src/lib/data.json`.)

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint |

## License

ISC
