import "dotenv/config";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SEED_KEY = process.env.SEED_KEY || "seed123";

// Delay between requests to avoid overwhelming the database connection pool
const REQUEST_DELAY_MS = 1500; // Increased to 1.5s per request
const TESTCASE_DELAY_MS = 2000; // Extra delay after test case creation (more DB writes)
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000; // Increased retry delay to 5s

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to make API requests with retry logic
async function apiRequest(
  endpoint: string,
  method: "GET" | "POST" = "POST",
  body?: any,
  retryCount = 0,
): Promise<any> {
  const url = `${BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-seed-key": SEED_KEY,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`${method} ${endpoint}`);

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `API request failed: ${endpoint} - ${data.message || response.statusText}`,
      );
    }

    // Add delay after successful request to prevent connection pool exhaustion
    await delay(REQUEST_DELAY_MS);

    return data.data;
  } catch (error: any) {
    if (retryCount < MAX_RETRIES) {
      console.log(
        `  ⚠️ Request failed, retrying in ${RETRY_DELAY_MS}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`,
      );
      await delay(RETRY_DELAY_MS);
      return apiRequest(endpoint, method, body, retryCount + 1);
    }
    throw error;
  }
}

// Helper function to create or fetch existing problem (simplified - routes handle idempotency)
async function createOrFetchProblem(problemData: any, testCases?: any[]) {
  const created = await apiRequest("/api/problems", "POST", problemData);
  console.log(`  ✓ Ready: ${created.title}`);

  // Create test cases for this problem (route skips if they exist)
  if (testCases && testCases.length > 0) {
    await apiRequest(`/api/problems/${created.slug}/testcases`, "POST", {
      testCases,
    });
    console.log(`    → Test cases ready`);
  }

  return created;
}

// Helper function to create or fetch existing sheet (simplified - routes handle idempotency)
async function createOrFetchSheet(sheetData: any) {
  const created = await apiRequest("/api/sheets", "POST", sheetData);
  console.log(`  ✓ Ready sheet: ${created.title}`);
  return created;
}

// Helper function to create or fetch existing section (simplified - routes handle idempotency)
async function createOrFetchSection(sheetSlug: string, sectionData: any) {
  const created = await apiRequest(
    `/api/sheets/${sheetSlug}/section`,
    "POST",
    sectionData,
  );
  console.log(`  ✓ Ready section: ${created.title}`);
  return created;
}

// Helper function to link problem to section (simplified - routes handle idempotency)
async function linkProblemToSection(
  sheetSlug: string,
  sectionId: string,
  problem: any,
) {
  await apiRequest(
    `/api/sheets/${sheetSlug}/section/${sectionId}/section-problems`,
    "POST",
    { problemId: problem.id },
  );
  console.log(`    → Linked: ${problem.title}`);
}

// ─────────────────────────────────────────────────────────────────
// PROBLEM DATA
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// CODEFORCES PROBLEMS — Ready for seed file
// All inputs are in raw stdin format for Judge0
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// SHEET CONFIGURATION
// ─────────────────────────────────────────────────────────────────

const EASY_PROBLEMS = [
  {
    title: "Assign Cookies",
    slug: "assign-cookies",
    difficulty: "easy",
    link: "https://leetcode.com/problems/assign-cookies/",
    description: `Assume you are an awesome parent and want to give your children some cookies. But, you should give each child at most one cookie.\n\nEach child i has a greed factor g[i], which is the minimum size of a cookie that the child will be content with; and each cookie j has a size s[j]. If s[j] >= g[i], we can assign the cookie j to the child i, and the child will be content.\n\nReturn the maximum number of content children.`,
    tags: ["Greedy", "Array", "Sorting", "Two Pointers"],
    companies: ["Amazon", "Google"],
    examples: [
      `Input: g = [1,2,3], s = [1,1]\nOutput: 1`,
      `Input: g = [1,2], s = [1,2,3]\nOutput: 2`,
    ],
    editorial: `Sort both arrays. Use two pointers — one for children, one for cookies.\nFor each cookie (smallest first), try to satisfy the least greedy remaining child.\nIf cookie >= child's greed, satisfy the child and move both pointers. Otherwise skip the cookie.\nTime complexity: O(n log n + m log m), Space complexity: O(1).`,
    aiHints: `Sort both greed factors and cookie sizes\nGreedily assign the smallest sufficient cookie to the least greedy child\nTwo pointers: only advance the child pointer when a child is satisfied`,
    testCases: [
      { input: "3\n1 2 3\n2\n1 1", expectedOutput: "1", displayInput: "g = [1,2,3], s = [1,1]", displayOutput: "1", visibility: "PUBLIC" },
      { input: "2\n1 2\n3\n1 2 3", expectedOutput: "2", displayInput: "g = [1,2], s = [1,2,3]", displayOutput: "2", visibility: "PUBLIC" },
      { input: "1\n5\n1\n4", expectedOutput: "0", visibility: "PRIVATE" },
      { input: "3\n1 2 3\n3\n3 2 1", expectedOutput: "3", visibility: "PRIVATE" },
      { input: "4\n10 9 8 7\n3\n5 6 7", expectedOutput: "1", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Lemonade Change",
    slug: "lemonade-change",
    difficulty: "easy",
    link: "https://leetcode.com/problems/lemonade-change/",
    description: `At a lemonade stand, each lemonade costs $5. Customers are standing in a queue to buy one at a time, and each customer will buy only one lemonade and pay with either a $5, $10, or $20 bill.\n\nYou must provide every customer with correct change. Return true if you can provide every customer with the correct change, or false otherwise.`,
    tags: ["Greedy", "Array"],
    companies: ["Amazon", "Bloomberg", "Google"],
    examples: [
      `Input: bills = [5,5,5,10,20]\nOutput: true`,
      `Input: bills = [5,5,10,10,20]\nOutput: false`,
    ],
    editorial: `Track count of $5 and $10 bills (no need to track $20 — never useful for change).\nFor a $10 bill: give one $5 as change.\nFor a $20 bill: prefer to give one $10 + one $5 (saves $5 bills for future), else give three $5 bills.\nIf you can't make change at any point, return false.\nTime complexity: O(n), Space complexity: O(1).`,
    aiHints: `Track $5 and $10 bill counts separately — $20 bills are never useful for change\nFor $20 change, prefer $10 + $5 over three $5 bills to preserve $5 bills\nReturn false as soon as you cannot make the required change`,
    testCases: [
      { input: "5 5 5 10 20", expectedOutput: "true", displayInput: "bills = [5,5,5,10,20]", displayOutput: "true", visibility: "PUBLIC" },
      { input: "5 5 10 10 20", expectedOutput: "false", displayInput: "bills = [5,5,10,10,20]", displayOutput: "false", visibility: "PUBLIC" },
      { input: "5 5 5 5 20", expectedOutput: "true", visibility: "PRIVATE" },
      { input: "10 10", expectedOutput: "false", visibility: "PRIVATE" },
      { input: "5 5 10 20 5 5 5 5 20", expectedOutput: "false", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Best Time to Buy and Sell Stock II",
    slug: "best-time-to-buy-and-sell-stock-ii",
    difficulty: "easy",
    link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/",
    description: `You are given an integer array prices where prices[i] is the price of a given stock on the ith day.\n\nOn each day, you may decide to buy and/or sell the stock. You can only hold at most one share of the stock at any time. However, you can buy it then immediately sell it on the same day.\n\nFind and return the maximum profit you can achieve.`,
    tags: ["Greedy", "Array", "Dynamic Programming"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Bloomberg"],
    examples: [
      `Input: prices = [7,1,5,3,6,4]\nOutput: 7\nExplanation: Buy day 2 (price=1), sell day 3 (price=5), profit=4. Buy day 4 (price=3), sell day 5 (price=6), profit=3. Total=7.`,
      `Input: prices = [1,2,3,4,5]\nOutput: 4`,
    ],
    editorial: `Greedy insight: capture every upward price movement.\nAdd prices[i] - prices[i-1] to profit whenever it is positive.\nThis is equivalent to buying at every local minimum and selling at every local maximum.\nTime complexity: O(n), Space complexity: O(1).`,
    aiHints: `You can capture every upward movement — no need to find actual buy/sell pairs\nIf prices[i] > prices[i-1], add the difference to profit\nThis greedily captures every profitable day-to-day increase`,
    testCases: [
      { input: "7 1 5 3 6 4", expectedOutput: "7", displayInput: "prices = [7,1,5,3,6,4]", displayOutput: "7", visibility: "PUBLIC" },
      { input: "1 2 3 4 5", expectedOutput: "4", displayInput: "prices = [1,2,3,4,5]", displayOutput: "4", visibility: "PUBLIC" },
      { input: "7 6 4 3 1", expectedOutput: "0", visibility: "PRIVATE" },
      { input: "1", expectedOutput: "0", visibility: "PRIVATE" },
      { input: "3 3 3 3", expectedOutput: "0", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    difficulty: "easy",
    link: "https://leetcode.com/problems/maximum-subarray/",
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.`,
    tags: ["Greedy", "Array", "Dynamic Programming", "Divide and Conquer"],
    companies: ["Amazon", "Apple", "Google", "Microsoft", "Facebook", "LinkedIn"],
    examples: [
      `Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: Subarray [4,-1,2,1] has the largest sum = 6.`,
      `Input: nums = [5,4,-1,7,8]\nOutput: 23`,
    ],
    editorial: `Kadane's algorithm: maintain a running sum. If the running sum becomes negative, reset it to 0 (discard the previous subarray).\nTrack the maximum running sum seen so far.\nTime complexity: O(n), Space complexity: O(1).`,
    aiHints: `Kadane's: if your running sum goes negative, it can only hurt future subarrays — reset to 0\nTrack the maximum seen so far separately from the running sum\nA single element can be the answer if all elements are negative`,
    testCases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", displayInput: "nums = [-2,1,-3,4,-1,2,1,-5,4]", displayOutput: "6", visibility: "PUBLIC" },
      { input: "5 4 -1 7 8", expectedOutput: "23", displayInput: "nums = [5,4,-1,7,8]", displayOutput: "23", visibility: "PUBLIC" },
      { input: "1", expectedOutput: "1", visibility: "PRIVATE" },
      { input: "-1 -2 -3", expectedOutput: "-1", visibility: "PRIVATE" },
      { input: "-2 -1", expectedOutput: "-1", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Jump Game",
    slug: "jump-game",
    difficulty: "easy",
    link: "https://leetcode.com/problems/jump-game/",
    description: `You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position.\n\nReturn true if you can reach the last index, or false otherwise.`,
    tags: ["Greedy", "Array", "Dynamic Programming"],
    companies: ["Amazon", "Apple", "Google", "Microsoft", "Bloomberg"],
    examples: [
      `Input: nums = [2,3,1,1,4]\nOutput: true`,
      `Input: nums = [3,2,1,0,4]\nOutput: false`,
    ],
    editorial: `Track the maximum index reachable so far (maxReach).\nFor each index i, if i > maxReach we're stuck — return false.\nOtherwise update maxReach = max(maxReach, i + nums[i]).\nIf we complete the loop, return true.\nTime complexity: O(n), Space complexity: O(1).`,
    aiHints: `Track the farthest index you can reach at any point\nIf current index i exceeds your farthest reach, you are stuck — return false\nUpdate farthest reach as max(farthest, i + nums[i]) at each step`,
    testCases: [
      { input: "2 3 1 1 4", expectedOutput: "true", displayInput: "nums = [2,3,1,1,4]", displayOutput: "true", visibility: "PUBLIC" },
      { input: "3 2 1 0 4", expectedOutput: "false", displayInput: "nums = [3,2,1,0,4]", displayOutput: "false", visibility: "PUBLIC" },
      { input: "0", expectedOutput: "true", visibility: "PRIVATE" },
      { input: "1 0", expectedOutput: "true", visibility: "PRIVATE" },
      { input: "0 1", expectedOutput: "false", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Is Subsequence",
    slug: "is-subsequence",
    difficulty: "easy",
    link: "https://leetcode.com/problems/is-subsequence/",
    description: `Given two strings s and t, return true if s is a subsequence of t, or false otherwise.\n\nA subsequence of a string is a new string that is formed from the original string by deleting some (can be none) of the characters without disturbing the relative positions of the remaining characters.`,
    tags: ["Greedy", "Two Pointers", "String", "Dynamic Programming"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    examples: [
      `Input: s = "abc", t = "ahbgdc"\nOutput: true`,
      `Input: s = "axc", t = "ahbgdc"\nOutput: false`,
    ],
    editorial: `Two pointer greedy: pointer i for s, pointer j for t.\nAdvance j always. When t[j] == s[i], advance i too.\nIf i reaches len(s), all characters of s were matched in order — return true.\nTime complexity: O(n), Space complexity: O(1).`,
    aiHints: `Walk through t with one pointer and try to match s character by character\nOnly advance the s pointer when there is a match in t\nIf the s pointer reaches the end of s, all characters were matched`,
    testCases: [
      { input: "abc ahbgdc", expectedOutput: "true", displayInput: 's = "abc", t = "ahbgdc"', displayOutput: "true", visibility: "PUBLIC" },
      { input: "axc ahbgdc", expectedOutput: "false", displayInput: 's = "axc", t = "ahbgdc"', displayOutput: "false", visibility: "PUBLIC" },
      { input: " b", expectedOutput: "true", visibility: "PRIVATE" },
      { input: "ace abcde", expectedOutput: "true", visibility: "PRIVATE" },
      { input: "aec abcde", expectedOutput: "false", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Largest Number After Digit Swaps by Parity",
    slug: "largest-number-after-digit-swaps-by-parity",
    difficulty: "easy",
    link: "https://leetcode.com/problems/largest-number-after-digit-swaps-by-parity/",
    description: `You are given a positive integer num. You may swap any two digits of num that have the same parity (i.e. both odd digits, or both even digits).\n\nReturn the largest possible value of num after any number of swaps.`,
    tags: ["Greedy", "Sorting"],
    companies: ["Amazon", "Google"],
    examples: [
      `Input: num = 1234\nOutput: 3412`,
      `Input: num = 65875\nOutput: 87655`,
    ],
    editorial: `Extract digits. Separately sort odd-position digits and even-position digits in descending order.\nReconstruct the number by placing the largest available odd digit wherever an odd digit was, and similarly for even.\nTime complexity: O(d log d) where d = number of digits, Space complexity: O(d).`,
    aiHints: `Separate the digits into two groups: odd-valued and even-valued\nSort each group in descending order\nReconstruct the number by filling each original odd digit position with the next largest odd digit`,
    testCases: [
      { input: "1234", expectedOutput: "3412", displayInput: "num = 1234", displayOutput: "3412", visibility: "PUBLIC" },
      { input: "65875", expectedOutput: "87655", displayInput: "num = 65875", displayOutput: "87655", visibility: "PUBLIC" },
      { input: "1", expectedOutput: "1", visibility: "PRIVATE" },
      { input: "2222", expectedOutput: "2222", visibility: "PRIVATE" },
      { input: "9753", expectedOutput: "9753", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Minimum Operations to Reduce X to Zero",
    slug: "minimum-operations-reduce-x-to-zero",
    difficulty: "easy",
    link: "https://leetcode.com/problems/minimum-operations-to-reduce-x-to-zero/",
    description: `You are given an integer array nums and an integer x. In one operation, you can either remove the leftmost or the rightmost element from the array and subtract its value from x. Return the minimum number of operations to reduce x to exactly 0, or -1 if it's not possible.\n\nNote: Greedy reframing — find the longest subarray with sum = total - x.`,
    tags: ["Greedy", "Sliding Window", "Hash Map", "Array"],
    companies: ["Google", "Amazon", "Facebook"],
    examples: [
      `Input: nums = [1,1,4,2,3], x = 5\nOutput: 2`,
      `Input: nums = [5,6,7,8,9], x = 4\nOutput: -1`,
    ],
    editorial: `Reframe: removing elements from both ends with sum x = keeping a middle subarray with sum (total - x).\nFind the longest subarray with sum = total - x using a sliding window.\nAnswer = n - length of that subarray. If no such subarray exists return -1.\nTime complexity: O(n), Space complexity: O(1).`,
    aiHints: `Reframe the problem: instead of removing from ends, find the longest middle subarray with sum = total - x\nUse a sliding window to find the maximum length subarray with the target sum\nAnswer is n minus the length of that subarray`,
    testCases: [
      { input: "5\n1 1 4 2 3", expectedOutput: "2", displayInput: "nums = [1,1,4,2,3], x = 5", displayOutput: "2", visibility: "PUBLIC" },
      { input: "4\n5 6 7 8 9", expectedOutput: "-1", displayInput: "nums = [5,6,7,8,9], x = 4", displayOutput: "-1", visibility: "PUBLIC" },
      { input: "3\n3 2 20 1 1 3", expectedOutput: "5", visibility: "PRIVATE" },
      { input: "10\n1 1 1 1 1 1 1 1 1 1", expectedOutput: "10", visibility: "PRIVATE" },
      { input: "1\n1", expectedOutput: "1", visibility: "PRIVATE" },
    ],
  },
];

const MEDIUM_PROBLEMS = [
  {
    title: "Jump Game II",
    slug: "jump-game-ii",
    difficulty: "medium",
    link: "https://leetcode.com/problems/jump-game-ii/",
    description: `You are given a 0-indexed array of integers nums of length n. You are initially positioned at nums[0]. Each element nums[i] represents the maximum length of a forward jump from index i.\n\nReturn the minimum number of jumps to reach nums[n-1].`,
    tags: ["Greedy", "Array", "Dynamic Programming"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Apple"],
    examples: [
      `Input: nums = [2,3,1,1,4]\nOutput: 2\nExplanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.`,
      `Input: nums = [2,3,0,1,4]\nOutput: 2`,
    ],
    editorial: `BFS-style greedy: track current jump boundary and farthest reach within it.\nWhen you reach the current boundary, take a jump — extend boundary to farthest.\nCount jumps until you reach or pass the last index.\nTime complexity: O(n), Space complexity: O(1).`,
    aiHints: `Think in terms of jump levels like BFS — within the current level find the farthest you can reach\nWhen you exhaust the current level boundary, increment jumps and extend to the farthest reach\nYou never need to jump more than necessary — just track the farthest reachable per level`,
    testCases: [
      { input: "2 3 1 1 4", expectedOutput: "2", displayInput: "nums = [2,3,1,1,4]", displayOutput: "2", visibility: "PUBLIC" },
      { input: "2 3 0 1 4", expectedOutput: "2", displayInput: "nums = [2,3,0,1,4]", displayOutput: "2", visibility: "PUBLIC" },
      { input: "1", expectedOutput: "0", visibility: "PRIVATE" },
      { input: "1 2 3", expectedOutput: "2", visibility: "PRIVATE" },
      { input: "1 1 1 1 1", expectedOutput: "4", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Gas Station",
    slug: "gas-station",
    difficulty: "medium",
    link: "https://leetcode.com/problems/gas-station/",
    description: `There are n gas stations along a circular route. You are given two integer arrays gas and cost where gas[i] is the amount of gas at station i and cost[i] is the cost to travel from station i to the next station.\n\nReturn the starting gas station's index if you can travel around the circuit once, or -1 if it's impossible.`,
    tags: ["Greedy", "Array"],
    companies: ["Amazon", "Google", "Facebook", "Apple", "Bloomberg"],
    examples: [
      `Input: gas = [1,2,3,4,5], cost = [3,4,5,1,2]\nOutput: 3`,
      `Input: gas = [2,3,4], cost = [3,4,3]\nOutput: -1`,
    ],
    editorial: `If total gas < total cost, no solution exists — return -1.\nOtherwise a solution always exists. Find it greedily:\nTrack running tank balance. When it drops below 0, the start must be the next station — reset tank.\nTime complexity: O(n), Space complexity: O(1).`,
    aiHints: `If total gas >= total cost a solution always exists\nWhen the running tank goes negative, all stations up to this point cannot be the start — reset to next\nThe greedy reset guarantees the correct start station`,
    testCases: [
      { input: "5\n1 2 3 4 5\n3 4 5 1 2", expectedOutput: "3", displayInput: "gas = [1,2,3,4,5], cost = [3,4,5,1,2]", displayOutput: "3", visibility: "PUBLIC" },
      { input: "3\n2 3 4\n3 4 3", expectedOutput: "-1", displayInput: "gas = [2,3,4], cost = [3,4,3]", displayOutput: "-1", visibility: "PUBLIC" },
      { input: "1\n5\n4", expectedOutput: "0", visibility: "PRIVATE" },
      { input: "2\n3 1\n1 3", expectedOutput: "0", visibility: "PRIVATE" },
      { input: "4\n1 1 1 1\n1 1 1 1", expectedOutput: "0", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Non-overlapping Intervals",
    slug: "non-overlapping-intervals",
    difficulty: "medium",
    link: "https://leetcode.com/problems/non-overlapping-intervals/",
    description: `Given an array of intervals intervals where intervals[i] = [starti, endi], return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.`,
    tags: ["Greedy", "Array", "Sorting", "Dynamic Programming"],
    companies: ["Amazon", "Google", "Facebook"],
    examples: [
      `Input: intervals = [[1,2],[2,3],[3,4],[1,3]]\nOutput: 1\nExplanation: Remove [1,3] and the rest are non-overlapping.`,
      `Input: intervals = [[1,2],[1,2],[1,2]]\nOutput: 2`,
    ],
    editorial: `Sort intervals by end time. Greedily keep intervals with the earliest end time.\nIf current interval overlaps with last kept one, remove it (increment count).\nOtherwise keep it and update the last end time.\nThis is the classic activity selection problem.\nTime complexity: O(n log n), Space complexity: O(1).`,
    aiHints: `Sort by end time — intervals finishing earlier leave more room for others\nIf current interval overlaps with the last kept one, remove it (greedy discard)\nCount removals = total intervals minus maximum non-overlapping intervals kept`,
    testCases: [
      { input: "4\n1 2\n2 3\n3 4\n1 3", expectedOutput: "1", displayInput: "intervals = [[1,2],[2,3],[3,4],[1,3]]", displayOutput: "1", visibility: "PUBLIC" },
      { input: "3\n1 2\n1 2\n1 2", expectedOutput: "2", displayInput: "intervals = [[1,2],[1,2],[1,2]]", displayOutput: "2", visibility: "PUBLIC" },
      { input: "1\n1 2", expectedOutput: "0", visibility: "PRIVATE" },
      { input: "3\n1 100\n11 22\n1 11", expectedOutput: "1", visibility: "PRIVATE" },
      { input: "4\n0 2\n1 3\n2 4\n3 5", expectedOutput: "2", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Meeting Rooms II",
    slug: "meeting-rooms-ii",
    difficulty: "medium",
    link: "https://leetcode.com/problems/meeting-rooms-ii/",
    description: `Given an array of meeting time intervals intervals where intervals[i] = [starti, endi], return the minimum number of conference rooms required.`,
    tags: ["Greedy", "Array", "Sorting", "Heap"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Uber"],
    examples: [
      `Input: intervals = [[0,30],[5,10],[15,20]]\nOutput: 2`,
      `Input: intervals = [[7,10],[2,4]]\nOutput: 1`,
    ],
    editorial: `Sort by start time. Use a min-heap of end times of ongoing meetings.\nFor each new meeting: if the heap's minimum end <= current start, pop it (room freed).\nPush current meeting's end time. Heap size is the answer.\nTime complexity: O(n log n), Space complexity: O(n).`,
    aiHints: `Sort meetings by start time; use a min-heap tracking when each room next becomes free\nIf the earliest-ending meeting ends before or at the new one's start, reuse that room\nThe heap size at the end equals the minimum rooms needed`,
    testCases: [
      { input: "3\n0 30\n5 10\n15 20", expectedOutput: "2", displayInput: "intervals = [[0,30],[5,10],[15,20]]", displayOutput: "2", visibility: "PUBLIC" },
      { input: "2\n7 10\n2 4", expectedOutput: "1", displayInput: "intervals = [[7,10],[2,4]]", displayOutput: "1", visibility: "PUBLIC" },
      { input: "1\n0 5", expectedOutput: "1", visibility: "PRIVATE" },
      { input: "4\n1 5\n2 6\n3 7\n4 8", expectedOutput: "4", visibility: "PRIVATE" },
      { input: "4\n1 4\n4 8\n8 12\n12 16", expectedOutput: "1", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Task Scheduler",
    slug: "task-scheduler",
    difficulty: "medium",
    link: "https://leetcode.com/problems/task-scheduler/",
    description: `You are given an array of CPU tasks, each labeled with a letter from A to Z, and a number n. Each CPU interval can be idle or allows the completion of one task. Tasks can be completed in any order, but there is a cooldown interval of n between two identical tasks.\n\nReturn the minimum number of intervals the CPU will take to finish all the given tasks.`,
    tags: ["Greedy", "Array", "Hash Table", "Sorting", "Heap"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    examples: [
      `Input: tasks = ["A","A","A","B","B","B"], n = 2\nOutput: 8\nExplanation: A -> B -> idle -> A -> B -> idle -> A -> B.`,
      `Input: tasks = ["A","A","A","B","B","B"], n = 0\nOutput: 6`,
    ],
    editorial: `Let maxFreq = frequency of the most frequent task, maxCount = number of tasks with that frequency.\nFormula: max(tasks.length, (maxFreq - 1) * (n + 1) + maxCount).\nIntuition: arrange the most frequent task in blocks of (n+1), filling other tasks or idles in between.\nTime complexity: O(n), Space complexity: O(1) — 26 letters.`,
    aiHints: `The most frequent task determines the minimum frame structure\nFormula: (maxFreq - 1) * (n + 1) + count of tasks with maxFreq\nThe answer is the max of this formula and the total number of tasks`,
    testCases: [
      { input: "2\nA A A B B B", expectedOutput: "8", displayInput: 'tasks = ["A","A","A","B","B","B"], n = 2', displayOutput: "8", visibility: "PUBLIC" },
      { input: "0\nA A A B B B", expectedOutput: "6", displayInput: 'tasks = ["A","A","A","B","B","B"], n = 0', displayOutput: "6", visibility: "PUBLIC" },
      { input: "2\nA A A A B B B C C D", expectedOutput: "10", visibility: "PRIVATE" },
      { input: "1\nA B", expectedOutput: "2", visibility: "PRIVATE" },
      { input: "50\nA A A", expectedOutput: "103", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Partition Labels",
    slug: "partition-labels",
    difficulty: "medium",
    link: "https://leetcode.com/problems/partition-labels/",
    description: `You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part. Return a list of integers representing the size of these parts.`,
    tags: ["Greedy", "Hash Map", "Two Pointers", "String"],
    companies: ["Amazon", "Google", "Facebook"],
    examples: [
      `Input: s = "ababcbacadefegdehijhklij"\nOutput: [9,7,8]`,
      `Input: s = "eccbbbbdec"\nOutput: [10]`,
    ],
    editorial: `Record the last occurrence index of each character.\nUse two pointers: start and end of the current partition.\nFor each character, extend end to max(end, last[char]).\nWhen i reaches end, the partition is complete — record its size and start a new one.\nTime complexity: O(n), Space complexity: O(1) — 26 letters.`,
    aiHints: `Record the last index where each character appears\nExpand the current partition boundary to include the last occurrence of every character seen so far\nWhen the current index matches the boundary, close the partition`,
    testCases: [
      { input: "ababcbacadefegdehijhklij", expectedOutput: "9 7 8", displayInput: 's = "ababcbacadefegdehijhklij"', displayOutput: "[9,7,8]", visibility: "PUBLIC" },
      { input: "eccbbbbdec", expectedOutput: "10", displayInput: 's = "eccbbbbdec"', displayOutput: "[10]", visibility: "PUBLIC" },
      { input: "a", expectedOutput: "1", visibility: "PRIVATE" },
      { input: "abcabc", expectedOutput: "6", visibility: "PRIVATE" },
      { input: "abcd", expectedOutput: "1 1 1 1", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Boats to Save People",
    slug: "boats-to-save-people",
    difficulty: "medium",
    link: "https://leetcode.com/problems/boats-to-save-people/",
    description: `You are given an array people where people[i] is the weight of the ith person, and an infinite number of boats where each boat can carry a maximum weight of limit. Each boat carries at most two people at the same time.\n\nReturn the minimum number of boats to carry every given person.`,
    tags: ["Greedy", "Array", "Sorting", "Two Pointers"],
    companies: ["Amazon", "Google", "Apple"],
    examples: [
      `Input: people = [1,2], limit = 3\nOutput: 1`,
      `Input: people = [3,2,2,1], limit = 3\nOutput: 3`,
    ],
    editorial: `Sort people by weight. Use two pointers — lightest (lo) and heaviest (hi).\nIf lightest + heaviest <= limit, pair them together (both pointers move inward).\nOtherwise, heaviest goes alone (only hi moves inward).\nIncrement boat count each step.\nTime complexity: O(n log n), Space complexity: O(1).`,
    aiHints: `Sort and use two pointers — try to pair the lightest with the heaviest\nIf they fit together both pointers move inward; otherwise the heaviest goes alone\nEvery iteration uses one boat`,
    testCases: [
      { input: "3\n1 2", expectedOutput: "1", displayInput: "people = [1,2], limit = 3", displayOutput: "1", visibility: "PUBLIC" },
      { input: "3\n3 2 2 1", expectedOutput: "3", displayInput: "people = [3,2,2,1], limit = 3", displayOutput: "3", visibility: "PUBLIC" },
      { input: "5\n3 5 3 4", expectedOutput: "4", visibility: "PRIVATE" },
      { input: "3\n1 1 1", expectedOutput: "2", visibility: "PRIVATE" },
      { input: "6\n2 2 2 2 2 2", expectedOutput: "3", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Minimum Number of Arrows to Burst Balloons",
    slug: "minimum-arrows-to-burst-balloons",
    difficulty: "medium",
    link: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/",
    description: `There are some spherical balloons taped onto a flat wall. The balloons are represented as a 2D integer array points where points[i] = [xstart, xend]. An arrow can be shot vertically from x = some value and bursts all balloons whose interval includes that x. Return the minimum number of arrows needed to burst all balloons.`,
    tags: ["Greedy", "Array", "Sorting"],
    companies: ["Amazon", "Facebook", "Google", "Microsoft"],
    examples: [
      `Input: points = [[10,16],[2,8],[1,6],[7,12]]\nOutput: 2`,
      `Input: points = [[1,2],[3,4],[5,6],[7,8]]\nOutput: 4`,
    ],
    editorial: `Sort balloons by end position. Shoot an arrow at the first balloon's end.\nThis arrow bursts all balloons whose start <= current arrow position.\nWhen a balloon's start > current arrow position, shoot a new arrow at that balloon's end.\nTime complexity: O(n log n), Space complexity: O(1).`,
    aiHints: `Sort by end coordinate — shoot the first arrow at the end of the first balloon\nSkip all balloons that the current arrow already covers\nWhen a balloon is not covered, shoot a new arrow at its end`,
    testCases: [
      { input: "4\n10 16\n2 8\n1 6\n7 12", expectedOutput: "2", displayInput: "points = [[10,16],[2,8],[1,6],[7,12]]", displayOutput: "2", visibility: "PUBLIC" },
      { input: "4\n1 2\n3 4\n5 6\n7 8", expectedOutput: "4", displayInput: "points = [[1,2],[3,4],[5,6],[7,8]]", displayOutput: "4", visibility: "PUBLIC" },
      { input: "1\n1 2", expectedOutput: "1", visibility: "PRIVATE" },
      { input: "3\n1 2\n2 3\n3 4", expectedOutput: "2", visibility: "PRIVATE" },
      { input: "3\n1 10\n2 5\n6 9", expectedOutput: "1", visibility: "PRIVATE" },
    ],
  },
];

const HARD_PROBLEMS = [
  {
    title: "Candy",
    slug: "candy",
    difficulty: "hard",
    link: "https://leetcode.com/problems/candy/",
    description: `There are n children standing in a line. Each child is assigned a rating value given in the integer array ratings.\n\nYou are giving candies to these children subjected to the following requirements:\n- Each child must have at least one candy.\n- Children with a higher rating get more candies than their neighbors.\n\nReturn the minimum number of candies you need to have to distribute the candies to the children.`,
    tags: ["Greedy", "Array"],
    companies: ["Amazon", "Apple", "Google", "Microsoft"],
    examples: [
      `Input: ratings = [1,0,2]\nOutput: 5\nExplanation: [2,1,2]`,
      `Input: ratings = [1,2,2]\nOutput: 4\nExplanation: [1,2,1]`,
    ],
    editorial: `Two-pass greedy:\nPass 1 (left to right): if ratings[i] > ratings[i-1], candies[i] = candies[i-1] + 1, else 1.\nPass 2 (right to left): if ratings[i] > ratings[i+1], candies[i] = max(candies[i], candies[i+1] + 1).\nSum all candies.\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `Two passes: left-to-right handles the left neighbor constraint, right-to-left handles the right neighbor constraint\nLeft pass: if current rating > left neighbor, give one more candy than left neighbor\nRight pass: if current rating > right neighbor, ensure at least one more candy than right neighbor (take max)`,
    testCases: [
      { input: "1 0 2", expectedOutput: "5", displayInput: "ratings = [1,0,2]", displayOutput: "5", visibility: "PUBLIC" },
      { input: "1 2 2", expectedOutput: "4", displayInput: "ratings = [1,2,2]", displayOutput: "4", visibility: "PUBLIC" },
      { input: "1", expectedOutput: "1", visibility: "PRIVATE" },
      { input: "1 3 2 2 1", expectedOutput: "7", visibility: "PRIVATE" },
      { input: "5 4 3 2 1", expectedOutput: "15", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Trapping Rain Water",
    slug: "trapping-rain-water",
    difficulty: "hard",
    link: "https://leetcode.com/problems/trapping-rain-water/",
    description: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`,
    tags: ["Greedy", "Array", "Two Pointers", "Dynamic Programming", "Stack"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Apple", "Bloomberg"],
    examples: [
      `Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6`,
      `Input: height = [4,2,0,3,2,5]\nOutput: 9`,
    ],
    editorial: `Two pointer greedy: maintain leftMax and rightMax.\nThe side with smaller max limits the water at the current pointer.\nIf leftMax < rightMax: water at left = leftMax - height[left], advance left.\nElse: water at right = rightMax - height[right], advance right.\nTime complexity: O(n), Space complexity: O(1).`,
    aiHints: `Two pointers from both ends — the smaller max side determines how much water the current bar holds\nIf leftMax <= rightMax, process the left pointer: add leftMax - height[left] if positive\nOtherwise process the right pointer: add rightMax - height[right] if positive`,
    testCases: [
      { input: "0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6", displayInput: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", displayOutput: "6", visibility: "PUBLIC" },
      { input: "4 2 0 3 2 5", expectedOutput: "9", displayInput: "height = [4,2,0,3,2,5]", displayOutput: "9", visibility: "PUBLIC" },
      { input: "1 0 1", expectedOutput: "1", visibility: "PRIVATE" },
      { input: "3 0 2 0 4", expectedOutput: "7", visibility: "PRIVATE" },
      { input: "1 2 3 4 5", expectedOutput: "0", visibility: "PRIVATE" },
    ],
  },
  {
    title: "IPO",
    slug: "ipo",
    difficulty: "hard",
    link: "https://leetcode.com/problems/ipo/",
    description: `You are given n projects where the ith project has a pure profit of profits[i] and a minimum capital of capital[i] to start it. Initially you have w capital. You can finish at most k distinct projects. After finishing a project you get the profit and it is added to your total capital.\n\nReturn the maximized capital after finishing at most k projects.`,
    tags: ["Greedy", "Heap", "Sorting"],
    companies: ["Amazon", "Google", "Facebook"],
    examples: [
      `Input: k = 2, w = 0, profits = [1,2,3], capital = [0,1,1]\nOutput: 4`,
      `Input: k = 3, w = 0, profits = [1,2,3], capital = [0,1,2]\nOutput: 6`,
    ],
    editorial: `Greedy with two heaps:\nMin-heap of (capital, profit) for all projects sorted by capital required.\nMax-heap of profits for unlocked projects (those with capital <= current w).\nFor each of k rounds: unlock all newly affordable projects into the max-heap, pick the most profitable one.\nTime complexity: O(n log n + k log n), Space complexity: O(n).`,
    aiHints: `Sort projects by capital requirement; unlock them into a max-heap as you gain more capital\nEach round greedily pick the highest profit available project\nUse a min-heap for locked projects and a max-heap for available ones`,
    testCases: [
      { input: "2 0\n1 2 3\n0 1 1", expectedOutput: "4", displayInput: "k=2, w=0, profits=[1,2,3], capital=[0,1,1]", displayOutput: "4", visibility: "PUBLIC" },
      { input: "3 0\n1 2 3\n0 1 2", expectedOutput: "6", displayInput: "k=3, w=0, profits=[1,2,3], capital=[0,1,2]", displayOutput: "6", visibility: "PUBLIC" },
      { input: "1 0\n1 2 3\n1 1 2", expectedOutput: "0", visibility: "PRIVATE" },
      { input: "2 1\n1 3 2\n1 2 0", expectedOutput: "6", visibility: "PRIVATE" },
      { input: "3 0\n5 1 2\n0 0 0", expectedOutput: "8", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Remove Duplicate Letters",
    slug: "remove-duplicate-letters",
    difficulty: "hard",
    link: "https://leetcode.com/problems/remove-duplicate-letters/",
    description: `Given a string s, remove duplicate letters so that every letter appears once and only once. You must make sure your result is the smallest in lexicographical order among all possible results.`,
    tags: ["Greedy", "Stack", "String", "Monotonic Stack"],
    companies: ["Google", "Amazon", "Facebook"],
    examples: [
      `Input: s = "bcabc"\nOutput: "abc"`,
      `Input: s = "cbacdcbc"\nOutput: "acdb"`,
    ],
    editorial: `Use a monotonic stack. For each character:\n- If already in the stack (seen set), skip it.\n- While the stack top is greater than current char AND the stack top appears later in s, pop the stack top.\n- Push current char and mark as seen.\nTrack last occurrence of each character to know if popping is safe.\nTime complexity: O(n), Space complexity: O(1) — 26 letters.`,
    aiHints: `Use a monotonic stack to build the lexicographically smallest result\nOnly pop a character from the stack if it appears again later in the string (safe to remove)\nSkip characters already present in the stack`,
    testCases: [
      { input: "bcabc", expectedOutput: "abc", displayInput: 's = "bcabc"', displayOutput: '"abc"', visibility: "PUBLIC" },
      { input: "cbacdcbc", expectedOutput: "acdb", displayInput: 's = "cbacdcbc"', displayOutput: '"acdb"', visibility: "PUBLIC" },
      { input: "a", expectedOutput: "a", visibility: "PRIVATE" },
      { input: "abcd", expectedOutput: "abcd", visibility: "PRIVATE" },
      { input: "dcba", expectedOutput: "dcba", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Create Maximum Number",
    slug: "create-maximum-number",
    difficulty: "hard",
    link: "https://leetcode.com/problems/create-maximum-number/",
    description: `You are given two integer arrays nums1 and nums2 of lengths m and n respectively. You are also given an integer k.\n\nCreate the maximum number of length k from digits of the two arrays while keeping the relative order of digits in each array the same. Return an array of the k digits representing the answer.`,
    tags: ["Greedy", "Stack", "Monotonic Stack", "Array"],
    companies: ["Google", "Amazon"],
    examples: [
      `Input: nums1 = [3,4,6,5], nums2 = [9,1,2,5,8,3], k = 5\nOutput: [9,8,6,5,3]`,
      `Input: nums1 = [6,7], nums2 = [6,0,4], k = 5\nOutput: [6,7,6,0,4]`,
    ],
    editorial: `Try all splits: take i digits from nums1 and k-i from nums2 (0 <= i <= k).\nFor each split, use a monotonic stack to extract the maximum subsequence of given length from each array.\nMerge the two subsequences greedily (compare lexicographically when merging).\nKeep the maximum result across all splits.\nTime complexity: O(k * (m + n + k)), Space complexity: O(k).`,
    aiHints: `Try all ways to split k digits between the two arrays\nFor each split, extract maximum subsequence of given length using a monotonic decreasing stack\nMerge the two subsequences by always picking the lexicographically larger remaining sequence`,
    testCases: [
      { input: "5\n3 4 6 5\n9 1 2 5 8 3", expectedOutput: "9 8 6 5 3", displayInput: "nums1=[3,4,6,5], nums2=[9,1,2,5,8,3], k=5", displayOutput: "[9,8,6,5,3]", visibility: "PUBLIC" },
      { input: "5\n6 7\n6 0 4", expectedOutput: "6 7 6 0 4", displayInput: "nums1=[6,7], nums2=[6,0,4], k=5", displayOutput: "[6,7,6,0,4]", visibility: "PUBLIC" },
      { input: "2\n3 9\n8 9", expectedOutput: "9 9", visibility: "PRIVATE" },
      { input: "1\n2 1\n2 3", expectedOutput: "3", visibility: "PRIVATE" },
      { input: "3\n2 5 1\n3 5 2", expectedOutput: "5 5 2", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Course Schedule III",
    slug: "course-schedule-iii",
    difficulty: "hard",
    link: "https://leetcode.com/problems/course-schedule-iii/",
    description: `There are n different online courses numbered from 1 to n. You are given an array courses where courses[i] = [durationi, lastDayi] indicates that the ith course should be taken continuously for durationi days and must be finished before or on lastDayi.\n\nReturn the maximum number of courses that can be taken.`,
    tags: ["Greedy", "Heap", "Sorting", "Array"],
    companies: ["Amazon", "Google", "Facebook"],
    examples: [
      `Input: courses = [[100,200],[200,1300],[1000,1250],[2000,3200]]\nOutput: 3`,
      `Input: courses = [[1,2]]\nOutput: 1`,
    ],
    editorial: `Sort courses by deadline. Maintain a max-heap of durations taken so far and a running time.\nFor each course: if it fits (time + duration <= deadline), take it.\nElse if it's shorter than the longest course taken, swap it in (removes longer, adds shorter — same count, but frees up time for future).\nTime complexity: O(n log n), Space complexity: O(n).`,
    aiHints: `Sort by deadline — always consider the earliest-deadline course next\nUse a max-heap of durations: if a course doesn't fit, replace the longest taken course if current is shorter\nSwapping in a shorter course keeps count the same but saves time for future courses`,
    testCases: [
      { input: "4\n100 200\n200 1300\n1000 1250\n2000 3200", expectedOutput: "3", displayInput: "courses = [[100,200],[200,1300],[1000,1250],[2000,3200]]", displayOutput: "3", visibility: "PUBLIC" },
      { input: "1\n1 2", expectedOutput: "1", displayInput: "courses = [[1,2]]", displayOutput: "1", visibility: "PUBLIC" },
      { input: "1\n3 2", expectedOutput: "0", visibility: "PRIVATE" },
      { input: "3\n5 5\n4 6\n2 6", expectedOutput: "2", visibility: "PRIVATE" },
      { input: "3\n1 10\n2 5\n3 3", expectedOutput: "3", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Smallest Range Covering Elements from K Lists",
    slug: "smallest-range-covering-k-lists",
    difficulty: "hard",
    link: "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/",
    description: `You have k lists of sorted integers. Find the smallest range [a, b] that includes at least one number from each of the k lists.\n\nA range [a, b] is smaller than range [c, d] if b - a < d - c or a < c when b - a == d - c.`,
    tags: ["Greedy", "Heap", "Sliding Window", "Sorting"],
    companies: ["Google", "Amazon", "Facebook"],
    examples: [
      `Input: nums = [[4,10,15,24,26],[0,9,12,20],[5,18,22,30]]\nOutput: [20,24]`,
      `Input: nums = [[1,2,3],[1,2,3],[1,2,3]]\nOutput: [1,1]`,
    ],
    editorial: `Use a min-heap with one element from each list (the smallest). Track the current max across all heap elements.\nThe current range is [heap_min, current_max].\nPop the minimum, update the range if smaller, push the next element from the same list.\nStop when any list is exhausted.\nTime complexity: O(n log k) where n = total elements, Space complexity: O(k).`,
    aiHints: `Min-heap with one element per list; track the current maximum across all lists\nCurrent range is [heap minimum, current maximum] — update best if smaller\nPop the min and push the next element from the same list; stop when a list runs out`,
    testCases: [
      { input: "3\n4 10 15 24 26\n0 9 12 20\n5 18 22 30", expectedOutput: "20 24", displayInput: "nums = [[4,10,15,24,26],[0,9,12,20],[5,18,22,30]]", displayOutput: "[20,24]", visibility: "PUBLIC" },
      { input: "3\n1 2 3\n1 2 3\n1 2 3", expectedOutput: "1 1", displayInput: "nums = [[1,2,3],[1,2,3],[1,2,3]]", displayOutput: "[1,1]", visibility: "PUBLIC" },
      { input: "1\n1 2 3", expectedOutput: "1 1", visibility: "PRIVATE" },
      { input: "2\n1 5\n2 4", expectedOutput: "1 2", visibility: "PRIVATE" },
      { input: "3\n1 3\n5 7\n9 11", expectedOutput: "3 9", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Patching Array",
    slug: "patching-array",
    difficulty: "hard",
    link: "https://leetcode.com/problems/patching-array/",
    description: `Given a sorted integer array nums and an integer n, add/patch elements to the array such that any number in the range [1, n] can be formed by the sum of some elements in the array.\n\nReturn the minimum number of patches required.`,
    tags: ["Greedy", "Array"],
    companies: ["Google", "Facebook", "Amazon"],
    examples: [
      `Input: nums = [1,3], n = 6\nOutput: 1\nExplanation: After patching with 2, [1,2,3] can sum to any value in [1,6].`,
      `Input: nums = [1,5,10], n = 20\nOutput: 2`,
    ],
    editorial: `Track the maximum number reachable so far (miss = 1 initially).\nIf the next element in nums <= miss, extend coverage to miss + nums[i].\nOtherwise patch by adding miss itself — this doubles the coverage range.\nRepeat until miss > n.\nTime complexity: O(m + log n) where m = len(nums), Space complexity: O(1).`,
    aiHints: `Track the farthest number you can represent — call it reach (start at 0, so you need to cover starting from 1)\nIf nums[i] <= reach + 1, you can extend reach to reach + nums[i]\nOtherwise patch with reach + 1 — this is the greedy optimal patch that doubles your coverage`,
    testCases: [
      { input: "6\n1 3", expectedOutput: "1", displayInput: "nums = [1,3], n = 6", displayOutput: "1", visibility: "PUBLIC" },
      { input: "20\n1 5 10", expectedOutput: "2", displayInput: "nums = [1,5,10], n = 20", displayOutput: "2", visibility: "PUBLIC" },
      { input: "20\n1 2 2", expectedOutput: "1", visibility: "PRIVATE" },
      { input: "6\n3", expectedOutput: "2", visibility: "PRIVATE" },
      { input: "2147483647\n1 2 31 33", expectedOutput: "28", visibility: "PRIVATE" },
    ],
  },
];

const SHEET_CONFIG = {
  title: "Greedy Problems",
  description:
    "A curated collection of greedy algorithm problems for interview prep — covering interval scheduling, two-pointer greedy, monotonic stacks, heap-based greedy, and classic greedy proofs across easy, medium, and hard difficulties. Frequently asked at FAANG companies.",
  sections: [
    {
      title: "Easy Problems",
      description:
        "Foundational greedy problems — cookie assignment, stock profits, Kadane's algorithm, jump game, and simple two-pointer greedy strategies.",
      difficulty: "easy" as const,
    },
    {
      title: "Medium Problems",
      description:
        "Intermediate greedy challenges including interval scheduling, heap-based room allocation, task cooling, partition labeling, and two-pointer pairing.",
      difficulty: "medium" as const,
    },
    {
      title: "Hard Problems",
      description:
        "Advanced greedy problems combining monotonic stacks, dual-heap strategies, two-pass array techniques, and coverage-extension greedy proofs.",
      difficulty: "hard" as const,
    },
  ],
};
// ─────────────────────────────────────────────────────────────────
// SHEET CONFIGURATION - Customize this to create your desired sheet
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Starting seed process...\n");

  try {
    // ==============================
    // STEP 1: Create Problems
    // ==============================
    console.log("📝 Creating problems...");

    const easyProblems = [];
    const mediumProblems = [];
    const hardProblems = [];

    console.log(`\n  Creating ${EASY_PROBLEMS.length} easy problems...`);
    for (const problem of EASY_PROBLEMS) {
      const { testCases, ...problemData } = problem;
      const created = await createOrFetchProblem(problemData, testCases);
      easyProblems.push(created);
    }

    console.log(`\n  Creating ${MEDIUM_PROBLEMS.length} medium problems...`);
    for (const problem of MEDIUM_PROBLEMS) {
      const { testCases, ...problemData } = problem;
      const created = await createOrFetchProblem(problemData, testCases);
      mediumProblems.push(created);
    }

    console.log(`\n  Creating ${HARD_PROBLEMS.length} hard problems...`);
    for (const problem of HARD_PROBLEMS) {
      const { testCases, ...problemData } = problem;
      const created = await createOrFetchProblem(problemData, testCases);
      hardProblems.push(created);
    }

    const allProblems = [...easyProblems, ...mediumProblems, ...hardProblems];
    console.log(
      `\n✅ Created ${allProblems.length} problems total (${easyProblems.length} easy, ${mediumProblems.length} medium, ${hardProblems.length} hard)\n`,
    );

    // ==============================
    // STEP 2: Create Sheet
    // ==============================
    console.log("📋 Creating sheet...");

    const sheet = await createOrFetchSheet({
      title: SHEET_CONFIG.title,
      description: SHEET_CONFIG.description,
    });

    console.log(`\n✅ Created/fetched sheet: ${sheet.title}\n`);

    // ==============================
    // STEP 3: Create Sections & Link Problems
    // ==============================
    console.log("🗂️  Creating sections and linking problems...\n");
    console.log(`📁 Sheet: ${sheet.title}`);

    // Map difficulty to problems
    const problemsByDifficulty = {
      easy: easyProblems,
      medium: mediumProblems,
      hard: hardProblems,
    };

    let totalSections = 0;
    let totalLinked = 0;

    for (const sectionConfig of SHEET_CONFIG.sections) {
      const section = await createOrFetchSection(sheet.slug, {
        title: sectionConfig.title,
        description: sectionConfig.description,
      });
      totalSections++;

      const problemsToLink = problemsByDifficulty[sectionConfig.difficulty];
      for (const problem of problemsToLink) {
        await linkProblemToSection(sheet.slug, section.id, problem);
        totalLinked++;
      }
    }

    console.log("\n✅ Successfully created all sections and linked problems\n");

    // ==============================
    // Summary
    // ==============================
    console.log("═══════════════════════════════════════════════════");
    console.log("🎉 SEED COMPLETED SUCCESSFULLY!");
    console.log("═══════════════════════════════════════════════════");
    console.log(`\n📊 Summary:`);
    console.log(`   Problems: ${allProblems.length} total`);
    console.log(`     - Easy: ${easyProblems.length}`);
    console.log(`     - Medium: ${mediumProblems.length}`);
    console.log(`     - Hard: ${hardProblems.length}`);
    console.log(`\n   Test Cases: Added for all problems`);
    console.log(`     - Public (sample) and Private (hidden) test cases`);
    console.log(`\n   Sheet: ${SHEET_CONFIG.title}`);
    console.log(`   Sections: ${totalSections}`);
    console.log(`   Problem Links: ${totalLinked}`);
    console.log("\n═══════════════════════════════════════════════════\n");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    console.error(error);
    process.exit(1);
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("✨ Seed process completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seed process failed:", error);
    process.exit(1);
  });
