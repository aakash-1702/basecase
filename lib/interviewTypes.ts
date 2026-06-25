export type InterviewType =
  | "system_design"
  | "frontend"
  | "backend"
  | "fullstack"
  | "ai_engineer"
  | "devops_engineer"
  | "ml_engineer"
  | "data_engineer";

export const INTERVIEW_CONFIGS: Record<
  InterviewType,
  {
    label: string;
    searchQuery: string;
    systemPrompt: string;
    focusInstruction: string;
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
      "Cover the full stack - frontend components, backend APIs, data flow end-to-end, auth, and how the layers communicate. Ask about integration points and tradeoffs across the stack.",
  },
  ai_engineer: {
    label: "AI Engineer",
    searchQuery:
      "machine learning, deep learning, neural network, NLP, computer vision, model training, deployment, optimization",
    systemPrompt:
      "You are a senior AI engineer conducting a technical interview.",
    focusInstruction:
      "Focus on machine learning concepts, deep learning architectures, NLP and computer vision applications, model evaluation, and deployment strategies.",
  },
  devops_engineer: {
    label: "DevOps Engineer",
    searchQuery:
      "CI/CD, containerization, orchestration, monitoring, logging, infrastructure as code, automation, cloud platforms",
    systemPrompt:
      "You are a senior DevOps engineer conducting a technical interview.",
    focusInstruction:
      "Focus on CI/CD pipelines, container technologies like Docker and Kubernetes, infrastructure automation, monitoring and logging strategies, and cloud platform management.",
  },
  ml_engineer: {
    label: "ML Engineer",
    searchQuery:
      "machine learning, deep learning, neural network, NLP, computer vision, model training, deployment, optimization",
    systemPrompt:
      "You are a senior ML engineer conducting a technical interview.",
    focusInstruction:
      "Focus on machine learning algorithms, deep learning architectures, NLP and computer vision techniques, model evaluation metrics, and deployment considerations.",
  },
  data_engineer: {
    label: "Data Engineer",
    searchQuery:
      "data pipeline, ETL process, data warehouse, data lake, data modeling, data quality, data governance, big data technologies",
    systemPrompt:
      "You are a senior Data Engineer conducting a technical interview.",
    focusInstruction: "Focus on data pipeline design and implementation",
  },
};
