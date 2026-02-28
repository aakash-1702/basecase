import axios from "axios";

const BASE = "http://localhost:3000/api";
const SEED_KEY = "seed123";
const HEADERS = { headers: { "x-seed-key": SEED_KEY } };

// =====================
// EASY PROBLEMS
// =====================

const easyProblems = [
  {
    title: "Search X in Sorted Array",
    slug: "binary-search",
    description: "Search for a target in a sorted array and return index.",
    tags: ["array", "binary-search"],
    difficulty: "easy",
    link: "https://leetcode.com/problems/binary-search/",
    editorial: "Standard BS: mid = l + (r-l)/2. If target matches, return mid.",
    aiHints: "Watch for infinite loops if l <= r is not managed correctly.",
    examples: ["Input: [-1,0,3,5,9,12], 9 -> Output: 4", "Input: [-1,0,3,5,9,12], 2 -> Output: -1"]
  },
  {
    title: "Lower Bound",
    slug: "implement-lower-bound",
    description: "Find the first index where nums[i] >= target.",
    tags: ["array", "binary-search"],
    difficulty: "easy",
    link: "https://www.geeksforgeeks.org/problems/implement-lower-bound/1",
    editorial: "Store index as potential answer when nums[mid] >= target, then look left.",
    aiHints: "If no element >= target, return n.",
    examples: ["Input: [1, 2, 8, 10], 5 -> Output: 2", "Input: [1, 2, 8, 10], 11 -> Output: 4"]
  },
  {
    title: "Upper Bound",
    slug: "implement-upper-bound",
    description: "Find the first index where nums[i] > target.",
    tags: ["array", "binary-search"],
    difficulty: "easy",
    link: "https://www.geeksforgeeks.org/problems/implement-upper-bound/1",
    editorial: "Similar to lower bound but strictly greater than target.",
    aiHints: "The difference from Lower Bound is the strict > condition.",
    examples: ["Input: [1,2,2,3], 2 -> Output: 3", "Input: [1,2,2,3], 0 -> Output: 0"]
  },
  {
    title: "Search Insert Position",
    slug: "search-insert-position",
    description: "Return index where target is or would be inserted.",
    tags: ["array", "binary-search"],
    difficulty: "easy",
    link: "https://leetcode.com/problems/search-insert-position/",
    editorial: "This is functionally identical to the Lower Bound problem.",
    aiHints: "If the target is larger than all elements, it belongs at the end.",
    examples: ["Input: [1,3,5,6], 5 -> Output: 2", "Input: [1,3,5,6], 2 -> Output: 1"]
  },
  {
    title: "Floor and Ceil in Sorted Array",
    slug: "floor-ceil-sorted-array",
    description: "Find the largest element <= X and smallest element >= X.",
    tags: ["array", "binary-search"],
    difficulty: "easy",
    link: "https://www.geeksforgeeks.org/problems/ceil-the-floor0532/1",
    editorial: "Run two separate binary searches for the floor and the ceil.",
    aiHints: "Ceil is simply the Lower Bound.",
    examples: ["Input: [3, 4, 7, 8], 5 -> Output: Floor:4, Ceil:7", "Input: [1, 2, 8], 9 -> Output: Floor:8, Ceil:-1"]
  },
  {
    title: "First and Last Occurrence",
    slug: "find-first-and-last-position",
    description: "Find start and end indices of target.",
    tags: ["array", "binary-search"],
    difficulty: "easy",
    link: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
    editorial: "Find first via Lower Bound, then find last via modified BS.",
    aiHints: "Can be solved by finding Lower Bound of target and Lower Bound of (target+1).",
    examples: ["Input: [5,7,7,8,8,10], 8 -> Output: [3, 4]", "Input: [5,7,7,8,8,10], 6 -> Output: [-1, -1]"]
  },
  {
    title: "Count Occurrences in a Sorted Array",
    slug: "count-occurrences",
    description: "Count frequency of target in sorted array.",
    tags: ["array", "binary-search"],
    difficulty: "easy",
    link: "https://www.geeksforgeeks.org/problems/number-of-occurrence2259/1",
    editorial: "Find First and Last index, return (last - first + 1).",
    aiHints: "If first index is -1, return 0.",
    examples: ["Input: [1, 1, 2, 2, 2, 3], 2 -> Output: 3", "Input: [1, 1, 2], 3 -> Output: 0"]
  },
  {
    title: "Search in Rotated Sorted Array - I",
    slug: "search-in-rotated-sorted-array",
    description: "Search in array rotated at unknown pivot.",
    tags: ["array", "binary-search"],
    difficulty: "easy",
    link: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    editorial: "Check which half is sorted; see if target is in that range.",
    aiHints: "nums[l] <= nums[mid] means left half is sorted.",
    examples: ["Input: [4,5,6,7,0,1,2], 0 -> Output: 4", "Input: [1], 0 -> Output: -1"]
  },
  {
    title: "Find Minimum in Rotated Sorted Array",
    slug: "find-minimum-in-rotated-sorted-array",
    difficulty: "easy",
    link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    description: "Find the smallest element.",
    tags: ["array", "binary-search"],
    editorial: "If nums[mid] > nums[high], min is to the right.",
    examples: ["Input: [3,4,5,1,2] -> Output: 1", "Input: [4,5,6,7,0,1,2] -> Output: 0"]
  },
  {
    title: "Find how many times array is rotated",
    slug: "rotation-count",
    difficulty: "easy",
    link: "https://www.geeksforgeeks.org/problems/rotation4723/1",
    description: "Find index of the minimum element.",
    tags: ["array", "binary-search"],
    examples: ["Input: [5, 1, 2, 3, 4] -> Output: 1", "Input: [1, 2, 3] -> Output: 0"]
  },
  {
    title: "Single element in a Sorted Array",
    slug: "single-element-in-a-sorted-array",
    difficulty: "easy",
    link: "https://leetcode.com/problems/single-element-in-a-sorted-array/",
    description: "Find unique element in array where others appear twice.",
    tags: ["array", "binary-search"],
    examples: ["Input: [1,1,2,3,3] -> Output: 2", "Input: [1,1,2,2,3] -> Output: 3"]
  },
  {
    title: "Search in a 2D matrix",
    slug: "search-a-2d-matrix",
    difficulty: "easy",
    link: "https://leetcode.com/problems/search-a-2d-matrix/",
    description: "Search in sorted 2D matrix.",
    tags: ["matrix", "binary-search"],
    examples: ["Input: matrix = [[1,3,5]], 3 -> Output: true", "Input: matrix = [[1,3,5]], 6 -> Output: false"]
  }
];
const mediumProblems = [
  {
    title: "Search in Rotated Sorted Array - II",
    slug: "search-in-rotated-sorted-array-ii",
    difficulty: "medium",
    link: "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/",
    description: "Rotated search with duplicates.",
    tags: ["array", "binary-search"],
    examples: ["Input: [2,5,6,0,0,1,2], 0 -> true", "Input: [2,5,6,0,0,1,2], 3 -> false"]
  },
  {
    title: "Find Peak Element",
    slug: "find-peak-element",
    difficulty: "medium",
    link: "https://leetcode.com/problems/find-peak-element/",
    description: "Find index where element is greater than neighbors.",
    tags: ["array", "binary-search"],
    examples: ["Input: [1,2,3,1] -> 2", "Input: [1] -> 0"]
  },
  {
    title: "Find Square Root of a Number",
    slug: "square-root",
    difficulty: "medium",
    link: "https://www.geeksforgeeks.org/problems/square-root/1",
    description: "Integer square root.",
    tags: ["math", "binary-search"],
    examples: ["Input: 11 -> 3", "Input: 25 -> 5"]
  },
  {
    title: "Find Nth Root of a Number",
    slug: "nth-root",
    difficulty: "medium",
    link: "https://www.geeksforgeeks.org/problems/nth-root-of-a-number-m1115/1",
    description: "Find integer Nth root of M.",
    tags: ["math", "binary-search"],
    examples: ["Input: n=3, m=27 -> 3", "Input: n=2, m=10 -> 3"]
  },
  {
    title: "Koko eating bananas",
    slug: "koko-eating-bananas",
    difficulty: "medium",
    link: "https://leetcode.com/problems/koko-eating-bananas/",
    description: "Min speed to eat bananas in H hours.",
    tags: ["array", "binary-search"],
    examples: ["Input: piles=[3,6,7,11], h=8 -> 4", "Input: piles=[30,11], h=5 -> 30"]
  },
  {
    title: "Minimum days to make M bouquets",
    slug: "min-days-bouquets",
    difficulty: "medium",
    link: "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/",
    description: "Min days for M bouquets of K flowers.",
    tags: ["array", "binary-search"],
    examples: ["Input: [1,10,3,10,2], m=3, k=1 -> 3", "Input: [7,7,7], m=2, k=2 -> -1"]
  },
  {
    title: "Find the smallest divisor",
    slug: "smallest-divisor",
    difficulty: "medium",
    link: "https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/",
    description: "Divisor s.t. division sum <= threshold.",
    tags: ["array", "binary-search"],
    examples: ["Input: [1,2,5,9], t=6 -> 5", "Input: [44,22], t=5 -> 9"]
  },
  {
    title: "Capacity to Ship Packages Within D Days",
    slug: "ship-capacity",
    difficulty: "medium",
    link: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
    description: "Min capacity to ship in D days.",
    tags: ["array", "binary-search"],
    examples: ["Input: [1,2,3,4,5,6,7,8,9,10], 5 -> 15", "Input: [3,2,2,4,1,4], 3 -> 6"]
  },
  {
    title: "Kth Missing Positive Number",
    slug: "kth-missing-positive",
    difficulty: "medium",
    link: "https://leetcode.com/problems/kth-missing-positive-number/",
    description: "Kth missing number in sorted array.",
    tags: ["array", "binary-search"],
    examples: ["Input: [2,3,4,7,11], k=5 -> 9", "Input: [1,2,3], k=2 -> 5"]
  },
  {
    title: "Aggressive Cows",
    slug: "aggressive-cows",
    difficulty: "medium",
    link: "https://www.geeksforgeeks.org/problems/aggressive-cows/1",
    description: "Place cows with max min distance.",
    tags: ["array", "binary-search"],
    examples: ["Input: [1,2,4,8,9], cows=3 -> 3", "Input: [10,1,2,7,5], cows=3 -> 4"]
  },
  {
    title: "Minimize Max Distance to Gas Station",
    slug: "gas-stations",
    difficulty: "medium",
    link: "https://www.geeksforgeeks.org/problems/minimize-max-distance-to-gas-station/1",
    description: "Add k stations to minimize max gap.",
    tags: ["array", "binary-search"],
    examples: ["Input: [1,10], k=2 -> 3.0", "Input: [1,2,3], k=1 -> 0.5"]
  },
  {
    title: "Matrix Median",
    slug: "matrix-median",
    difficulty: "medium",
    link: "https://www.geeksforgeeks.org/problems/matrix-median/1",
    description: "Median of row-sorted matrix.",
    tags: ["matrix", "binary-search"],
    examples: ["Input: [[1,3,5],[2,6,9],[3,6,9]] -> 5", "Input: [[1],[2],[3]] -> 2"]
  }
];
const hardProblems = [
  {
    title: "Book Allocation Problem",
    slug: "allocate-books",
    difficulty: "hard",
    link: "https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1",
    description: "Minimize max pages for students.",
    tags: ["array", "binary-search"],
    examples: ["Input: [12,34,67,90], m=2 -> 113", "Input: [15,17,20], m=2 -> 32"]
  },
  {
    title: "Split array - largest sum",
    slug: "split-array-largest-sum",
    difficulty: "hard",
    link: "https://leetcode.com/problems/split-array-largest-sum/",
    description: "Split array into K parts minimizing max sum.",
    tags: ["array", "binary-search"],
    examples: ["Input: [7,2,5,10,8], k=2 -> 18", "Input: [1,2,3], k=2 -> 3"]
  },
  {
    title: "Painter's Partition",
    slug: "painters-partition",
    difficulty: "hard",
    link: "https://www.geeksforgeeks.org/problems/the-painters-partition-problem1535/1",
    description: "Minimize time to paint boards.",
    tags: ["array", "binary-search"],
    examples: ["Input: [10,20,30,40], k=2 -> 60", "Input: [5,5,5,5], k=2 -> 10"]
  },
  {
    title: "Median of 2 Sorted Arrays",
    slug: "median-two-sorted-arrays",
    difficulty: "hard",
    link: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    description: "Median of two combined sorted arrays.",
    tags: ["array", "binary-search"],
    examples: ["Input: [1,3], [2] -> 2.0", "Input: [1,2], [3,4] -> 2.5"]
  },
  {
    title: "Kth Element of 2 Sorted Arrays",
    slug: "kth-element-two-sorted-arrays",
    difficulty: "hard",
    link: "https://www.geeksforgeeks.org/problems/k-th-element-of-two-sorted-array1317/1",
    description: "Find kth smallest element in two arrays.",
    tags: ["array", "binary-search"],
    examples: ["Input: [2,3,6,7,9], [1,4,8,10], k=5 -> 6", "Input: [1,2], [3,4], k=3 -> 3"]
  },
  {
    title: "Find Row with Maximum 1's",
    slug: "row-max-1s",
    difficulty: "hard",
    link: "https://www.geeksforgeeks.org/problems/row-with-max-1s0023/1",
    description: "Row index with most 1s.",
    tags: ["matrix", "binary-search"],
    examples: ["Input: [[0,1,1],[0,0,1]] -> 0", "Input: [[0,0],[0,0]] -> -1"]
  },
  {
    title: "Search in 2D Matrix - II",
    slug: "search-2d-matrix-ii",
    difficulty: "hard",
    link: "https://leetcode.com/problems/search-a-2d-matrix-ii/",
    description: "Search in row-col sorted matrix.",
    tags: ["matrix", "binary-search"],
    examples: ["Input: [[1,4],[2,5]], 5 -> true", "Input: [[1,4],[2,5]], 3 -> false"]
  },
  {
    title: "Find Peak Element - II",
    slug: "find-peak-element-2d",
    difficulty: "hard",
    link: "https://leetcode.com/problems/find-a-peak-element-ii/",
    description: "2D peak element.",
    tags: ["matrix", "binary-search"],
    examples: ["Input: [[1,4],[3,2]] -> [0,1]", "Input: [[10,20],[15,30]] -> [1,1]"]
  }
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
      `${BASE}/sheets/${sheetId}/section`,
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
      "Binary Search Mastery:",
      "Structured Binary Search practice from easy to hard — covering all core patterns.",
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
