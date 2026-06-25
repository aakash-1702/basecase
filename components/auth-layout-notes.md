# Auth — Deep Dive Notes

> **Scope:** `components/SignIn.tsx`, `components/UserNavbar.tsx`, `app/layout.tsx`, `app/(main)/layout.tsx`

---

## 1. Components Overview

| Component | File | Type | Purpose |
|---|---|---|---|
| `SignIn` | `SignIn.tsx` | Client (`"use client"`) | Sign-in form with email/password + Google OAuth. Uses `react-hook-form` + Zod validation. |
| `UserNavbar` | `UserNavbar.tsx` | Client (`"use client"`) | Sticky nav with auth-aware rendering (sign-in/sign-up vs logout). Mobile sheet menu. Scroll-aware transparency. |
| `RootLayout` | `app/layout.tsx` | **Server Component** | Sets up fonts (DM Serif Display, DM Mono), metadata, Google Analytics. No auth logic. |
| `MainLayout` | `app/(main)/layout.tsx` | **Server Component** | Auth-aware layout. Fetches session, passes to `UserNavbar`. Grid background + ambient glow. Toaster. Footer. |

---

## 2. Auth Library — BetterAuth

The project uses `@/lib/auth` (server) and `@/lib/auth-client` (client) — a BetterAuth setup.

**Server-side auth check pattern (used in every protected page):**
```typescript
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user) redirect("/auth/sign-in");
```

**Client-side auth:**
```typescript
import { signOut, useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";

// Sign in
const { data, error } = await authClient.signIn.email({ email, password });

// Google OAuth
await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });

// Sign out
await signOut({ fetchOptions: { onSuccess: () => router.push("/") } });
```

---

## 3. SignIn — Form Architecture

### Zod Schema
```typescript
const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
```

### React Hook Form Integration
```typescript
const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: { email: "", password: "" },
});
const isLoading = form.formState.isSubmitting;
```

**Why `react-hook-form` + Zod?**
- Uncontrolled form inputs (better performance — no re-render on every keystroke)
- Zero-runtime validation schema
- `isSubmitting` from form state gives free loading state

### Submission Flow
```typescript
async function onSubmit(values: FormValues) {
  const toastId = toast.loading("Signing in...");
  try {
    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });
    if (error) {
      toast.error(error.message || "Sign in failed", { id: toastId });
      return;
    }
    toast.success("Welcome back!", { id: toastId });
    router.refresh(); // Refresh Server Components to pick up new session
    router.push("/dashboard");
  } catch (err) {
    toast.error("Something went wrong", { id: toastId });
  }
}
```

**Toast ID pattern:** Using a consistent `toastId` across loading/success/error replaces the loading toast seamlessly instead of stacking multiple toasts.

### Google OAuth
```typescript
const handleGoogleSignIn = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/dashboard",
  });
  // No toast, no try/catch — browser redirects immediately to Google
};
```

**Why no error handling?** `signIn.social` triggers an immediate browser redirect to Google's OAuth page. The function never returns in the current browser tab, so try/catch is unnecessary.

### Focus State Animation
```typescript
const [focused, setFocused] = useState<string | null>(null);

<Input
  onFocus={() => setFocused("email")}
  onBlur={() => setFocused(null)}
  className={focused === "email"
    ? "border-orange-500/50 shadow-lg shadow-orange-500/10"
    : ""}
/>
```

Active input gets an orange glow effect.

---

## 4. UserNavbar — Architecture

### Dual Session Sources
```typescript
const { data: sessionFromHook } = useSession(); // Client-side hook
const session = sessionProp ?? sessionFromHook;   // Prefer server-passed prop
```

**Why both?** The `MainLayout` Server Component passes the session as a prop for immediate rendering (no flash). But `useSession()` keeps it reactive — if the session changes (e.g., sign-out), the navbar updates without a page reload.

### Scroll-Aware Styling
```typescript
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const handler = () => setScrolled(window.scrollY > 16);
  handler(); // Check immediately
  window.addEventListener("scroll", handler, { passive: true });
  return () => window.removeEventListener("scroll", handler);
}, []);

// Applied as:
className={scrolled
  ? "bg-zinc-950/92 backdrop-blur-xl border-b border-zinc-800"
  : "bg-zinc-950/84 backdrop-blur-md border-b border-zinc-800/80"
}
```

**`passive: true`** — scroll listeners default to blocking (browser waits to see if `preventDefault()` is called). `passive: true` tells the browser this handler won't prevent default, enabling smooth scroll performance.

### Auth-Conditional Rendering
```tsx
{session?.user ? (
  <Button onClick={handleLogout}><LogOut /> Log out</Button>
) : (
  <>
    <Button asChild><Link href="/auth/sign-in">Sign In</Link></Button>
    <Button asChild><Link href="/auth/sign-up">Get Started →</Link></Button>
  </>
)}
```

### Mobile Menu
Uses shadcn/ui `Sheet` component (slide-out drawer):
```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button className="md:hidden" variant="ghost" size="icon">
      <Menu />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-72 bg-zinc-950">
    {/* Same nav items and auth buttons */}
  </SheetContent>
</Sheet>
```

---

## 5. Layout Architecture

### Root Layout (`app/layout.tsx`)
```typescript
const dmSerif = DM_Serif_Display({ variable: "--font-dm-serif", subsets: ["latin"], weight: "400" });
const dmMono = DM_Mono({ variable: "--font-dm-mono", subsets: ["latin"], weight: ["400", "500"] });

<body className={cn(dmSerif.variable, dmMono.variable, "antialiased")}>
  <GoogleAnalytics />
  {children}
</body>
```

**Font strategy:** Loads fonts at the root layout level using Next.js `next/font/google`. CSS variables (`--font-dm-serif`, `--font-dm-mono`) are applied to the body, making them available globally via `fontFamily: "var(--font-dm-mono)"`.

### Main Layout (`app/(main)/layout.tsx`)
```tsx
<div className="min-h-screen bg-[#080808] text-neutral-100">
  {/* Grid background */}
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-20"
    style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), ..." }} />
  
  {/* Ambient glow */}
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10"
    style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,158,11,0.06)...)" }} />
  
  <Toaster position="top-right" theme="dark" richColors />
  <UserNavbar session={session} />
  <main>{children}</main>
  <Footer />
</div>
```

**Layered background system:**
1. `z: -20` — Grid lines (subtle 44px grid)
2. `z: -10` — Amber ambient glow (two radial gradients)
3. `z: 0+` — Content

These use `pointer-events-none` and `aria-hidden` because they're purely decorative.

---

## 6. SEO Configuration

```typescript
// Root layout metadata
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BaseCase - Master DSA and System Design",
    template: "%s | BaseCase",             // Child pages: "Dashboard | BaseCase"
  },
  openGraph: { type: "website", siteName: SITE_NAME, ... },
  twitter: { card: "summary_large_image", ... },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
};
```

**Title template** — child pages use `title: "Dashboard"` and Next.js auto-formats to "Dashboard | BaseCase".

---

## 7. Interview Talking Points

### "How does auth work across your app?"
> "We use BetterAuth with both server and client SDKs. Server Components call `auth.api.getSession({ headers: await headers() })` to check auth — this happens in page-level Server Components before rendering client components. The MainLayout fetches the session once and passes it as a prop to the UserNavbar for immediate rendering without flash. The navbar also uses `useSession()` hook as a fallback for reactivity — if the user signs out on another tab, the hook picks it up. Sign-in uses react-hook-form with Zod for validation, and we support both email/password and Google OAuth."

### "Walk me through the layout architecture"
> "We have three layout levels. The root layout sets up fonts via `next/font/google` CSS variables and Google Analytics. The `(main)` group layout adds the full page chrome — navbar, footer, ambient background effects, and the Sonner toast provider. The interview layout injects CSS that hides nav/footer when in an active interview room. This layering means shared chrome is defined once, and feature-specific layout overrides are scoped to their route groups."

### "How do you handle the navbar's auth state?"
> "The navbar receives the session as a prop from the server *and* uses `useSession()` client-side. We prefer the server prop (`sessionProp ?? sessionFromHook`) for the initial render to avoid content flash, but the hook handles client-side changes. For sign-out, we call BetterAuth's `signOut()` with `onSuccess` that navigates to home and calls `router.refresh()` to invalidate all server-rendered content that depends on the session."
