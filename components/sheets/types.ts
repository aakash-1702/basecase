export type ConfidenceV2 = "LOW" | "MEDIUM" | "HIGH" | null;

export interface SheetProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  link: string;
  tags?: string[];
  companies?: string[];
}

export interface SectionProblem {
  id: string;
  order: number;
  problem: SheetProblem;
}

export interface SheetSection {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  problems: SectionProblem[];
}

/** Payload of GET /api/sheets/[sheetSlug]/section (without `userProblems`). */
export interface SheetData {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  sections: SheetSection[];
}

/** One row of GET /api/sheets. `difficulty` / `problemCount` are optional
 *  because the API does not return them today; they are rendered when present. */
export interface SheetListItem {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  difficulty?: string | null;
  problemCount?: number | null;
}
