// Mock data for AI Interviewer system

export interface InterviewMetrics {
  confidence: number; // 0-100
  englishClarity: number; // 0-100
  conceptClarity: number; // 0-100
  communicationFlow: number; // 0-100
  technicalDepth: number; // 0-100
}

export interface Interview {
  id: string;
  company: string;
  type: "DSA" | "Technical" | "HR" | "Behavioral";
  score: number;
  duration: string;
  date: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  metrics: InterviewMetrics;
  questionCount: number;
  strongAreas: string[];
  needsWork: string[];
}

export interface TranscriptItem {
  question: string;
  answer: string;
  feedback: string;
  suggestedAnswer?: string;
}

export const interviews: Interview[] = [
  {
    id: "1",
    company: "Google",
    type: "Technical",
    score: 8,
    duration: "18 min",
    date: "5 Mar 2026",
    difficulty: "Hard",
    topics: ["Backend", "System Design"],
    questionCount: 5,
    metrics: {
      confidence: 82,
      englishClarity: 90,
      conceptClarity: 78,
      communicationFlow: 85,
      technicalDepth: 76,
    },
    strongAreas: ["REST API fundamentals", "System Design basics"],
    needsWork: ["Caching strategies", "API versioning"],
  },
  {
    id: "2",
    company: "Amazon",
    type: "HR",
    score: 7,
    duration: "12 min",
    date: "3 Mar 2026",
    difficulty: "Medium",
    topics: ["Leadership", "Behavioral"],
    questionCount: 4,
    metrics: {
      confidence: 74,
      englishClarity: 88,
      conceptClarity: 70,
      communicationFlow: 80,
      technicalDepth: 60,
    },
    strongAreas: ["STAR format usage", "Self-awareness"],
    needsWork: ["Quantifying outcomes", "Specific examples"],
  },
  {
    id: "3",
    company: "Microsoft",
    type: "Technical",
    score: 9,
    duration: "22 min",
    date: "1 Mar 2026",
    difficulty: "Medium",
    topics: ["DSA", "Problem Solving"],
    questionCount: 6,
    metrics: {
      confidence: 91,
      englishClarity: 93,
      conceptClarity: 88,
      communicationFlow: 90,
      technicalDepth: 85,
    },
    strongAreas: [
      "Data Structures",
      "Algorithm analysis",
      "Edge case handling",
    ],
    needsWork: ["Space complexity optimization"],
  },
  {
    id: "4",
    company: "Meta",
    type: "Behavioral",
    score: 6,
    duration: "15 min",
    date: "28 Feb 2026",
    difficulty: "Easy",
    topics: ["Communication", "Teamwork"],
    questionCount: 4,
    metrics: {
      confidence: 62,
      englishClarity: 78,
      conceptClarity: 65,
      communicationFlow: 68,
      technicalDepth: 55,
    },
    strongAreas: ["Honesty", "Team player mindset"],
    needsWork: [
      "Structured storytelling",
      "Leadership examples",
      "Conflict resolution depth",
    ],
  },
  {
    id: "5",
    company: "Apple",
    type: "Technical",
    score: 8,
    duration: "20 min",
    date: "25 Feb 2026",
    difficulty: "Hard",
    topics: ["iOS", "Swift"],
    questionCount: 5,
    metrics: {
      confidence: 80,
      englishClarity: 85,
      conceptClarity: 82,
      communicationFlow: 79,
      technicalDepth: 84,
    },
    strongAreas: ["Platform-specific knowledge", "Memory management"],
    needsWork: ["Concurrency patterns", "SwiftUI internals"],
  },
  {
    id: "6",
    company: "Netflix",
    type: "Technical",
    score: 7,
    duration: "19 min",
    date: "20 Feb 2026",
    difficulty: "Hard",
    topics: ["System Design", "Database"],
    questionCount: 5,
    metrics: {
      confidence: 72,
      englishClarity: 86,
      conceptClarity: 74,
      communicationFlow: 76,
      technicalDepth: 70,
    },
    strongAreas: ["Distributed systems basics", "SQL proficiency"],
    needsWork: ["CAP theorem depth", "Sharding strategies"],
  },
];

export const transcripts: Record<string, TranscriptItem[]> = {
  "1": [
    {
      question: "Explain REST vs GraphQL",
      answer:
        "REST is resource based while GraphQL allows flexible querying. REST uses multiple endpoints for different resources, where each endpoint returns fixed data structures. GraphQL uses a single endpoint and lets clients specify exactly what data they need.",
      feedback:
        "Good explanation but missing discussion on caching mechanisms and when to use each approach.",
      suggestedAnswer:
        "REST is a resource-based architecture using multiple endpoints with fixed data structures. It leverages HTTP caching effectively. GraphQL provides a single endpoint with flexible querying, allowing clients to request exactly the data they need, reducing over-fetching. Use REST for simple CRUD operations with good caching needs; use GraphQL for complex, nested data requirements.",
    },
    {
      question: "What is middleware in Express?",
      answer:
        "Middleware functions run before request reaches route handlers. They have access to request and response objects and can modify them or end the request-response cycle.",
      feedback:
        "Clear explanation with correct flow. Good understanding shown.",
      suggestedAnswer:
        "Middleware functions in Express are functions that execute during the request-response cycle. They have access to req, res, and next(). They can execute code, modify request/response objects, end the cycle, or call the next middleware. Common uses include authentication, logging, and error handling.",
    },
    {
      question: "Explain the event loop in Node.js",
      answer:
        "The event loop handles asynchronous operations in Node.js. It processes callbacks in a specific order through different phases.",
      feedback:
        "Basic understanding shown but missing details about the phases and microtask queue.",
      suggestedAnswer:
        "The event loop is Node.js's mechanism for handling async operations despite being single-threaded. It has phases: timers, pending callbacks, idle/prepare, poll, check, and close callbacks. The microtask queue (process.nextTick, Promises) is processed between each phase.",
    },
  ],
  "2": [
    {
      question: "Tell me about a time you handled a conflict in your team.",
      answer:
        "I once had a disagreement with a colleague about project priorities. I scheduled a meeting to discuss our perspectives and we found a compromise that worked for both.",
      feedback:
        "Good structure using STAR method implicitly. Could add more specific details about the outcome.",
      suggestedAnswer:
        "Use the STAR method: Situation - describe the context. Task - explain your responsibility. Action - detail the specific steps you took, including active listening and finding common ground. Result - quantify the positive outcome and what you learned.",
    },
    {
      question: "Why do you want to work at Amazon?",
      answer:
        "I admire Amazon's customer obsession and innovation culture. I want to work on large-scale systems that impact millions of users.",
      feedback:
        "Good alignment with company values. Could mention specific products or initiatives.",
      suggestedAnswer:
        "Mention specific Leadership Principles that resonate with you. Reference specific products, services, or recent innovations that excite you. Connect your skills and experience to how you can contribute to Amazon's mission.",
    },
  ],
};

export const questions: string[] = [
  "Explain REST vs GraphQL",
  "What is middleware in Express?",
  "What is the event loop in Node.js?",
  "Explain the difference between SQL and NoSQL databases",
  "What is a closure in JavaScript?",
];

export const companies = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Netflix",
  "Uber",
  "Airbnb",
  "Stripe",
  "Other",
];

export const interviewTypes = ["DSA", "Technical", "HR", "Behavioral"] as const;

export const difficulties = ["Easy", "Medium", "Hard"] as const;

export const topics = [
  "Backend",
  "Frontend",
  "DSA",
  "System Design",
  "Database",
  "DevOps",
  "Machine Learning",
  "Leadership",
  "Communication",
];
