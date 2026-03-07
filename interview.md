# AI Interviewer System - Structure Documentation

This document explains the structure and architecture of the AI Interviewer UI system.

---

## Directory Structure

```
app/(main)/interview/
├── page.tsx                    # Interview Dashboard
├── session/
│   └── [id]/
│       └── page.tsx            # Live Interview Session
├── result/
│   └── [id]/
│       └── page.tsx            # Interview Results & Feedback
└── [id]/
    └── page.tsx                # Previous Interview Detail

components/interview/
├── InterviewCard.tsx           # Card component for displaying past interviews
├── StartInterviewModal.tsx     # Modal for configuring new interviews
└── InterviewClient.tsx         # Legacy client component (can be removed)

lib/
└── mockData.ts                 # Mock data for interviews, transcripts, questions
```

---

## Routes Overview

| Route                     | Purpose                                                                 |
| ------------------------- | ----------------------------------------------------------------------- |
| `/interview`              | Dashboard showing all past interviews with "Start New Interview" button |
| `/interview/session/[id]` | Live interview session with recording and question progression          |
| `/interview/result/[id]`  | Post-interview results with AI feedback and suggested answers           |
| `/interview/[id]`         | View transcript of a previous interview                                 |

---

## Components

### 1. InterviewCard (`components/interview/InterviewCard.tsx`)

Displays a summary card for each past interview.

**Props:**

```ts
interface InterviewCardProps {
  interview: Interview;
}
```

**Features:**

- Company name with icon
- Score badge with color coding (green ≥8, yellow ≥6, red <6)
- Interview type badge (Technical/HR/Behavioral)
- Difficulty level
- Duration and date
- Topics tags
- "View Transcript" button

---

### 2. StartInterviewModal (`components/interview/StartInterviewModal.tsx`)

Modal dialog for configuring a new mock interview.

**State Variables:**

```ts
company: string
interviewType: "Technical" | "HR" | "Behavioral"
difficulty: "Easy" | "Medium" | "Hard"
selectedTopics: string[]
questionCount: number
```

**Features:**

- Company dropdown selection
- Interview type radio buttons
- Difficulty selection
- Multi-select topics (toggle buttons)
- Question count input
- Validation before starting

---

## Pages

### 1. Interview Dashboard (`app/(main)/interview/page.tsx`)

**Purpose:** Landing page for the interview system.

**Layout:**

```
┌─────────────────────────────────────────────┐
│  Mock Interviews          [Start New Interview] │
│  Practice with AI-powered interviews           │
├─────────────────────────────────────────────┤
│  Your Previous Interviews                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  Card   │ │  Card   │ │  Card   │           │
│  └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────┘
```

---

### 2. Interview Session (`app/(main)/interview/session/[id]/page.tsx`)

**Purpose:** Live interview experience with speech recording.

**Layout:**

```
┌─────────────────────────────────────────────┐
│  Google | Technical | Medium        ⏱ 12:45  │
├───────────┬─────────────────────────────────┤
│ Progress  │  Question 1 of 5                 │
│           │  [Progress Bar]                  │
│ Q1 ✓      │                                  │
│ Q2 →      │  ┌─────────────────────────────┐│
│ Q3        │  │ Explain REST vs GraphQL     ││
│ Q4        │  └─────────────────────────────┘│
│ Q5        │                                  │
│           │        🎤 (Record Button)        │
│           │                                  │
│           │  ┌─────────────────────────────┐│
│           │  │ Your Answer                 ││
│           │  │ [Transcript appears here]   ││
│           │  └─────────────────────────────┘│
│           │                                  │
│           │  [Next Question]                 │
└───────────┴─────────────────────────────────┘
```

**State Variables:**

```ts
currentQuestionIndex: number
transcript: string
isRecording: boolean
timer: number
answers: string[]
```

---

### 3. Interview Result (`app/(main)/interview/result/[id]/page.tsx`)

**Purpose:** Display AI feedback and analysis after interview completion.

**Layout:**

```
┌─────────────────────────────────────────────┐
│  ✓ Interview Complete                        │
│                                              │
│  Interview Summary              ┌──────────┐│
│  Company: Google                │  8/10    ││
│  Type: Technical                │  Score   ││
│  Duration: 18 min               └──────────┘│
│  Date: 7 Mar 2026                            │
├─────────────────────────────────────────────┤
│  Detailed Feedback                           │
│                                              │
│  Q1: Explain REST vs GraphQL                 │
│  ┌─────────────────────────────────────────┐│
│  │ Your Answer: ...                        ││
│  │ AI Feedback: ...                        ││
│  │ Suggested Answer: ...                   ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

---

### 4. Interview Detail (`app/(main)/interview/[id]/page.tsx`)

**Purpose:** View transcript of a previous interview.

Similar to Result page but accessed from dashboard cards. Shows:

- Interview metadata (company, type, difficulty, score)
- Full transcript with questions and answers
- AI feedback for each question

---

## Mock Data Structure (`lib/mockData.ts`)

```ts
// Interview type
interface Interview {
  id: string;
  company: string;
  type: "Technical" | "HR" | "Behavioral";
  score: number;
  duration: string;
  date: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
}

// Transcript item type
interface TranscriptItem {
  question: string;
  answer: string;
  feedback: string;
  suggestedAnswer?: string;
}

// Exports
export const interviews: Interview[];
export const transcripts: Record<string, TranscriptItem[]>;
export const questions: string[];
export const companies: string[];
export const interviewTypes: readonly string[];
export const difficulties: readonly string[];
export const topics: string[];
```

---

## User Flow

```
┌─────────────────┐
│ Interview       │
│ Dashboard       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌─────────────┐
│ View    │ │ Start New   │
│ Previous│ │ Interview   │
│ Interview│ │ (Modal)     │
└────┬────┘ └──────┬──────┘
     │              │
     ▼              ▼
┌─────────┐ ┌─────────────┐
│ Interview│ │ Live Session│
│ Detail   │ │ /session/id │
│ /[id]    │ └──────┬──────┘
└─────────┘        │
                   ▼
            ┌─────────────┐
            │ Results     │
            │ /result/id  │
            └──────┬──────┘
                   │
                   ▼
            ┌─────────────┐
            │ Saved in    │
            │ Dashboard   │
            └─────────────┘
```

---

## Future Integration Points

### Phase 9 - Backend Integration

1. **Speech Recognition**
   - Replace mock transcript with Browser SpeechRecognition API
   - Location: `app/(main)/interview/session/[id]/page.tsx`
   - Use `InterviewClient.tsx` as reference for implementation

2. **AI Evaluation**
   - Send transcript to Gemini/GPT API
   - Location: Create API route at `app/api/interview/evaluate/route.ts`

3. **Database Storage**
   - Store interviews using Prisma
   - Add Interview model to `prisma/schema.prisma`
   - Create API routes for CRUD operations

4. **Real-time Session Management**
   - Create interview sessions in database
   - Generate unique session IDs
   - Store answers and feedback

---

## Styling Notes

- Dark theme: `bg-[#080808]` base, `bg-neutral-900/50` for cards
- Accent color: Amber (`amber-500`)
- Score colors: Green (≥8), Yellow (≥6), Red (<6)
- Uses shadcn/ui components: Card, Button, Badge, Dialog, Select, Input, Progress
- Grid background pattern from main layout

---

## Quick Start

1. Navigate to `/interview` to see the dashboard
2. Click "Start New Interview" to open configuration modal
3. Configure and click "Start Interview"
4. Answer questions by clicking the record button (mock mode)
5. Click "Next Question" to progress
6. View results on completion
7. Access past interviews from dashboard cards
