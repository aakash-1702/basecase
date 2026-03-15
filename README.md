# BaseCase — Full-Stack DSA Learning Platform

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?logo=vercel&logoColor=white)

BaseCase is a **Take U Forward–style DSA practice platform** designed to help users transition from random problem-solving to a structured, goal-oriented learning experience. With a focus on **data structures and algorithms (DSA)**, BaseCase offers curated problem sheets, progress tracking, and analytics to ensure learners stay consistent and motivated.

---

## 1) Project Overview

BaseCase is a comprehensive platform for mastering DSA through:

- **Structured Learning**: Topic-wise sheets covering Arrays, Dynamic Programming, Trees, Graphs, and more.
- **Progress Tracking**: Monitor solved problems, confidence levels, and notes.
- **Analytics**: Gain insights into your learning journey with difficulty-based and sheet-specific dashboards.
- **Consistency Tools**: Stay on track with streak-based workflows and Problem of the Day (POTD).
- **Secure Authentication**: Sign up and sign in with robust session management.

---

## 2) Feature List

### Platform Features

1. **Structured DSA Sheets**:
   - Curated sheets with nested sections for systematic learning.
   - Includes popular sheets like "Blind 75", "NeetCode 150", and "Striver's SDE Sheet".
   - Sheets are difficulty-ramped and concept-ordered.

2. **Problem Tracking**:
   - Tracks problem-level progress (`solved`, `confidence`, `notes`, `solvedAt`).
   - Provides analytics based on difficulty levels (`easy`, `medium`, `hard`).

3. **Custom Sheet Builder**:
   - Allows users to create, reorder, and share custom sheets.
   - Public and private sheet options with ownership permissions.

4. **AI Mentor**:
   - Offers features like:
     - Smart Hints.
     - Complexity Coaching.
     - Debug Assistance.
     - Pattern Matching.
   - Provides unlimited chats for premium users.

5. **Mock Interviews**:
   - Simulates real technical and behavioral interviews.
   - Includes voice-first design and adaptive follow-ups.
   - Provides detailed feedback on confidence, depth, clarity, and technical accuracy.

6. **Instant Feedback**:
   - Real-time code analysis and results submission.

7. **Radar Chart Analytics**:
   - Visualizes strengths and weaknesses across topics.
   - Highlights areas needing improvement.

8. **Subscription Plans**:
   - Offers premium features like unlimited mock interviews, AI feedback reports, and company-specific interview patterns.

9. **Interview Modes**:
   - Covers DSA, Technical, HR, and Behavioral interviews.
   - Includes company-specific patterns (e.g., Amazon's leadership principles).

10. **Progress Syncing**:
    - Automatically syncs progress across sheets and problems.

### Engineering Features

1. **Next.js App Router**:
   - Utilizes server-rendered pages and route handlers.
   - Type-safe backend and frontend with TypeScript.

2. **Reusable UI Components**:
   - Built with Tailwind CSS.
   - Includes components like buttons, cards, modals, and tooltips.

3. **Prisma ORM**:
   - Manages relational data modeling for sheets, sections, and problems.

4. **Authentication**:
   - Supports email/password and Google OAuth.
   - Includes premium user roles and session management.

5. **API Routes**:
   - Auth-protected routes for CRUD operations on sheets and problems.
   - Public API for accessing shared sheets.

6. **AI Integration**:
   - AI-driven code reviews and interview simulations.
   - Uses structured JSON prompts for generating responses.

---

## 3) Planned Features (Future Roadmap)

1. **Daily Streak Engine**:
   - Tracks user activity with timezone-safe resets.

2. **Problem of the Day (POTD)**:
   - Persistent archive for daily challenges.

3. **Advanced Analytics**:
   - Heatmaps and topic-wise consistency tracking.

4. **Contest Mode**:
   - Enables custom sheet sharing and competitive practice.

5. **Admin Tools**:
   - Bulk imports and moderation capabilities.

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

Create a `.env` file in the project root (see variables below), then run:

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
