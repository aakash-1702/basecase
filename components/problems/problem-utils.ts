import type {
  ConfidenceV2,
  EditorLanguage,
  InputFormatItem,
  ProgressState,
  TestCase,
  UserProblemData,
} from "./types";

export const LANGUAGE_OPTIONS: ReadonlyArray<{
  value: EditorLanguage;
  label: string;
  ext: string;
}> = [
  { value: "cpp", label: "C++", ext: "cpp" },
  { value: "java", label: "Java", ext: "java" },
  { value: "python", label: "Python", ext: "py" },
];

export function fileExtension(language: EditorLanguage): string {
  return LANGUAGE_OPTIONS.find((l) => l.value === language)?.ext ?? language;
}

/** Coerce a JSON column (string[] | unknown) into a string array without throwing. */
export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) =>
    typeof v === "string" ? v : JSON.stringify(v, null, 2),
  );
}

export function parseLines(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function parseEditorial(raw?: string | null): {
  insight: string | null;
  points: string[];
} {
  const lines = parseLines(raw);
  if (!lines.length) return { insight: null, points: [] };
  const [insight, ...points] = lines;
  return { insight, points };
}

/** Tiny markdown subset used for AI mentor replies (bold/italic/code/lists). */
export function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^[*-]\s+(.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\.\s+(.+)$/gm, "<li class='numbered'>$1</li>")
    .replace(/((<li.*<\/li>\n?)+)/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n(?!<)/g, "<br/>")
    .replace(/(<br\/>){2,}/g, "<br/><br/>");
}

/**
 * Infer the stdin layout ("int n", "int[] nums", …) from the first test case by
 * matching raw input lines against the `a = 1, b = [1,2]` display string.
 */
export function parseInputFormat(
  testCase?: Pick<TestCase, "input" | "displayInput"> | null,
): InputFormatItem[] {
  if (!testCase?.input) return [];

  const lines = testCase.input.split("\n").filter((l) => l.trim());
  const result: InputFormatItem[] = [];

  const varMap: Record<string, { isArray: boolean; values: string[] }> = {};
  if (testCase.displayInput) {
    const assignments = testCase.displayInput.split(",").map((s) => s.trim());
    for (const assign of assignments) {
      const match = assign.match(/^(\w+)\s*=\s*(.+)$/);
      if (match) {
        const [, varName, value] = match;
        const isArray = value.startsWith("[");
        const values = isArray
          ? value
              .replace(/[[\]]/g, "")
              .split(",")
              .map((v) => v.trim())
          : [value.trim()];
        varMap[varName] = { isArray, values };
      }
    }
  }

  const varNames = Object.keys(varMap);
  let varIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const parts = line.split(/\s+/);
    const isArray = parts.length > 1;

    let name = "";
    let desc = "";
    let sizeVar: string | undefined;

    if (varIndex < varNames.length) {
      const currentVar = varNames[varIndex];
      const varData = varMap[currentVar];

      if (!isArray && !varData.isArray) {
        const nextVar = varNames[varIndex + 1];
        if (nextVar && varMap[nextVar]?.isArray) {
          name = "n";
          desc = `size of array ${nextVar}`;
        } else {
          name = currentVar;
          desc = `value of ${currentVar}`;
          varIndex++;
        }
      } else if (isArray && varData.isArray) {
        name = currentVar;
        desc = `array ${currentVar}`;
        if (result.length > 0) {
          const prevItem = result[result.length - 1];
          if (!prevItem.type.includes("[]")) sizeVar = prevItem.name;
        }
        varIndex++;
      } else if (!isArray && varData.isArray) {
        name = "n";
        desc = `size of array ${currentVar}`;
      } else {
        name = currentVar;
        desc = "array values";
        varIndex++;
      }
    } else {
      name = isArray ? `arr${i}` : `n${i}`;
      desc = isArray ? "array values" : "integer value";
    }

    result.push({ name, type: isArray ? "int[]" : "int", desc, sizeVar });
  }

  return result;
}

/** Default stdin: the first public test case (the API only ships public ones). */
export function initialStdin(testCases: TestCase[]): string {
  if (!testCases.length) return "";
  const tc = testCases.find((t) => t.visibility === "PUBLIC") ?? testCases[0];
  return tc.input || "";
}

export function toProgressState(up?: UserProblemData | null): ProgressState {
  return {
    solved: up?.solved ?? false,
    confidenceV2: up?.confidenceV2 ?? null,
    solvedAt: up?.solvedAt ? String(up.solvedAt) : null,
    notes: up?.notes ?? "",
    bookmark: up?.bookmark ?? false,
  };
}

/** Confidence pre-selected from the perceived difficulty in the solve dialog. */
export function autoConfidence(difficulty: string): ConfidenceV2 {
  if (difficulty === "TOO_EASY" || difficulty === "EASY") return "HIGH";
  if (difficulty === "JUST_RIGHT") return "MEDIUM";
  return "LOW";
}
