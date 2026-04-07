import type { Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export const cardHover = {
  rest: { scale: 1, backgroundColor: "var(--card, #1e2736)" },
  hover: {
    scale: 1.015,
    backgroundColor: "var(--bg3, #1c2333)",
    transition: { duration: 0.2 },
  },
};

export const NAV_LINKS = [
  { label: "DSA Sheets", href: "#" },
  { label: "Problems", href: "#" },
  { label: "Roadmap", href: "#" },
  { label: "Mock Interview", href: "#" },
  { label: "Dashboard", href: "#" },
];

export const STATS = [
  { number: "500+", label: "Problems" },
  { number: "1,000+", label: "Active Users" },
  { number: "200+", label: "Mock Interviews Conducted" },
  { number: "10+", label: "Curated DSA Sheets" },
];

export const HERO_AVATARS = [
  { initials: "RK", bg: "#f97316" },
  { initials: "PV", bg: "#3b82f6" },
  { initials: "AS", bg: "#22c55e" },
  { initials: "MJ", bg: "#eab308" },
  { initials: "TA", bg: "#ef4444" },
];

export const FEATURES = [
  {
    icon: "\u{1F4CB}",
    title: "Structured DSA Sheets",
    desc: "Blind 75, NeetCode 150, Striver's SDE Sheet â€” topic-ordered, difficulty-ramped, and cross-linked. Never wonder what to study next.",
  },
  {
    icon: "\u{1F9E0}",
    title: "SM-2 Spaced Repetition",
    desc: "The same algorithm behind Anki. BaseCase rates your confidence after every problem and schedules the next review at the exact right moment.",
  },
  {
    icon: "\u{1F399}\uFE0F",
    title: "AI Voice Mock Interviews",
    desc: "Voice-first sessions powered by Gemini with Sarvam TTS. Adaptive follow-ups, real-time responses, and a structured report every time.",
  },
  {
    icon: "\u{1F4CA}",
    title: "Radar Analytics",
    desc: "See your topic-wise strengths and blind spots on one chart. Pinpoint exactly what to fix before your next round â€” not after.",
  },
  {
    icon: "\u{1F5FA}\uFE0F",
    title: "AI-Generated Roadmaps",
    desc: "Tell BaseCase your target company and timeline. It generates a personalized roadmap with real problem checkpoints â€” powered by OpenAI Agents.",
  },
  {
    icon: "\u{1F916}",
    title: "Gemini-Powered Mentor",
    desc: "Per-problem AI hints, complexity coaching, and debug help â€” with Redis-backed conversation history so context is never lost between sessions.",
  },
];

export const TOPICS = [
  "Arrays",
  "Binary Search",
  "DP",
  "Graphs",
  "Trees",
  "Sliding Window",
  "Two Pointers",
  "Greedy",
  "Backtracking",
  "Tries",
  "Heap",
  "Stack",
  "Queue",
  "Recursion",
  "Bit Manipulation",
];

export const STEPS = [
  {
    num: "01",
    title: "Pick a Sheet",
    body: "Choose Blind 75, Striver's SDE Sheet, NeetCode 150, or build a custom list with the Sheet Builder. Everything is organized by topic and difficulty.",
  },
  {
    num: "02",
    title: "Track Your Confidence",
    body: "Mark problems solved and rate your confidence â€” Confident, Shaky, or Forgot. The SM-2 engine silently builds your optimal review schedule.",
  },
  {
    num: "03",
    title: "Run an AI Mock Interview",
    body: "When you feel ready, start a voice session. DSA, System Design, HR, or Behavioral. Gemini asks, listens, adapts â€” then scores you on depth, clarity, and accuracy.",
  },
];

export const PROBLEM_TRACKER_POINTS = [
  {
    icon: "\u2713",
    title: "500+ hand-curated problems across sheets",
    description: "Curated sets mapped to interview-ready patterns and progression.",
  },
  {
    icon: "\u2713",
    title: "Confidence-rated spaced repetition scheduling",
    description: "SM-2 intelligently schedules what you should revise and when.",
  },
  {
    icon: "\u2713",
    title: "Topic-wise, difficulty, and status filtering",
    description: "Slice your prep instantly to focus on exactly what needs work.",
  },
  {
    icon: "\u2713",
    title: "Persistent revision notes per problem",
    description: "Capture learnings once and revisit them before every review.",
  },
];

export const SHEET_PROBLEMS = [
  {
    name: "Sort 0s, 1s & 2s",
    difficulty: "Easy" as const,
    confidence: "Confident" as const,
    solved: true,
  },
  {
    name: "Stock Buy & Sell",
    difficulty: "Easy" as const,
    confidence: "Confident" as const,
    solved: true,
  },
  {
    name: "Next Permutation",
    difficulty: "Medium" as const,
    confidence: "Shaky" as const,
    solved: false,
  },
  {
    name: "Kadane's Algorithm",
    difficulty: "Medium" as const,
    confidence: "Shaky" as const,
    solved: false,
  },
  {
    name: "Merge Overlapping Intervals",
    difficulty: "Medium" as const,
    confidence: null,
    solved: false,
  },
];

export const MOCK_INTERVIEW_BULLETS = [
  "Voice-first, hands-free sessions",
  "Gemini-powered adaptive questioning",
  "Detailed post-session feedback report",
  "Track score improvements over time",
];

export const INTERVIEW_TYPES = [
  "DSA",
  "System Design",
  "Technical",
  "HR",
  "Behavioral",
];

export const INTERVIEW_SCORES = [
  { label: "Technical Depth", value: 82 },
  { label: "Clarity", value: 76 },
  { label: "Confidence", value: 90 },
];

export const ROADMAP_BULLETS = [
  "Public and private roadmaps",
  "AI-generated via OpenAI Agents + credit system",
  "Every step links directly to real problems",
  "Visual progress per roadmap checkpoint",
];

export const ROADMAP_STEPS = [
  { topic: "Arrays Fundamentals", percent: 100, color: "var(--green, #22c55e)" },
  { topic: "Binary Search", percent: 60, color: "var(--orange, #f97316)" },
  { topic: "Dynamic Programming", percent: 0, color: "var(--text-dim, #64748b)" },
  { topic: "Graph Theory", percent: 0, color: "var(--text-dim, #64748b)" },
];

export const COMMITS = [
  { type: "feat", message: "add SM-2 spaced repetition", time: "2 days ago" },
  { type: "fix", message: "voice interview race condition", time: "4 days ago" },
  { type: "feat", message: "roadmap generator v1", time: "1 week ago" },
];

export const TESTIMONIALS = [
  {
    title: "The spaced repetition actually works.",
    body: "I was doing random LeetCode for 4 months and retaining nothing. Three weeks on BaseCase with SM-2 and I can actually recall patterns mid-interview. Flipkart call came in last week.",
    name: "Rohan M.",
    role: "SDE Intern",
    initials: "RM",
    color: "#f97316",
  },
  {
    title: "The mock interview feedback is brutally honest.",
    body: "My first session score was rough. The report broke down exactly where I lost points on depth and follow-ups. Two weeks later I cleared the Razorpay technical round.",
    name: "Priya S.",
    role: "Final Year CSE",
    initials: "PS",
    color: "#3b82f6",
  },
  {
    title: "Finally a platform that doesn't overwhelm you.",
    body: "The AI roadmap feature got me. I gave it my target company and timeline, it generated a full plan with checkpoints. Felt like having a senior guiding me.",
    name: "Arjun K.",
    role: "Backend Engineer",
    initials: "AK",
    color: "#22c55e",
  },
];

export const PRICING = {
  free: {
    price: "â‚¹0",
    label: "forever",
    features: [
      "All DSA sheets",
      "Problem tracking & confidence notes",
      "Basic analytics",
      "Community roadmaps",
      "3 AI mock interviews/month",
    ],
  },
  pro: {
    price: "â‚¹299",
    originalPrice: "â‚¹599",
    discount: "ðŸŽ‰ 50% off â€” launch pricing",
    features: [
      "Everything in Free",
      "Unlimited mock interviews",
      "Full AI feedback reports with scoring breakdown",
      "Company-specific question patterns",
      "Priority SM-2 recommendations",
      "Radar analytics heatmaps",
    ],
  },
};

export const FAQS = [
  {
    q: "Is BaseCase free?",
    a: "Yes â€” our free plan gives you access to all DSA sheets, problem tracking, and 3 AI mock interviews per month. You only upgrade when you need unlimited sessions and advanced analytics.",
  },
  {
    q: "How is this different from LeetCode?",
    a: "LeetCode is a problem bank. BaseCase is a structured learning system â€” with spaced repetition, AI interviews, personalized roadmaps, and analytics that tell you what to fix. It's the difference between a gym and a coach.",
  },
  {
    q: "What is SM-2 spaced repetition?",
    a: "SM-2 is the algorithm powering Anki flashcards. After each problem, you rate your confidence, and BaseCase schedules the optimal review time â€” so you stop forgetting what you've already learned.",
  },
  {
    q: "How does the AI mock interview work?",
    a: "You start a voice session, pick the interview type, and Gemini asks you questions using Sarvam TTS voice output. It listens, adapts follow-ups based on your answer, and gives you a full scored report after the session.",
  },
  {
    q: "Can I build my own problem sheet?",
    a: "Yes. The Sheet Builder lets you search any problem and add it to a custom list. You can keep it private or publish it for the community â€” roadmap checkpoints link directly to your sheets.",
  },
  {
    q: "Is there a mobile app?",
    a: "Not yet â€” but BaseCase is fully responsive and works great in the mobile browser. A native app is on the public roadmap, and you can track progress on that in the Built in Public section.",
  },
];

export const FOOTER_LINKS = {
  product: ["DSA Sheets", "Problems", "Roadmaps", "Mock Interviews", "Analytics"],
  resources: ["Blog", "Changelog", "GitHub", "Documentation"],
  company: ["About", "Contact", "Privacy Policy", "Terms"],
};
