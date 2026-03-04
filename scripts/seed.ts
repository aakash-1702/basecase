import axios from "axios";

const BASE = "http://localhost:3000/api";
const SEED_KEY = "seed123";
const HEADERS = { headers: { "x-seed-key": SEED_KEY } };

// =====================
// EASY PROBLEMS
// =====================

const easyProblems = [
  {
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "easy",
    link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    description:
      "Find length of longest substring without duplicate characters.",
    tags: ["string", "sliding-window", "two-pointers"],
    examples: ["Input: s = 'abcabcbb' -> 3", "Input: s = 'bbbbb' -> 1"],
  },
  {
    title: "Max Consecutive Ones III",
    slug: "max-consecutive-ones-iii",
    difficulty: "easy",
    link: "https://leetcode.com/problems/max-consecutive-ones-iii/",
    description: "Longest subarray with at most k zero flips.",
    tags: ["array", "sliding-window"],
    examples: [
      "Input: nums=[1,1,1,0,0,0,1,1,1,1,0], k=2 -> 6",
      "Input: nums=[0,0,1,1,1,0,0], k=0 -> 3",
    ],
  },
  {
    title: "Maximum Points You Can Obtain from Cards",
    slug: "maximum-points-you-can-obtain-from-cards",
    difficulty: "easy",
    link: "https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/",
    description: "Pick k cards from either end to maximize score.",
    tags: ["array", "sliding-window", "prefix-sum"],
    examples: ["Input: [1,2,3,4,5,6,1], k=3 -> 12", "Input: [2,2,2], k=2 -> 4"],
  },
];
const mediumProblems = [
  {
    title: "Longest Repeating Character Replacement",
    slug: "longest-repeating-character-replacement",
    difficulty: "medium",
    link: "https://leetcode.com/problems/longest-repeating-character-replacement/",
    description: "Longest substring after replacing at most k characters.",
    tags: ["string", "sliding-window"],
    examples: ["Input: s='ABAB', k=2 -> 4", "Input: s='AABABBA', k=1 -> 4"],
  },
  {
    title: "Binary Subarrays With Sum",
    slug: "binary-subarrays-with-sum",
    difficulty: "medium",
    link: "https://leetcode.com/problems/binary-subarrays-with-sum/",
    description: "Count subarrays with exact sum goal.",
    tags: ["array", "sliding-window", "prefix-sum"],
    examples: [
      "Input: nums=[1,0,1,0,1], goal=2 -> 4",
      "Input: nums=[0,0,0], goal=0 -> 6",
    ],
  },
  {
    title: "Count Number of Nice Subarrays",
    slug: "count-number-of-nice-subarrays",
    difficulty: "medium",
    link: "https://leetcode.com/problems/count-number-of-nice-subarrays/",
    description: "Count subarrays with exactly k odd numbers.",
    tags: ["array", "sliding-window"],
    examples: [
      "Input: nums=[1,1,2,1,1], k=3 -> 2",
      "Input: nums=[2,4,6], k=1 -> 0",
    ],
  },
  {
    title: "Number of Substrings Containing All Three Characters",
    slug: "number-of-substrings-containing-all-three-characters",
    difficulty: "medium",
    link: "https://leetcode.com/problems/number-of-substrings-containing-all-three-characters/",
    description:
      "Count substrings containing at least one of each character a, b, c.",
    tags: ["string", "sliding-window"],
    examples: ["Input: s='abcabc' -> 10", "Input: s='aaacb' -> 3"],
  },
  {
    title: "Longest Substring with At Most K Distinct Characters",
    slug: "longest-substring-with-at-most-k-distinct-characters",
    difficulty: "medium",
    link: "https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/",
    description: "Longest substring containing at most k distinct characters.",
    tags: ["string", "sliding-window"],
    examples: ["Input: s='eceba', k=2 -> 3", "Input: s='aa', k=1 -> 2"],
  },
  {
    title: "Subarrays with K Different Integers",
    slug: "subarrays-with-k-different-integers",
    difficulty: "medium",
    link: "https://leetcode.com/problems/subarrays-with-k-different-integers/",
    description: "Count subarrays with exactly k distinct integers.",
    tags: ["array", "sliding-window"],
    examples: [
      "Input: nums=[1,2,1,2,3], k=2 -> 7",
      "Input: nums=[1,2,1,3,4], k=3 -> 3",
    ],
  },
];
const hardProblems = [
  {
    title: "Minimum Window Substring",
    slug: "minimum-window-substring",
    difficulty: "hard",
    link: "https://leetcode.com/problems/minimum-window-substring/",
    description:
      "Smallest substring containing all characters of target string.",
    tags: ["string", "sliding-window", "hashmap"],
    examples: [
      "Input: s='ADOBECODEBANC', t='ABC' -> 'BANC'",
      "Input: s='a', t='a' -> 'a'",
    ],
  },
  {
    title: "Minimum Window Subsequence",
    slug: "minimum-window-subsequence",
    difficulty: "hard",
    link: "https://leetcode.com/problems/minimum-window-subsequence/",
    description: "Minimum window in s that contains t as a subsequence.",
    tags: ["string", "two-pointers"],
    examples: [
      "Input: s='abcdebdde', t='bde' -> 'bcde'",
      "Input: s='jmeqksfrsdcmsiwvaovztaqenprpvnbstl', t='u' -> ''",
    ],
  },
];

// =====================
// HELPERS
// =====================

/** Fetch a problem by slug — returns the problem object or null */
async function fetchProblemBySlug(
  slug: string,
): Promise<{ id: string; title: string; difficulty: string } | null> {
  try {
    const res = await axios.get(`${BASE}/problems/${slug}/problem`, HEADERS);
    const problem = res.data?.data?.problem;
    if (problem?.id)
      return {
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
      };
    return null;
  } catch {
    return null;
  }
}

/** Create or fetch a problem — always returns the final record */
async function upsertProblem(
  problem: any,
): Promise<{ id: string; title: string; difficulty: string } | null> {
  // 1. Try to create
  try {
    const res = await axios.post(`${BASE}/problems`, problem, HEADERS);
    const created = res.data?.data;
    if (created?.id) {
      console.log(
        `  ✅ [${problem.difficulty.toUpperCase()}] Created: ${created.title}`,
      );
      return {
        id: created.id,
        title: created.title,
        difficulty: created.difficulty,
      };
    }
  } catch {
    // Creation failed — probably already exists, fall through to fetch
  }

  // 2. Try to fetch by slug
  console.log(`  ⚠️  Already exists: ${problem.title} — fetching instead...`);
  const existing = await fetchProblemBySlug(problem.slug);
  if (existing) {
    console.log(`  ♻️  Reusing: ${existing.title} (id: ${existing.id})`);
    return existing;
  }

  // 3. Nothing worked
  console.log(`  ❌ Could not recover: ${problem.title}`);
  return null;
}

/** Fetch a sheet by title — returns sheet object or null */
async function fetchSheetByTitle(
  title: string,
): Promise<{ id: string; title: string } | null> {
  try {
    const res = await axios.get(`${BASE}/sheets`, HEADERS);
    const sheets: any[] = res.data?.data ?? [];
    const found = sheets.find((s: any) => s.title === title);
    return found ? { id: found.id, title: found.title } : null;
  } catch {
    return null;
  }
}

/** Create or fetch a sheet */
async function upsertSheet(
  title: string,
  description: string,
): Promise<{ id: string; title: string }> {
  // 1. Try to create
  try {
    const res = await axios.post(
      `${BASE}/sheets`,
      { title, description },
      HEADERS,
    );
    const created = res.data?.data;
    if (created?.id) {
      console.log(`  ✅ Sheet created: ${created.title} (id: ${created.id})`);
      return created;
    }
  } catch {
    // Fall through to fetch
  }

  // 2. Try to fetch by title
  console.log(`  ⚠️  Sheet may already exist — fetching by title...`);
  const existing = await fetchSheetByTitle(title);
  if (existing) {
    console.log(`  ♻️  Reusing sheet: ${existing.title} (id: ${existing.id})`);
    return existing;
  }

  throw new Error(`Failed to create or fetch sheet: "${title}"`);
}

/** Fetch sections for a sheet — returns array or [] */
async function fetchSections(sheetId: string): Promise<any[]> {
  try {
    const res = await axios.get(`${BASE}/sheets/${sheetId}`, HEADERS);
    return res.data?.data?.sections ?? [];
  } catch {
    return [];
  }
}

/** Create or fetch a section by title */
async function upsertSection(
  sheetId: string,
  title: string,
  description: string,
): Promise<{ id: string; title: string }> {
  // Check if section already exists
  const existingSections = await fetchSections(sheetId);
  const found = existingSections.find((s: any) => s.title === title);
  if (found) {
    console.log(`  ♻️  Reusing section: ${title} (id: ${found.id})`);
    return { id: found.id, title: found.title };
  }

  // Create new section
  try {
    const res = await axios.post(
      `${BASE}/sheets/${sheetSlug}/section`,
      { title, description },
      HEADERS,
    );
    const created = res.data?.data;
    if (created?.id) {
      console.log(`  ✅ Section: ${title} (id: ${created.id})`);
      return created;
    }
    throw new Error("No id in response");
  } catch (error: any) {
    throw new Error(
      `Failed to create section "${title}": ${error.response?.data?.message ?? error.message}`,
    );
  }
}

/** Attach a problem to a section — skip if already linked */
async function attachProblem(
  sheetId: string,
  sectionId: string,
  problem: { id: string; title: string },
) {
  try {
    await axios.post(
      `${BASE}/sheets/${sheetId}/section/${sectionId}`,
      { problemId: problem.id },
      HEADERS,
    );
    console.log(`  ✅ Linked: ${problem.title}`);
  } catch (error: any) {
    const msg: string = error.response?.data?.message ?? error.message ?? "";
    // Tolerate "already linked" type errors
    if (
      msg.toLowerCase().includes("already") ||
      msg.toLowerCase().includes("exists") ||
      msg.toLowerCase().includes("duplicate")
    ) {
      console.log(`  ♻️  Already linked: ${problem.title}`);
    } else {
      console.log(`  ❌ Failed to link: ${problem.title} — ${msg}`);
    }
  }
}

// =====================
// MAIN SEED FUNCTION
// =====================
async function seed() {
  try {
    console.log("🌱 Starting seed...\n");

    // ─────────────────────────────────────────
    // 1. UPSERT ALL PROBLEMS
    // ─────────────────────────────────────────
    const allProblems = [...easyProblems, ...mediumProblems, ...hardProblems];
    const createdProblems: { id: string; title: string; difficulty: string }[] =
      [];

    console.log(`📝 Inserting ${allProblems.length} problems...`);
    for (const problem of allProblems) {
      const result = await upsertProblem(problem);
      if (result) createdProblems.push(result);
    }

    console.log(
      `\n✔️  Problems resolved: ${createdProblems.length}/${allProblems.length}`,
    );

    // ─────────────────────────────────────────
    // 2. UPSERT SHEET
    // ─────────────────────────────────────────
    console.log("\n📄 Creating sheet...");
    const sheet = await upsertSheet(
      "Sliding Window and 2 Pointers :",
      "Structured practice for sliding window and two-pointer techniques from easy to hard — covering all core patterns.",
    );

    // ─────────────────────────────────────────
    // 3. UPSERT SECTIONS
    // ─────────────────────────────────────────
    console.log("\n📂 Creating sections...");

    const easySection = await upsertSection(
      sheet.id,
      "Easy",
      "Foundational Array problems to build intuition",
    );
    const mediumSection = await upsertSection(
      sheet.id,
      "Medium",
      "Intermediate Array problems — knapsack, strings, subsequences",
    );
    const hardSection = await upsertSection(
      sheet.id,
      "Hard",
      "Advanced Array problems — stock problems, intervals, and complex patterns",
    );

    // ─────────────────────────────────────────
    // 4. ATTACH PROBLEMS TO SECTIONS
    // ─────────────────────────────────────────
    const byDifficulty = (d: string) =>
      createdProblems.filter((p) => p.difficulty === d);

    const easyList = byDifficulty("easy");
    const mediumList = byDifficulty("medium");
    const hardList = byDifficulty("hard");

    console.log(`\n🔗 Linking ${easyList.length} problems → Easy section...`);
    for (const p of easyList) await attachProblem(sheet.id, easySection.id, p);

    console.log(
      `\n🔗 Linking ${mediumList.length} problems → Medium section...`,
    );
    for (const p of mediumList)
      await attachProblem(sheet.id, mediumSection.id, p);

    console.log(`\n🔗 Linking ${hardList.length} problems → Hard section...`);
    for (const p of hardList) await attachProblem(sheet.id, hardSection.id, p);

    // ─────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────
    console.log("\n─────────────────────────────────────");
    console.log("🎉 Seeding completed successfully!");
    console.log(
      `   Problems : ${createdProblems.length}/${allProblems.length}`,
    );
    console.log(`   Sheet    : ${sheet.title} (id: ${sheet.id})`);
    console.log(
      `   Sections : Easy (${easyList.length}), Medium (${mediumList.length}), Hard (${hardList.length})`,
    );
    console.log("─────────────────────────────────────");
  } catch (err: any) {
    console.error("\n❌ Seed failed:", err.response?.data ?? err.message);
    process.exit(1);
  }
}

seed();
