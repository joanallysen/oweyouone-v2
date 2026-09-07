# OweYouOne

**A personal expense tracker for friends — see who owes whom, split bills evenly, and settle up over time.**

---

## Overview

Shared expenses between friends, roommates, and travel groups are easy to lose track of. OweYouOne gives each user a private ledger of what they owe and what others owe them. Add contacts by email, record individual expenses in either direction, split a bill evenly across multiple people, archive settled items, and review a chronological activity feed — all from a mobile-first web app.

---

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| [Next.js](https://nextjs.org/) (App Router) | 16.3.1 | Full-stack React framework — Server Components for data pages, Route Handlers for the REST API |
| [React](https://react.dev/) | 19.2.4 | UI rendering |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | End-to-end type safety |
| [Neon](https://neon.tech/) (`@neondatabase/serverless`) | 1.1.0 | Serverless Postgres — queried directly via tagged SQL templates, no ORM |
| [jose](https://github.com/panva/jose) | 6.2.12 | HS256 JWT signing and verification for session tokens |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 3.0.3 | Password hashing at signup and login |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first styling with CSS custom properties for theming |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4.6 | Client-side theme switching (dark, light, bloom) |
| [lucide-react](https://lucide.dev/) | 1.30.0 | Icon set for navigation and actions |
| **Deployment** | — | [Vercel](https://vercel.com/) — zero-config Next.js hosting with serverless function execution |

---

## Key Features

- **User authentication** — email/password signup and login with bcrypt-hashed credentials
- **Contact management** — add contacts by registered email; relationships are stored bidirectionally so both users see each other
- **Expense tracking** — record who paid and who borrowed, with per-contact net balance summaries on the home screen
- **Bill splitting** — select multiple contacts, enter a total, and split evenly (cent-accurate remainder handling) or assign custom amounts per person
- **Settlement / archiving** — mark active expenses as archived when settled; view completed history per contact
- **Activity feed** — chronological log of created, archived, and unarchived expenses, grouped by date
- **User profile** — display name, bio, and lifetime balance summary; theme preference (dark / light / bloom)
- **PWA-ready** — web app manifest and a dedicated offline fallback page for installable, mobile-friendly use

---

## Architecture & Technical Highlights

### Server Components with selective Client boundaries

Data-heavy pages (`/`, `/activity`, `/contacts/[id]`, `/split`, `/profile`) are **async Server Components** that fetch directly from Postgres and pass results as props. Interactive surfaces — forms, filtered lists, bottom navigation, theme switcher — are isolated in `'use client'` components. This keeps the initial HTML meaningful and avoids shipping unnecessary JavaScript for read-only UI.

Because every authenticated page calls `cookies()` via `getSession()`, routes render **dynamically on each request** rather than being statically cached at build time. This is the correct trade-off for a session-gated app where balances must reflect live data.

### Custom JWT sessions (no third-party auth provider)

Authentication is handled in-house without NextAuth or Clerk:

1. On login, a **signed JWT** (`userId` claim, HS256) is written to an `httpOnly`, `secure`, `sameSite: 'lax'` cookie named `session`.
2. `getSession()` verifies the token on every protected page and API route; invalid or expired tokens return `null` and trigger a redirect to `/login`.
3. Passwords are hashed with bcrypt (cost factor 10) before storage.

This approach keeps the auth surface small, avoids external dependencies, and demonstrates understanding of cookie security properties relevant to XSS and CSRF mitigation.

### Neon serverless Postgres

The database client is a single exported `sql` tagged-template function:

```ts
import { neon } from '@neondatabase/serverless';
export const sql = neon(process.env.DATABASE_URL!);
```

Neon's HTTP-based driver fits serverless deployment on Vercel — no persistent TCP connection pool to manage, and queries execute over fetch. Raw SQL (rather than an ORM) keeps aggregation queries explicit, e.g. the home page computes per-contact `i_owe`, `they_owe`, and `net` balances in a single `GROUP BY` query with conditional `SUM … FILTER` clauses.

### Authorization at the query level

API routes enforce ownership before mutating data:

- Expense creation verifies the target is in the caller's contact list
- Expense archival requires the caller to be either `payer_id` or `borrower_id`
- Split creation validates every `contactId` against the user's contacts before inserting

Pages mirror the same checks — contact detail routes return 404 if the ID is not a valid contact, preventing ID enumeration.

### Split expense model

Multi-person splits create one expense row per contact, linked by a shared `split_id` from a Postgres sequence. The activity table records a single event per split (referencing the first expense row) so the feed stays readable. Cent-based even splitting (`splitEvenly` in `app/lib/split.ts`) distributes rounding remainders to the first N participants, avoiding floating-point drift.

### Styling and theming

Tailwind CSS v4 is configured via `@theme inline` in `globals.css`, mapping semantic tokens (`--color-owe`, `--color-owed`, `--color-bg`, etc.) to CSS variables. Three complete palettes (dark, light, bloom) swap via `data-theme` attributes managed by `next-themes`. Google Fonts (Inter, Playfair Display) are loaded through `next/font` for zero layout shift.

### PWA support

`app/manifest.ts` exposes a Web App Manifest (standalone display, theme colors, icon references). An `/offline` page provides a user-facing fallback when connectivity is lost. Full offline caching via a service worker is not yet implemented — the app is online-first with installable metadata.

---

## Project Structure

```
oweyouone-v2/
├── app/
│   ├── api/                  # Route Handlers (REST endpoints)
│   │   ├── login/            # POST — authenticate, set session cookie
│   │   ├── logout/           # POST — clear session
│   │   ├── signup/           # POST — register user + profile row
│   │   ├── contacts/         # POST — add bidirectional contact
│   │   ├── profile/          # GET / POST — read and update profile
│   │   └── expenses/
│   │       ├── route.ts      # POST — create single expense
│   │       ├── split/        # POST — create multi-contact split
│   │       └── [id]/         # PATCH — archive / unarchive
│   ├── components/           # Shared UI (Client Components)
│   ├── lib/                  # App-level utilities (dates, split math, activity copy)
│   ├── contacts/[id]/        # Contact detail, add expense, archived history
│   ├── split/                # Contact picker → amount entry flow
│   ├── activity/             # Activity feed (Server Component)
│   ├── profile/              # Profile view and edit
│   ├── login/ & signup/      # Auth pages (Client Components)
│   ├── offline/              # Offline fallback page
│   ├── manifest.ts           # PWA manifest
│   ├── layout.tsx            # Root layout, fonts, theme provider
│   └── page.tsx              # Home — contact list with net balances
├── lib/
│   ├── db.ts                 # Neon SQL client
│   └── session.ts            # JWT create / verify / delete
└── public/icons/             # App icons and SVG assets
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech/) Postgres database (or any Postgres instance compatible with the serverless driver)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd oweyouone-v2
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL=your_database_url_here
SESSION_SECRET=your_random_secret_at_least_32_chars
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `SESSION_SECRET` | Secret key used to sign and verify JWT session tokens (use a long random string) |

> **Note:** Never commit `.env.local` or real credentials to version control.

The database expects tables for `users`, `profile`, `contacts`, `expenses`, `activity`, and a `split_id_seq` sequence. Schema migrations are managed outside this repository.

### 3. Run locally

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

### 4. Deploy

Push to a Git repository connected to [Vercel](https://vercel.com/). Set `DATABASE_URL` and `SESSION_SECRET` in the Vercel project environment settings. No additional build configuration is required.

---

## Screenshots

<!-- add screen shor here later
     Suggested captures:
       - Home screen with contact balances
       - Contact detail with expense list
       - Split flow (contact picker + amount entry)
       - Activity feed
     Optional: link to a live demo or GIF hosted on GitHub / Cloudinary. -->

---

