# BaseCase — Project Roadmap & High-Level Requirements

> BTech Major Project | Full-Stack DSA + AI Interview Platform
> Stack: Next.js · TypeScript · Prisma · PostgreSQL · WebSocket · WebRTC · LangChain · LangGraph · Gemini Vision

---

## Overview

BaseCase is a structured DSA learning and AI-powered interview preparation platform. The project is divided into three major feature modules on top of the existing foundation (auth, sheets, problem tracking, Judge0 integration).

| Module | Core Tech | Status |
|---|---|---|
| Existing platform (auth, sheets, progress, analytics) | Next.js, Prisma, PostgreSQL | ✅ Done |
| Real-time code execution feed | WebSocket | 🔨 Build next |
| AI Interview — DSA mode | LangGraph, WebSocket, Judge0 | 🔨 Build next |
| AI Interview — System Design mode | LangGraph, Gemini Vision, Canvas | 🔨 Build next |
| Voice input | getUserMedia, Whisper STT | 🔨 Optional |

---

## Module 1 — Real-time Code Execution Feed

### What it is
Replace the current Judge0 poll-on-submit with a persistent WebSocket connection that streams test case results one by one as they complete. User sees `Queued → Running → Test 1 ✓ → Test 2 ✗` live instead of waiting for a spinner.

### Why it matters
- Covers WebSocket requirement for the project
- Works entirely with a single user — no scale needed
- Dramatically better UX with minimal backend change
- Clean demo: open the editor, hit run, watch results stream in

### High-Level Requirements

| # | Requirement |
|---|---|
| 1 | Each authenticated user gets a persistent WebSocket channel on the server |
| 2 | On code submission, backend sends job to Judge0 and begins polling internally |
| 3 | Each status transition (queued, running, per test case result) is pushed down the socket |
| 4 | Frontend renders a live feed — each test case appears as it resolves |
| 5 | Show memory usage and execution time per test case |
| 6 | On disconnect/reconnect, reattach to in-progress job if still running |

### Tech Required

| Layer | Technology |
|---|---|
| WebSocket server | `ws` library or Socket.IO on Node.js backend |
| Job tracking | In-memory map (jobId → userId → socket) |
| Judge0 polling | Existing `NODE_BACKEND_URL` backend, polling loop per submission |
| Frontend | `useWebSocket` hook, animated test case result list |
| State | Job status stored in Redis or Postgres for reconnect recovery |

### Effort estimate
**3–4 days**

---

## Module 2 — AI Interview: DSA Mode

### What it is
A full interview simulation for DSA problems. The AI acts as an interviewer — it asks a question, watches the user code in real time, gives adaptive follow-ups ("can you optimise?", "what's the time complexity?"), runs the code against test cases, and gives a structured feedback report at the end.

### Why it matters
- Covers LangGraph (stateful multi-step agent) requirement
- WebSocket streams AI tokens live (ChatGPT-style)
- Judge0 integration already exists — just wire it in
- Strong demo: feels like a real interview

### Interview Flow (LangGraph State Machine)

```
START
  └─► [ask_question]        AI picks a DSA problem based on user's weak topics
        └─► [await_code]    User codes in the editor (real-time WebSocket sync)
              └─► [hint_check]   If user is stuck >5 min, AI nudges (not solves)
                    └─► [run_code]     User submits → Judge0 runs → results streamed
                          └─► [follow_up]  AI asks complexity / edge case questions
                                └─► [verdict]    AI scores and generates feedback report
                                      └─► END
```

### High-Level Requirements

| # | Requirement |
|---|---|
| 1 | User selects interview type (DSA) and difficulty, session starts |
| 2 | LangGraph agent picks a problem based on user's weak topics from existing analytics |
| 3 | AI question is streamed token-by-token over WebSocket to the UI |
| 4 | Code editor is embedded in the interview screen (Monaco / CodeMirror) |
| 5 | AI can see the current code in the editor at any point (sent as context) |
| 6 | If user is idle for >5 min, LangGraph triggers a hint node — smallest nudge first |
| 7 | User submits → code runs on Judge0 → results streamed live (Module 1 reused) |
| 8 | After submission, AI asks 2–3 follow-up questions (complexity, edge cases, alternatives) |
| 9 | Session ends with a structured report: correctness, approach, complexity analysis, communication |
| 10 | Report saved to DB and accessible from dashboard |

### Tech Required

| Layer | Technology |
|---|---|
| Agent framework | LangGraph (Python or JS) — stateful graph with nodes per interview phase |
| LLM | Gemini 2.5 Flash (already in `.env`) |
| Streaming | LangChain streaming callbacks → WebSocket chunks to frontend |
| Code editor | Monaco Editor (same as VS Code) or CodeMirror 6 |
| Code execution | Existing Judge0 integration via `NODE_BACKEND_URL` |
| Context injection | User's current code + problem statement injected into each LLM call |
| Report storage | New `InterviewSession` Prisma model |
| Background jobs | BullMQ (already used) for report generation |

### New Prisma Models needed

```prisma
model InterviewSession {
  id          String   @id @default(cuid())
  userId      String
  mode        String   // "dsa" | "system_design" | "behavioural"
  problemId   String?
  transcript  Json     // array of {role, content, timestamp}
  report      Json?    // structured feedback
  score       Float?
  createdAt   DateTime @default(now())
  completedAt DateTime?
  user        User     @relation(fields: [userId], references: [id])
}
```

### Effort estimate
**1 – 1.5 weeks**

---

## Module 3 — AI Interview: System Design Mode

### What it is
The standout feature. AI asks a system design question ("Design a URL shortener"). User has a freehand drawing canvas alongside a chat panel. They draw their architecture (boxes for services, arrows for connections, labels), explain decisions in the chat. When done, the canvas is exported as a PNG and sent to Gemini Vision, which reads the diagram and gives detailed feedback.

### Why it matters
- Gemini Vision reading a hand-drawn architecture diagram is genuinely novel for a BTech project
- Natural use of multimodal LLM — not just text in/text out
- System design is the most requested interview format after DSA
- Canvas export → vision LLM is a clean, demonstrable pipeline

### Interview Flow

```
START
  └─► [ask_question]     AI picks a system design topic (URL shortener, Twitter, etc.)
        └─► [clarify]    AI asks 2 clarifying questions first (scale, requirements)
              └─► [user_designs]   User draws on canvas + explains in chat (20–30 min timer)
                    └─► [ai_probes]    AI asks follow-ups mid-session ("how does your DB handle writes?")
                          └─► [submit]      User clicks "Done"
                                └─► [vision_review]  Canvas PNG + chat transcript → Gemini Vision
                                      └─► [report]    Structured feedback rendered + saved
                                            └─► END
```

### High-Level Requirements

| # | Requirement |
|---|---|
| 1 | User selects System Design mode, AI picks a question and streams it |
| 2 | Screen splits: canvas on left, chat panel on right |
| 3 | Canvas supports: drag to draw boxes, click to label, draw arrows between boxes, freehand lines |
| 4 | Preset component stamps: Client, Server, Load Balancer, Cache, Database, CDN, Queue |
| 5 | Chat panel alongside canvas — user types design decisions, AI responds |
| 6 | 30-minute countdown timer visible on screen |
| 7 | AI asks 2–3 mid-session follow-up questions based on chat context |
| 8 | "Submit Design" button exports canvas as PNG via `canvas.toDataURL('image/png')` |
| 9 | PNG (base64) + full chat transcript sent to Gemini Vision API |
| 10 | Gemini evaluates: completeness, scalability, single points of failure, DB choice, missing components |
| 11 | Feedback rendered as structured report with scores per dimension |
| 12 | Session saved to `InterviewSession` table (same model as DSA mode) |

### Tech Required

| Layer | Technology |
|---|---|
| Canvas | HTML5 Canvas API directly, or lightweight lib like `Fabric.js` / `Konva.js` |
| Component stamps | SVG icons for common system components, drag-and-drop onto canvas |
| Canvas export | `canvas.toDataURL('image/png')` → base64 string |
| Vision LLM | Gemini Vision API (`gemini-2.5-flash` supports image input, already in `.env`) |
| Agent | LangGraph — same structure as DSA mode, different nodes |
| Chat streaming | WebSocket token streaming (same as Module 2) |
| Context | System prompt includes: question, user chat history, base64 canvas image |

### Gemini Vision API call shape

```typescript
const response = await gemini.generateContent([
  {
    inlineData: {
      mimeType: "image/png",
      data: base64CanvasImage,
    },
  },
  {
    text: `
      This is a system design diagram drawn by a candidate for the problem: "${question}".
      Their design decisions from the chat: "${chatTranscript}".
      
      Evaluate on:
      1. Completeness — are all major components present?
      2. Scalability — will this handle load?
      3. Single points of failure — what breaks under failure?
      4. Database choice — is it justified?
      5. Missing components — what's absent that a senior engineer would flag?
      
      Return structured JSON with scores (1–10) and detailed comments per dimension.
    `
  }
]);
```

### Effort estimate
**1 – 1.5 weeks**

---

## Module 4 — Voice Input (Optional / Bonus)

### What it is
Allow users to speak their explanations instead of typing, using the browser microphone. Audio is transcribed by Whisper and inserted as text into the chat panel. Works in both DSA and System Design interview modes.

### Why it matters
- Uses `getUserMedia` from the WebRTC spec — citable as WebRTC on resume
- Makes the interview feel more natural and realistic
- Relatively low effort using Whisper API

### High-Level Requirements

| # | Requirement |
|---|---|
| 1 | Mic button in chat panel — hold to record, release to transcribe |
| 2 | Audio captured via `navigator.mediaDevices.getUserMedia({ audio: true })` |
| 3 | Audio blob sent to backend, transcribed by Whisper (`openai/whisper-1` or local Whisper) |
| 4 | Transcribed text inserted into chat input, user can edit before sending |
| 5 | Visual indicator while recording and while transcribing |

### Tech Required

| Layer | Technology |
|---|---|
| Audio capture | `getUserMedia` + `MediaRecorder` API |
| Transcription | OpenAI Whisper API or `faster-whisper` self-hosted |
| Transport | REST (audio blob as multipart/form-data) — no WebSocket needed |

### Effort estimate
**2–3 days**

---

## Full Tech Stack Summary

| Area | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 App Router + TypeScript | Pages, API routes, SSR |
| Styling | Tailwind CSS | UI components |
| Database | PostgreSQL + Prisma ORM | All relational data |
| Auth | better-auth | Sessions, Google OAuth |
| Code execution | Judge0 (self-hosted on DigitalOcean) | Run and evaluate user code |
| WebSocket | `ws` / Socket.IO on Node backend | Real-time execution feed, AI streaming |
| Agent framework | LangGraph (Python or JS) | Stateful multi-step AI interview agent |
| LLM | Gemini 2.5 Flash (`GEMINI_API_KEY`) | Text generation, interview questions |
| Vision LLM | Gemini Vision (same key) | Canvas diagram evaluation |
| RAG | LangChain + pgvector | Context-aware hints from editorials |
| Voice | `getUserMedia` + Whisper | Speech-to-text in interviews |
| Background jobs | BullMQ + Redis | Report generation, async tasks |
| Deployment | Vercel (frontend) + DigitalOcean (backend + Judge0) | Production hosting |

---

## Build Order

```
Week 1    Real-time execution feed (WebSocket)
Week 2    DSA Interview mode (LangGraph + Monaco Editor)
Week 3    System Design canvas (HTML Canvas + component stamps)
Week 4    Gemini Vision integration + feedback report
Week 5    Voice input + polish + testing
Week 6    Thesis writing, evaluation, A/B notes
```

---

## Thesis / Report Angle

| Chapter | Content |
|---|---|
| 1. Problem statement | Why existing DSA platforms (Leetcode, TUF) lack adaptive interview simulation |
| 2. System architecture | Full stack diagram, WebSocket flow, LangGraph state machine, RAG pipeline |
| 3. AI Interview engine | LangGraph design, context injection strategy, streaming delivery |
| 4. Multimodal evaluation | Canvas → Gemini Vision pipeline, prompt engineering, structured output |
| 5. Results & evaluation | User study (5–10 participants), feedback quality scoring, latency metrics |

---

## Resume Bullets (post-build)

- "Engineered a stateful AI interview agent using LangGraph with context-aware DSA question selection, real-time code observation, and adaptive hint generation — streamed token-by-token over WebSockets."
- "Built a multimodal system design evaluator: exported HTML Canvas diagrams as PNG and passed them to Gemini Vision with chat transcripts, generating structured architectural feedback across 5 dimensions."
- "Replaced polling-based Judge0 integration with a persistent WebSocket pipeline, streaming per-test-case execution verdicts in real time."
- "Integrated `getUserMedia` for in-browser audio capture with Whisper STT transcription, enabling voice-driven interview responses."