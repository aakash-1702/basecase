export type InterviewType =
  | "system_design"
  | "frontend"
  | "backend"
  | "fullstack";

export const INTERVIEW_CONFIGS: Record<
  InterviewType,
  {
    label: string;
    searchQuery: string; // semantic query sent to Qdrant
    systemPrompt: string; // role given to Gemini
    focusInstruction: string; // what to ask about
  }
> = {
  system_design: {
    label: "System Design",
    searchQuery:
      "database schema, API design, architecture, scalability, caching, queue, microservices, infrastructure, config",
    systemPrompt:
      "You are a staff engineer interviewing a candidate on system design and architecture.",
    focusInstruction:
      "Focus on architectural decisions, scalability tradeoffs, database choices, caching strategies, and how the system handles failures. Do NOT ask syntax or implementation trivia.",
  },
  backend: {
    label: "Backend",
    searchQuery:
      "API route, controller, service, middleware, authentication, database query, error handling, validation, queue, worker",
    systemPrompt:
      "You are a senior backend engineer conducting a technical interview.",
    focusInstruction:
      "Focus on API design, data modeling, auth flows, error handling patterns, performance, and backend architecture decisions.",
  },
  frontend: {
    label: "Frontend",
    searchQuery:
      "React component, hook, state management, props, UI, form, rendering, context, CSS, animation, fetch, axios",
    systemPrompt:
      "You are a senior frontend engineer conducting a technical interview.",
    focusInstruction:
      "Focus on component design, state management, rendering behavior, performance optimizations, accessibility, and UI/UX decisions.",
  },
  fullstack: {
    label: "Full Stack",
    searchQuery:
      "component, API, route, database, state, authentication, service, hook, controller, schema",
    systemPrompt:
      "You are a senior full-stack engineer conducting a technical interview.",
    focusInstruction:
      "Cover the full stack â€” frontend components, backend APIs, data flow end-to-end, auth, and how the layers communicate. Ask about integration points and tradeoffs across the stack.",
  },
};
