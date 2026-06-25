# Interview Room — Deep Dive Notes

> **Scope:** `components/interview/room/` — all sub-components that power the live interview experience.

---

## 1. Components Overview

| Component | File | Type | Purpose |
|---|---|---|---|
| `InterviewRoom` | `InterviewRoom.tsx` | Client (`"use client"`) | **Primary controller** for the new interview flow. Manages the phase-based state machine (loading → speaking → answering → recording → submitting → complete), orchestrates audio playback, speech recognition, and answer submission. |
| `ActiveRoom` | `ActiveRoom.tsx` | Client | **Legacy/SSE-based controller**. Uses Server-Sent Events for real-time AI responses with an ordered chunk queue for audio playback. Currently the one used in production via `new-session` route. |
| `TranscriptArea` | `TranscriptArea.tsx` | Client | Dual-mode component rendering conversation history. Supports both `InterviewRoom` (phase-based props) and `ActiveRoom` (legacy SSE props) via conditional prop interfaces. |
| `UserPanel` | `UserPanel.tsx` | Client | User-side panel showing avatar, mic status indicator, and recording controls. Dual-mode (new + legacy). |
| `AIPanel` | `AIPanel.tsx` | Client | AI interviewer visual representation — animated orb (`orbBreath` animation) with state-driven styling (asking/waiting/processing). |
| `BottomControlBar` | `BottomControlBar.tsx` | Client | Start/Stop speaking controls for the legacy `ActiveRoom` flow. Not used by `InterviewRoom`. |
| `BrowserGateScreen` | `BrowserGateScreen.tsx` | Client | Blocks entry if browser lacks Web Speech API support. Feature-detection based (no UA sniffing). |
| `CompletionOverlay` | `CompletionOverlay.tsx` | Client | Full-screen loading overlay shown when interview completes, handles redirect to results page. |
| `EndSessionModal` | `EndSessionModal.tsx` | Client | Confirmation dialog for ending an interview early. Calls `onConfirm` (async) and handles loading state. |
| `LobbyScreen` | `LobbyScreen.tsx` | Client | Pre-interview landing screen showing session config (company, mode, difficulty, question count) and prep tips. |
| `PreparingScreen` | `PreparingScreen.tsx` | Client | Loading sequence while the interview room initializes. Shows step-by-step status (connecting → generating → ready), handles error + retry. |
| `RoomTopBar` | `RoomTopBar.tsx` | Client | Top navigation bar showing interview metadata (company, mode, timer) and "End Interview" action. Dual-mode. |

**No Server Components** — every component is `"use client"` because they interact with browser APIs (Web Speech, Audio, DOM events).

**No dynamic imports** — all room components are statically imported. The parent page (`new-session/page.tsx`) conditionally renders them based on the `view` state.

---

## 2. Hooks Used

### Built-in React Hooks

| Hook | Where Used | Why |
|---|---|---|
| `useState` | Every component | Local UI state (phase, transcript, isRecording, etc.) |
| `useRef` | `InterviewRoom`, `ActiveRoom`, `TranscriptArea` | Persisting mutable values (recognition instance, audio element, scrollable container ref, chunk queue) without triggering re-renders |
| `useEffect` | `InterviewRoom`, `ActiveRoom`, `TranscriptArea` | Side effects: fetching greeting on mount, auto-scrolling transcript, playing audio |
| `useCallback` | `InterviewRoom`, `ActiveRoom` | Memoizing handlers (recording start/stop, answer submission) to avoid unnecessary child re-renders |

### Custom Hooks

| Hook | Used In | Purpose |
|---|---|---|
| `useSpeechRecognition` | `InterviewRoom` | Wraps Web Speech API. Returns `{ transcript, isListening, startListening, stopListening, resetTranscript, error }`. Handles auto-restart on `onend`, error mapping, interim + final transcript reconciliation. |
| `useAudioPlayer` | `InterviewRoom` | Wraps `HTMLAudioElement` for base64 audio playback. Returns `{ playAudio, isPlaying, needsManualPlay, triggerManualPlay }`. Handles autoplay policy blocks gracefully. |

### Interview-Specific Hook: `useSpeechRecognition` — Deep Dive

**Why a custom hook?** The Web Speech API has several pain points:
1. **Browser kills recognition after silence** even with `continuous: true`. The hook auto-restarts via the `onend` handler.
2. **Interim vs final results** — the API streams both. The hook reconciles them into a single `transcript` string using a `finalTranscriptRef` to avoid overwriting committed text.
3. **Error mapping** — raw error codes (`not-allowed`, `network`, `audio-capture`) are mapped to user-friendly messages.
4. **Cleanup** — unmounting stops the recognition instance and releases mic.

**Stale closure gotcha:** The `onend` handler references `isListening` to decide whether to auto-restart. Because it's defined inside a `useEffect([])`, it captures the initial value. This is why the `recognitionRef` pattern is used — the handler checks `recognitionRef.current` (always fresh) rather than the closed-over state.

### Interview-Specific Hook: `useAudioPlayer` — Deep Dive

**Why a custom hook?** Playing base64-encoded audio from the API involves:
1. **Base64 → Blob → ObjectURL → Audio element** pipeline.
2. **Autoplay policy handling** — browsers block `audio.play()` without user interaction. If blocked, stores the pending audio and exposes `needsManualPlay` + `triggerManualPlay` so the UI can show a "Click to play" button.
3. **Promise-based API** — `playAudio()` returns a `Promise<void>` that resolves when audio ends. This lets `InterviewRoom` `await` it before transitioning to the next phase.
4. **Memory management** — `URL.revokeObjectURL()` on cleanup to prevent memory leaks.
5. **Never rejects** — errors resolve (not reject) so the interview continues in text-only mode.

---

## 3. State Management

### InterviewRoom — Phase-Based State Machine

```
Phase type = "loading" | "speaking" | "answering" | "recording" | "submitting" | "error" | "complete"
```

**Flow:**
```
loading → speaking → answering ↔ recording → submitting → speaking → ... → complete
```

| Phase | What Happens | Key State |
|---|---|---|
| `loading` | Fetch greeting from `/api/interview/{id}/join-interview`. Play greeting audio. | `phase`, `history`, `transcript` |
| `speaking` | AI audio playing via `useAudioPlayer`. Mic locked. | `isPlaying` from hook |
| `answering` | Waiting for user to click "Start Recording". Mic available. | User interaction gate |
| `recording` | `useSpeechRecognition.startListening()` active. Live transcript updates. | `sttTranscript` |
| `submitting` | POST to `/api/interview/{id}/answer-question` with transcript. Wait for AI response. | `isSubmitting` flag |
| `complete` | Interview ended. Show `CompletionOverlay`, redirect to report. | Overlay visible |
| `error` | Something failed. Show error + retry button. | `errorMessage` |

**Key state variables in InterviewRoom:**
- `phase: Phase` — drives the entire UI
- `history: HistoryTurn[]` — accumulated Q&A turns
- `currentAiMessage: string` — what the AI is currently saying
- `sttTranscript: string` — live speech recognition text
- `turnIndex: number` — current question number

### ActiveRoom — SSE + Queue-Based Architecture

The legacy `ActiveRoom` uses a fundamentally different approach:

**SSE Stream Reader Pattern:**
```typescript
// Opens EventSource to /api/interview/{id}/stream
const reader = response.body.getReader();
// Reads chunks in a while(true) loop
// Each chunk has: { type: "text" | "audio", index: number, data: string }
```

**Ordered Chunk Queue:**
- Chunks arrive from SSE potentially out of order
- A `Map<number, Chunk>` acts as a buffer
- A `nextExpectedIndex` counter processes chunks sequentially
- Text chunks update the transcript; audio chunks queue for playback

**Why two implementations exist:**
- `InterviewRoom` uses a simpler request-response pattern (POST answer → get full response)
- `ActiveRoom` uses streaming for real-time word-by-word text + chunked audio
- The streaming approach provides better UX (words appear as they generate) but is more complex

### TranscriptArea — Dual-Mode Pattern

```typescript
// New mode props (from InterviewRoom)
interface TranscriptAreaProps {
  history: HistoryTurn[];
  currentAiMessage: string;
  sttTranscript: string;
  phase: Phase;
}

// Legacy mode props (from ActiveRoom)  
interface LegacyTranscriptAreaProps {
  messages: TranscriptMessage[];
  turnState: TurnState;
  currentTranscript: string;
}
```

**Why dual-mode?** Both room implementations needed a transcript display. Rather than duplicating the component, it accepts either prop interface and conditionally renders. This is a pragmatic tradeoff — it keeps the component count low at the cost of some complexity in the prop types.

---

## 4. Data Fetching

| Endpoint | Method | Called From | Purpose |
|---|---|---|---|
| `/api/interview/{id}/join-interview` | POST | `new-session/page.tsx` → `fireJoinRequest()` | Initializes the interview. Returns greeting message + audio (base64). |
| `/api/interview/{id}/answer-question` | POST | `InterviewRoom.handleSubmitAnswer()` | Submits user's spoken answer. Returns AI's next question + audio. |
| `/api/interview/{id}/stream` | GET (SSE) | `ActiveRoom` | Opens SSE stream for real-time AI responses (text + audio chunks). |
| `/api/interview/{id}/exit-interview` | PATCH | `new-session/page.tsx` → `handleExitConfirm()` | Ends the interview early. Triggers report generation. |

**Error handling pattern:** All fetches follow:
```typescript
const res = await fetch(url, options);
const json = await res.json();
if (!json.success) {
  setError(json.message || "Default error");
  return;
}
// Use json.data
```

---

## 5. Next.js Patterns

### Route Structure
```
app/(main)/interview/
├── page.tsx              — Server Component. Auth guard + Prisma query → renders CommandCenter
├── layout.tsx            — Injects CSS to hide nav/footer when data-interview-room="active"
├── loading.tsx           — Skeleton UI (Server Component)
├── error.tsx             — Error boundary (Client Component, required by Next.js)
├── new-session/page.tsx  — Client Component. The main interview session orchestrator
├── session/[id]/page.tsx — Demo/mock session (client, hardcoded data)
├── [id]/page.tsx         — Server Component. Smart redirect (notStarted → lobby, else → report)
├── [id]/report/page.tsx  — Server Component. Auth + Prisma → renders InterviewReport
└── result/[id]/page.tsx  — Server Component. Demo results page
```

### Layout-Level Nav Hiding

```tsx
// interview/layout.tsx
<style>{`
  body:has([data-interview-room="active"]) footer,
  body:has([data-interview-room="active"]) nav {
    display: none !important;
  }
`}</style>
```

**Why this approach?** The interview room needs a full-screen, distraction-free experience. Instead of lifting state up to the root layout, the interview pages add `data-interview-room="active"` to their wrapper div. The `:has()` CSS selector hides nav/footer from the *parent* layout without prop drilling.

**Tradeoff:** Relies on `:has()` CSS support (all modern browsers). More elegant than conditional rendering at the layout level because the interview layout doesn't need to know about the nav component.

### Navigation Guards

```typescript
// new-session/page.tsx — only active when view === "room"
useEffect(() => {
  // Prevent tab close with native browser dialog
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = "";
  };
  
  // Capture browser back button
  window.history.pushState(null, "", window.location.href);
  const handlePopState = () => {
    window.history.pushState(null, "", window.location.href);
    setShowExitModal(true); // Show confirmation instead of navigating
  };
  
  window.addEventListener("beforeunload", handleBeforeUnload);
  window.addEventListener("popstate", handlePopState);
  return () => { /* cleanup */ };
}, [view]);
```

**Interview talking point:** "We push a null history entry and intercept `popstate` to prevent accidental navigation during a live interview. The browser's native confirmation dialog handles tab close, while our custom `EndSessionModal` handles in-app navigation attempts."

### Smart Redirect Pattern

```typescript
// [id]/page.tsx — Server Component
if (interview.status === "notStarted") {
  redirect(`/interview/new-session?${params.toString()}`); // Go to lobby
}
redirect(`/interview/${id}/report`); // Go to report
```

**Why?** This page acts as a router. When a user shares or bookmarks an interview URL, it figures out the right destination based on the interview's current status.

---

## 6. Performance Considerations

### Ref-Heavy Architecture
Components use `useRef` extensively over `useState` for values that change frequently but shouldn't trigger re-renders:
- `recognitionRef` — SpeechRecognition instance
- `audioRef` — HTMLAudioElement
- `blobUrlRef` — ObjectURL for cleanup
- `finalTranscriptRef` — committed transcript text
- `scrollContainerRef` — auto-scroll target

**Why?** During recording, the speech recognition `onresult` fires 5-10 times per second. Storing interim values in refs prevents render storms.

### Auto-Scroll Optimization
`TranscriptArea` uses a ref-based scroll:
```typescript
useEffect(() => {
  if (scrollRef.current) {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }
}, [history, currentAiMessage, sttTranscript]);
```
The dependency array is minimal — only the values that actually change the scrollable content.

### Memory Management
- `URL.revokeObjectURL()` called on every audio cleanup
- SpeechRecognition `stop()` called on cleanup
- Event listeners removed in effect cleanup functions

### CSS Animations via `dangerouslySetInnerHTML`
Components inject `@keyframes` directly via `<style>` tags:
```tsx
<style>{`
  @keyframes orbBreath { ... }
  @keyframes recordPulse { ... }
`}</style>
```
**Why not CSS modules?** These animations are component-scoped and co-located. Since they're static strings (not user input), `dangerouslySetInnerHTML` is safe here. Global CSS would add unnecessary scope.

---

## 7. Interview Talking Points

### "Walk me through the interview room architecture"
> "The interview room uses a phase-based state machine with 7 states: loading, speaking, answering, recording, submitting, error, and complete. Each phase drives the entire UI — which panel is active, whether the mic is locked, what the CTA says. The phase transitions are deterministic: loading fetches the greeting, speaking plays the AI audio, answering waits for the user, recording captures speech-to-text, submitting sends it to the backend, and the cycle repeats until complete."

### "Why do you have two room implementations?"
> "We have `InterviewRoom` (request-response) and `ActiveRoom` (SSE streaming). ActiveRoom was built first for real-time word-by-word streaming — the AI's text appears as it generates, and audio chunks play in order using a priority queue. InterviewRoom was a later simplification that waits for the full response. ActiveRoom is more complex but provides better UX. We kept both because ActiveRoom is proven in production while InterviewRoom was being iterated on."

### "How do you handle the Web Speech API?"
> "We wrapped it in a custom hook `useSpeechRecognition`. Three key decisions: (1) Auto-restart on `onend` — Chrome kills recognition after silence even with `continuous: true`, so the hook transparently restarts if we're still supposed to be listening. (2) Interim/final reconciliation — the API streams both partial and committed results, and we combine them into a single transcript string using a ref for the finalized portion. (3) Graceful error handling — each error code maps to a user-friendly message, and `no-speech` is silently ignored since pauses are normal."

### "How do you handle autoplay restrictions?"
> "The `useAudioPlayer` hook wraps `audio.play()` in a try-catch. If the browser blocks autoplay, we store the pending audio and expose a `needsManualPlay` flag. The UI shows a 'Click to play' button. The key design decision is that `playAudio()` returns a Promise that resolves when audio finishes — this lets the parent component `await` it before moving to the next phase. If audio fails entirely, the promise resolves (never rejects) so the interview falls back to text-only mode."

### "How do you prevent users from accidentally leaving?"
> "Three layers: (1) `beforeunload` event triggers the browser's native 'Are you sure?' dialog. (2) We push a null history entry and intercept `popstate` to prevent the back button from navigating away — instead it opens our custom EndSessionModal. (3) The `:has()` CSS selector hides the nav/footer so there are no clickable links to leave. These guards only activate when the view is 'room'."

### "What's the dual-mode pattern in TranscriptArea?"
> "TranscriptArea accepts two different prop interfaces — one from InterviewRoom (phase-based: history, currentAiMessage, sttTranscript, phase) and one from ActiveRoom (message-array-based: messages, turnState, currentTranscript). It conditionally renders based on which props are present. The tradeoff is slightly complex prop types, but it avoids duplicating a 500+ line component."
