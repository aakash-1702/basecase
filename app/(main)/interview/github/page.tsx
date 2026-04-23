import { redirect } from "next/navigation";

// GitHub interview flow now runs via StartInterviewModal on /interview
// This route is kept so Next.js routing remains valid
export default function GitHubInterviewPage() {
  redirect("/interview");
}
