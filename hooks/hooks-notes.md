# Custom Hooks — Deep Dive Notes

> **Scope:** `hooks/` — all custom React hooks used across the application.

---

## 1. Hooks Overview

| Hook | File | Used By | Purpose |
|---|---|---|---|
| `useSpeechRecognition` | `useSpeechRecognition.ts` | `InterviewRoom` | Wraps Web Speech API for continuous speech-to-text with auto-restart, interim/final reconciliation, and error handling. |
| `useAudioPlayer` | `useAudioPlayer.ts` | `InterviewRoom` | Wraps `HTMLAudioElement` for base64 audio playback with autoplay policy handling and promise-based completion. |
| `useFeedback` | `useFeedback.ts` | Feedback widget (likely in landing/general UI) | Manages the lifecycle of submitting user feedback — loading/success/error states with API call. |
| `useScrollReveal` | `useScrollReveal.ts` | Landing page sections | Uses `IntersectionObserver` to toggle a `visible` class when elements enter the viewport. |
| `useIsMobile` | `use-mobile.ts` | Responsive components | Detects if viewport width < 768px using `matchMedia` + resize listener. |

---

## 2. `useSpeechRecognition` — Full Breakdown

### Interface
```typescript
interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}
```

### Architecture

**Initialization (useEffect, runs once):**
1. Feature detection: `window.SpeechRecognition || window.webkitSpeechRecognition`
2. Configure: `continuous: true`, `interimResults: true`, `lang: "en-US"`
3. Attach three event handlers: `onresult`, `onerror`, `onend`
4. Store instance in `recognitionRef`

**Transcript Reconciliation (onresult):**
```typescript
recognition.onresult = (event) => {
  let interimText = "";
  let finalText = "";
  
  for (let i = 0; i < event.results.length; i++) {
    const result = event.results[i];
    if (result.isFinal) {
      finalText += result[0].transcript;
    } else {
      interimText += result[0].transcript;
    }
  }
  
  finalTranscriptRef.current = finalText;
  setTranscript(finalText + interimText);
};
```

**Why separate final/interim?** The Speech API marks results as `isFinal` when confident. Without this split, interim text would overwrite previously committed text on each event.

**Auto-Restart (onend):**
```typescript
recognition.onend = () => {
  if (recognitionRef.current && isListening) {
    try { recognition.start(); } catch { /* Already started */ }
  }
};
```

**Known issue:** The `isListening` check in `onend` has a stale closure because the handler is defined in `useEffect([])`. However, the startListening/stopListening functions set state synchronously, and the recognition instance is managed via ref. In practice, this works because:
- `stopListening` sets `isListening = false` AND calls `recognition.stop()`
- By the time `onend` fires, if `stopListening` was called, the ref-based check catches it

**Error Mapping:**
| Error Code | User Message | Stops Listening? |
|---|---|---|
| `not-allowed` | "Microphone access denied. Allow mic and refresh." | Yes |
| `network` | "Speech recognition blocked. Try Chrome or disable Brave Shields." | Yes |
| `no-speech` | *(silent)* | No |
| `audio-capture` | "No microphone found. Please connect one." | Yes |
| `aborted` | *(silent)* | No |
| default | "Voice input error. Please try again." | Yes |

**Cleanup:**
```typescript
return () => {
  if (recognitionRef.current) {
    try { recognitionRef.current.stop(); } catch { /* Ignore */ }
  }
};
```

---

## 3. `useAudioPlayer` — Full Breakdown

### Interface
```typescript
interface UseAudioPlayerReturn {
  playAudio: (base64: string) => Promise<void>;
  isPlaying: boolean;
  needsManualPlay: boolean;
  triggerManualPlay: () => void;
}
```

### Architecture

**Internal Refs:**
- `audioRef` — current `HTMLAudioElement`
- `blobUrlRef` — current ObjectURL (for cleanup)
- `pendingResolveRef` — stored resolve callback when autoplay is blocked
- `pendingBase64Ref` — stored audio data for manual play retry

**playAudio Flow:**
```
base64 string
  → atob() → Uint8Array
  → new Blob([bytes], { type: "audio/wav" })
  → URL.createObjectURL(blob)
  → new Audio(url)
  → audio.play()
    → Success: setIsPlaying(true), resolve on audio.onended
    → Blocked: setNeedsManualPlay(true), store resolve callback
    → Error: cleanup, resolve() (never reject)
```

**Promise-Based Design:**
```typescript
playAudio(base64: string): Promise<void> => {
  return new Promise((resolve) => {
    // ... setup audio ...
    audio.onended = () => { cleanup(); resolve(); };
    audio.onerror = () => { cleanup(); resolve(); }; // Never reject
  });
};
```

**Why never reject?** If audio playback fails, the interview should continue in text-only mode. Rejecting would require every caller to catch errors, and missed catches would crash the interview mid-flow.

**Autoplay Policy Handling:**
```typescript
const playPromise = audio.play();
playPromise
  .then(() => { setIsPlaying(true); setNeedsManualPlay(false); })
  .catch(() => {
    // Browser blocked autoplay
    pendingBase64Ref.current = base64;
    pendingResolveRef.current = resolve;
    setNeedsManualPlay(true);
  });
```

The parent component checks `needsManualPlay` and renders a button that calls `triggerManualPlay()`.

**Memory Management:**
```typescript
const cleanup = useCallback(() => {
  if (blobUrlRef.current) {
    URL.revokeObjectURL(blobUrlRef.current); // Prevent memory leak
    blobUrlRef.current = null;
  }
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current = null;
  }
  setIsPlaying(false);
}, []);
```

---

## 4. `useFeedback` — Simple API Hook

### Interface
```typescript
type FeedbackStatus = "idle" | "loading" | "success" | "error";
type Importance = "feature" | "pain" | "must" | "nice";

function useFeedback(): {
  status: FeedbackStatus;
  errorMessage: string | null;
  submit: (payload: { message: string; importance: Importance }) => Promise<boolean>;
  reset: () => void;
}
```

### Implementation
- POST to `/api/feedback` with JSON body
- Returns `true` on success, `false` on error
- Error message from server is stored for UI display
- `reset()` clears to idle state

**Pattern:** This is a generic "async action" hook pattern — loading/success/error state machine for any API call. Could be generalized into a `useApiAction` hook.

---

## 5. `useScrollReveal` — Intersection Observer

```typescript
export default function useScrollReveal() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("visible");
        } else {
          element.classList.remove("visible");
        }
      },
      { threshold: 0.1 } // Triggers when 10% of element is visible
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return ref;
}
```

**Usage:**
```tsx
const sectionRef = useScrollReveal();
<div ref={sectionRef} className="reveal-section">...</div>
```

CSS handles the animation:
```css
.reveal-section { opacity: 0; transform: translateY(20px); transition: all 0.5s ease; }
.reveal-section.visible { opacity: 1; transform: translateY(0); }
```

**Design choice:** Uses CSS class toggling instead of state because animation performance is better when CSS handles it natively. The observer only fires class mutations, not React re-renders.

---

## 6. `useIsMobile` — Responsive Detection

```typescript
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT); // Initial check
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile; // undefined → false on first render
}
```

**Hydration safety:** Initial state is `undefined` (not `false`) to avoid SSR/client mismatch. The `!!undefined` → `false` conversion happens at the return, after the client-side effect has run. This means on SSR, the component assumes "not mobile" which is a safe default.

**Why `matchMedia` instead of `resize` event?** `matchMedia` is more efficient — it only fires when the breakpoint boundary is crossed, not on every pixel of resize.

---

## 7. Interview Talking Points

### "Walk me through your custom hooks"
> "We have five custom hooks. The two interview-critical ones are `useSpeechRecognition` and `useAudioPlayer`. The speech hook wraps the Web Speech API and solves three problems: auto-restart when Chrome kills recognition after silence, reconciling interim and final transcripts into a single string, and mapping error codes to user-friendly messages. The audio hook wraps HTMLAudioElement for base64 playback and critically handles autoplay policy — if the browser blocks it, we surface a manual play button. Both hooks return promise-based APIs so the parent component can `await` them in sequence."

### "How do you handle browser incompatibility?"
> "At the hook level, `useSpeechRecognition` checks for `SpeechRecognition` or `webkitSpeechRecognition` on window and sets `isSupported = false` if neither exists. At the flow level, the `new-session` page calls `checkSpeechRecognitionSupport()` before entering the preparing state, and redirects to `BrowserGateScreen` if unsupported. At the audio level, `useAudioPlayer` never rejects — if audio fails, the interview continues text-only."

### "Why is the scroll reveal hook class-based instead of state-based?"
> "Performance. IntersectionObserver fires when elements enter and leave the viewport, potentially many times as the user scrolls. If we used `useState`, each scroll event would trigger a React re-render. By toggling a CSS class directly on the DOM element (`classList.add/remove`), we let the browser's CSS transition engine handle the animation natively — zero React renders for the scroll animation."
