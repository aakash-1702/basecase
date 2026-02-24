# BaseCase — Full-Stack DSA Learning Platform

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?logo=vercel&logoColor=white)

BaseCase is a **Take U Forward–style DSA practice platform** where users can explore structured sheets (Arrays, DP, Trees, Graphs, etc.), solve curated problems, track progress, and monitor consistency with streak-oriented learning.

Built with **Next.js App Router + Prisma + PostgreSQL**, it is production-ready, scalable, and designed for both learners and maintainers.

---

## 1) Project Overview

BaseCase helps users move from random problem solving to a **systematic DSA roadmap**:

- Browse topic-wise sheets and sections
- Solve problems with confidence and notes
- Track solved/unsolved progress across sheets
- View dashboard analytics by difficulty and sheet
- Stay consistent using streak/POTD style workflows
- Sign up/sign in securely using an auth system

---

## 2) Feature List

### Learning & Progress

- Structured DSA sheets and nested sections
- Problem-level tracking (`solved`, `confidence`, `notes`, `solvedAt`)
- Difficulty-based analytics (`easy`, `medium`, `hard`)
- Recent submissions and recommendation-oriented signals

### Platform Capabilities

- Full CRUD flows for sheets, sections, and problem assignment
- Relational data modeling via Prisma ORM
- Auth-protected API routes and pages
- Server-rendered dashboard with user session context

### Engineering

- Next.js App Router architecture (RSC + route handlers)
- Type-safe backend and frontend with TypeScript
- Tailwind-based UI with reusable component system
- Ready for Vercel deployment

---

## 3) Tech Stack

### Frontend + Backend

- **Next.js 14+ (currently Next.js 16 in this repo)**
- **React + TypeScript**
- **App Router, Route Handlers, Server Components**

### Database

- **PostgreSQL**
- **Prisma ORM**

### Auth & Styling

- **better-auth** (custom auth flow)
- **Tailwind CSS**

### Deployment

- **Vercel**

---

## 4) Screenshots

> Add real screenshots to the `public/` folder and update paths below.

| Page          | Preview                                                  |
| ------------- | -------------------------------------------------------- |
| Home          | ![Home](./public/screenshots/home.png)                   |
| Dashboard     | ![Dashboard](./public/screenshots/dashboard.png)         |
| Problems      | ![Problems](./public/screenshots/problems.png)           |
| Sheet Details | ![Sheet Details](./public/screenshots/sheet-details.png) |

---

## 5) Local Setup Instructions

### Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)
- PostgreSQL instance (local or hosted)

### Install & Run

```bash
git clone <your-repo-url>
cd basecase
npm install
```

Create a `.env` file in project root (see variables below), then run:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

App URL: `http://localhost:3000`

---

## 6) Environment Variables

Create `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"

BETTER_AUTH_SECRET="replace-with-long-random-secret"
BETTER_AUTH_URL="http://localhost:3000"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

SEED_KEY="replace-with-seed-secret"

# Optional / project-specific
NODE_BACKEND_URL="http://localhost:5023"
GEMINI_API_KEY="optional"
GEMINI_MODEL_NAME="gemini-2.5-flash-lite"
NODE_ENV="development"
```

> Never commit real secrets to git. Rotate keys immediately if leaked.

---

## 7) Prisma Migrations & DB Setup

### Generate Client

```bash
npx prisma generate
```

### Apply Existing Migrations (prod/staging style)

```bash
npx prisma migrate deploy
```

### Create New Migration During Development

```bash
npx prisma migrate dev --name <descriptive_migration_name>
```

### Optional Seed

```bash
npm run seed
```

`scripts/seed.ts` uses `x-seed-key`, so ensure `.env` has matching `SEED_KEY`.

---

## 8) Running Dev & Production Builds

### Development

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

### Production Build

```bash
npm run build
npm run start
```

Current `build` script:

- `prisma generate && next build`

---

## 9) API Route Examples

Base path: `/api`

### Auth (better-auth handler)

- `GET /api/auth/[...all]`
- `POST /api/auth/[...all]`

### Sheets

- `GET /api/sheets` → list sheets
- `POST /api/sheets` → create sheet
- `GET /api/sheets/:sheetId/section` → sheet with ordered sections/problems
- `POST /api/sheets/:sheetId/section` → create section
- `POST /api/sheets/:sheetId/section/:sectionId` → add problem to section

### Problems

- `GET /api/problems?page=1&limit=5&difficulty=easy&status=solved&search=array`
- `POST /api/problems` → create problem
- `PATCH /api/problems/:problemId/progress` → upsert user progress

### Dashboard

- `GET /api/dashboard` → analytics, sheet progress, recent submissions

### Example: Update Problem Progress

```bash
curl -X PATCH http://localhost:3000/api/problems/<problemId>/progress \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "solved": true,
    "confidence": "confident",
    "notes": "Revisit binary lifting variant"
  }'
```

---

## 10) Database Schema Explanation

Core relational entities:

- **User**: profile + role + auth-linked sessions/accounts + user progress
- **Problem**: canonical coding problem with tags, difficulty, links
- **Sheet**: top-level DSA track (e.g., Arrays, DP)
- **SheetSection**: ordered subsections within a sheet
- **SectionProblem**: join model mapping ordered problems to a section
- **UserProblem**: per-user problem state (`solved`, `confidence`, `attempts`, `notes`, `solvedAt`)

### Relationship Summary

- `Sheet 1—N SheetSection`
- `SheetSection 1—N SectionProblem`
- `Problem 1—N SectionProblem`
- `User 1—N UserProblem`
- `Problem 1—N UserProblem`

This design supports:

- reusable problems across multiple sections
- user-specific progress without mutating canonical problem data
- efficient aggregation for dashboard analytics

---

## 11) Folder Structure

```bash
basecase/
├── app/
│   ├── (auth)/
│   │   └── auth/
│   │       ├── sign-in/
│   │       └── sign-up/
│   ├── (main)/
│   │   ├── dashboard/
│   │   ├── problems/
│   │   ├── sheets/
│   │   └── interview/
│   └── api/
│       ├── auth/[...all]/
│       ├── dashboard/
│       ├── problems/
│       └── sheets/
├── components/
│   ├── problems/
│   └── ui/
├── generated/prisma/
├── lib/
├── hooks/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── scripts/
│   └── seed.ts
└── public/
```

---

## 12) Deployment (Vercel)

1. Push repository to GitHub.
2. Import project in Vercel.
3. Configure environment variables in Vercel Project Settings.
4. Ensure `DATABASE_URL` points to your production PostgreSQL.
5. Build command (already compatible):
   - `npm run build`
6. Start command:
   - `npm run start`
7. Deploy.

### Recommended Production Checklist

- Enable SSL on DB connection
- Use strong `BETTER_AUTH_SECRET`
- Restrict CORS/origin where needed
- Run `prisma migrate deploy` during CI/CD

---

## 13) Common Issues & Fixes

### 1) `PrismaClientInitializationError`

**Cause:** Invalid `DATABASE_URL` or database unreachable.

**Fix:** Verify credentials, host, SSL mode, and network access.

### 2) Migration drift / schema mismatch

**Fix:**

```bash
npx prisma migrate status
npx prisma migrate dev
```

### 3) Unauthorized API responses (`401`)

**Cause:** Missing/expired session cookie.

**Fix:** Sign in again and ensure authenticated requests forward cookies.

### 4) Seed script fails

**Cause:** `SEED_KEY` mismatch.

**Fix:** Keep `x-seed-key` in `scripts/seed.ts` aligned with `.env` `SEED_KEY`.

### 5) Build fails due to Prisma types/client

**Fix:**

```bash
npx prisma generate
npm run build
```

---

## 14) Future Roadmap

- Daily streak engine with timezone-safe reset logic
- Problem of the Day (POTD) persistence + archive
- Advanced analytics (heatmaps, topic-wise consistency)
- Editorials, hints, and spaced-revision workflows
- Contest mode + custom sheet sharing
- Admin tooling for bulk imports and moderation

---

## 15) Contribution Guide

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Make focused, testable changes
4. Run lint/build locally
5. Open a Pull Request with clear context

### Local quality checks

```bash
npm run lint
npm run build
```

Please keep PRs small and include screenshots for UI changes.

---

## 16) License

This repository currently has no `LICENSE` file committed.

For open-source usage, add an MIT license file:

```text
MIT License
```

---

### Maintainer Notes

- Keep schema and API docs in sync when adding new models/routes.
- Do not commit real secrets in `.env`.
- If authentication strategy changes, update env docs and API examples accordingly.
