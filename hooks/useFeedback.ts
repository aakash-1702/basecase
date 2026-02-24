import { useState } from "react";

export type FeedbackStatus = "idle" | "loading" | "success" | "error";
export type Importance = "feature" | "pain" | "must" | "nice";

interface SubmitPayload {
  message: string;
  importance: Importance;
}

export function useFeedback() {
  const [status, setStatus] = useState<FeedbackStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async (payload: SubmitPayload): Promise<boolean> => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Your route always returns { success, data, message }
      const json = await res.json();

      if (res.ok && json.success) {
        setStatus("success");
        return true;
      }

      // Use the server's message string if available
      setStatus("error");
      setErrorMessage(
        json.message ?? "Something went wrong. Please try again.",
      );
      return false;
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Check your connection and try again.");
      return false;
    }
  };

  const reset = () => {
    setStatus("idle");
    setErrorMessage(null);
  };

  return { status, errorMessage, submit, reset };
}
