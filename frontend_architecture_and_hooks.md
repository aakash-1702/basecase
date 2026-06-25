# 🚀 BaseCase: The Ultimate Frontend Architecture & Hooks Guide

_This document is designed for **last-minute interview revision**. Read the TL;DR for a quick refresher, then dive into the "Under the Hood" sections to show deep technical maturity when questioned._

---

## ⚡ 1. The "Last-Minute" Cheat Sheet (TL;DR)

If your interview starts in 5 minutes, memorize this:

- **Architecture:** Next.js 16 App Router. We use **Server Components (RSC) by default** for zero-JS payloads on the client, pushing `"use client"` down to the absolute lowest leaf components (like buttons or editors).
- **State Management:** No Redux! We use URL State (query params), React Context (only when strictly necessary), and Server Actions/React Hook Form for mutations. Data fetching is handled server-side.
- **Code Editor (Monaco):** We use `useRef` heavily here. Why? Because putting keystrokes in `useState` triggers React reconciliation on every character, causing lag. `useRef` holds the editor instance entirely outside the React render cycle.
- **AI Voice / Real-time:** We abstract messy Browser APIs (WebRTC, Speech, Audio) into clean **Custom Hooks** (`useSpeechRecognition`, `useAudioPlayer`). This separates imperative browser logic from declarative React UI.
- **Performance:** `useMemo` is used for heavy data (sorting problem tables, rendering roadmap graphs). `useCallback` is used to prevent child components (like the AI visualizer) from re-rendering when parent state (like voice transcripts) updates 60 times a second.

---

## 🏗️ 2. Core Architecture: Next.js App Router & RSC

### How it works internally:

BaseCase uses the App Router. The codebase is organized via **Route Groups** (`(main)`, `(auth)`, `(landing)`) which let us share layouts (navbars, footers) without changing the URL path.

**Server Components (The Default)**

- **Internal Working:** RSCs never hydrate on the client. Next.js runs the React component on the Node.js server, fetches data directly from Prisma (DB), and serializes the output into a special JSON-like format called the **RSC Payload**. The browser reads this payload and reconstructs the DOM.
- **The Benefit:** Massive reduction in JavaScript bundle size. The client's browser doesn't have to download React code for static UI.

**Client Boundaries (`"use client"`)**

- **Internal Working:** When Next.js sees `"use client"`, it creates a boundary. Everything below this component in the tree is bundled and sent to the browser to be hydrated (attaching event listeners like `onClick`).
- **Our Strategy:** We keep boundaries as low as possible. Instead of making a whole page a Client Component, we pass Server Components as `children` into Client Components (Content Interleaving) to maintain server-side performance.

---

## 🧠 3. Domain Deep Dives & React Hook Internals

### 🔴 Domain: Code Editor & Problems (`components/problem`)

_The challenge: Managing heavy typing and running code without UI lag._

- **`useRef` (The Hero of the Editor):**
  - **Internal Working:** `useState` triggers React's diffing algorithm (Reconciliation) and re-renders the component. If a user types 100 WPM, `useState` would freeze the browser. `useRef` gives us a mutable object (`ref.current`) that persists across renders but **does not trigger a re-render** when changed. We use it to hold the Monaco Editor instance.
  - **Interview Flex:** "I bypassed React's render cycle for the editor's internal state. I only extract the value from the `useRef` imperatively when the user clicks 'Submit', ensuring a buttery-smooth typing experience."
- **`useMemo` (Problem Table Sorting):**
  - **Internal Working:** When users filter/sort the problems list, mapping and sorting large arrays is CPU-intensive. `useMemo` caches the calculated array. React checks the dependency array (`[problems, sortOrder]`) using `Object.is()`. If nothing changed, it returns the cached memory reference, skipping the expensive calculation.

### 🔴 Domain: AI Interviews & Audio (`components/interview`)

_The challenge: Handling rapid state updates from voice transcription and audio generation without dropping frames._

- **`useEffect` (WebSockets/SSE Lifecycle):**
  - **Internal Working:** When the interview room mounts, `useEffect` fires after the initial paint to establish the AI connection.
  - **Crucial Detail (Cleanup):** The `return () => connection.close()` is mandatory. React runs this cleanup function when the component unmounts. If forgotten, switching pages would leave open WebSockets, causing memory leaks and zombie network requests.
- **`useCallback` + `React.memo`:**
  - **Internal Working:** As the user speaks, the transcript updates dozens of times per second. This normally forces all child components (like the `AIOrb` visualizer) to re-render. By wrapping the visualizer in `React.memo` and passing event handlers wrapped in `useCallback` (which caches the function reference), the child component completely ignores the parent's rapid render cycle.

---

## 🛠️ 4. The Custom Hooks Architecture (Internal Mechanisms)

In an interview, custom hooks prove you understand how to bridge React's declarative world with the Browser's imperative world.

### 1. `useSpeechRecognition.ts` (React Lifecycle vs Browser API)

- **What it does:** Wraps native `webkitSpeechRecognition`.
- **Internal Workings:**
  - Browser APIs are imperative (`api.start()`, `api.stop()`). React is declarative (State -> UI).
  - We store the API instance in a `useRef` so it survives re-renders.
  - A `useEffect` binds the browser events (`onresult`, `onend`) to `useState` setters (`setTranscript`).
  - **The "Gotcha":** Closures! Inside the `useEffect`, event listeners can get trapped holding _stale state_. We have to carefully manage dependency arrays or use functional state updates (`setTranscript(prev => prev + newWord)`) to ensure the hook always uses the latest data.

### 2. `useAudioPlayer.ts` (Memory Management)

- **What it does:** Plays streaming TTS (Text-to-Speech) AI responses.
- **Internal Workings:**
  - When the server sends an audio file buffer, we convert it to a playable URL using `URL.createObjectURL(blob)`.
  - **Memory Leak Danger:** Object URLs live in browser memory until explicitly destroyed.
  - **Resolution:** Our `useEffect` cleanup function explicitly calls `URL.revokeObjectURL()` whenever the audio source changes or the component unmounts. This demonstrates deep knowledge of browser Garbage Collection.

### 3. `useScrollReveal.ts` (High-Performance Animations)

- **What it does:** Fades in landing page elements as you scroll.
- **Internal Workings:**
  - Instead of listening to the window `scroll` event (which fires thousands of times and blocks the main thread), we use the browser's native **Intersection Observer API**.
  - It asynchronously watches elements off the main thread. When the element crosses the screen threshold, it triggers a React state update (`isVisible = true`), which simply attaches a CSS class. The GPU handles the actual CSS fade animation, resulting in 60 FPS performance with zero JavaScript layout thrashing.

---

## 🎤 5. How to Answer Common Interview Questions

**Q1: "Why didn't you use Redux for state management?"**

> "Because the Next.js App Router shifted our mental model. 80% of what Redux used to do was caching server data. Now, Next.js handles server data fetching and caching natively on the server. For the remaining 20% (UI state), lifting state up, Context API for themes, and URL query parameters for filters are much lighter and keep our bundle sizes tiny."

**Q2: "How did you prevent the Code Editor from lagging?"**

> "By separating the editor's internal imperative state from React's declarative render cycle. I stored the Monaco instance in a `useRef`. React never knows about the individual keystrokes, so a re-render is never triggered during typing. State is only synced when absolutely required."

**Q3: "How do you handle memory leaks in your real-time interview room?"**

> "By strictly returning cleanup functions inside `useEffect`. Whenever an audio `Blob` is generated, I ensure `URL.revokeObjectURL()` is called on unmount. Similarly, WebRTC connections and Speech Recognition instances are explicitly `.close()`'d and `.stop()`'d in the cleanup block to prevent zombie processes running in the background."
