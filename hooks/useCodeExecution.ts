// hooks/useCodeExecution.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export type ExecutionPhase = "idle" | "queued" | "running" | "done";

export interface TestResult {
  index: number;
  passed: boolean;
  status:
    | "Accepted"
    | "Wrong Answer"
    | "Compile Error"
    | "Runtime Error"
    | "Time Limit Exceeded"
    | "Submission Failed"
    | "Skipped";
  input: string | null;
  expected: string | null;
  got: string | null;
  error: string | null;
}

export interface TestCaseInput {
  input: string;
  expectedOutput: string;
  displayInput: string;
  displayOutput: string;
  visibility: "PUBLIC" | "PRIVATE";
}

interface UseCodeExecutionOptions {
  onDone?: (results: TestResult[]) => void;
}

export function useCodeExecution(options?: UseCodeExecutionOptions) {
  const socketRef = useRef<Socket | null>(null);
  const onDoneRef = useRef(options?.onDone);
  const [results, setResults] = useState<TestResult[]>([]);
  const [phase, setPhase] = useState<ExecutionPhase>("idle");
  const [total, setTotal] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Keep onDone ref updated
  useEffect(() => {
    onDoneRef.current = options?.onDone;
  }, [options?.onDone]);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_INTERVIEW_WS_URL;
    if (!wsUrl) {
      setConnectionError("WebSocket URL not configured");
      return;
    }

    const socket = io(wsUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 3,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      setIsConnected(false);
      setConnectionError(`Connection failed: ${err.message}`);
    });

    socket.on(
      "execution_status",
      ({
        type,
        total: totalCount,
      }: {
        type: "QUEUED" | "RUNNING" | "DONE";
        total?: number;
      }) => {
        if (type === "QUEUED") {
          setPhase("queued");
          if (totalCount !== undefined) {
            setTotal(totalCount);
          }
          setResults([]);
        }
        if (type === "RUNNING") {
          setPhase("running");
        }
        if (type === "DONE") {
          setPhase("done");
          // Call onDone with final results
          setResults((currentResults) => {
            if (onDoneRef.current) {
              onDoneRef.current(currentResults);
            }
            return currentResults;
          });
        }
      },
    );

    socket.on("test_result", (result: TestResult) => {
      setResults((prev) => {
        const updated = [...prev];
        updated[result.index] = result;
        return updated;
      });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("execution_status");
      socket.off("test_result");
      socket.disconnect();
    };
  }, []);

  const submitCode = useCallback(
    (code: string, languageId: number, testCases: TestCaseInput[]) => {
      if (!socketRef.current?.connected) {
        setConnectionError("Not connected to execution server");
        return false;
      }
      setResults([]);
      setPhase("queued");
      setTotal(testCases.length);
      setConnectionError(null);
      socketRef.current.emit("submit_code", { code, languageId, testCases });
      return true;
    },
    [],
  );

  const reset = useCallback(() => {
    setResults([]);
    setPhase("idle");
    setTotal(0);
    setConnectionError(null);
  }, []);

  return {
    results,
    phase,
    total,
    isConnected,
    connectionError,
    submitCode,
    reset,
  };
}
