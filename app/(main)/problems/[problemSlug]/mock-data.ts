import type { Problem, UserProgress, UserAccount } from "./types";

// ═══════════════════════════════════════════════════════════
// MOCK DATA — swap this file for real API hooks later
// Change plan: "free" | "plus" to preview both variants
// ═══════════════════════════════════════════════════════════

export const mockProblem: Problem = {
  slug: "two-sum",
  title: "Two Sum",
  difficulty: "Easy",
  tags: ["Array", "Hash Table"],
  leetcodeUrl: "https://leetcode.com/problems/two-sum/",
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.`,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "nums[0] + nums[1] == 9, so return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "nums[1] + nums[2] == 6, so return [1, 2].",
    },
    { input: "nums = [3,3], target = 6", output: "[0,1]" },
  ],
  constraints: `2 ≤ nums.length ≤ 10⁴\n-10⁹ ≤ nums[i] ≤ 10⁹\n-10⁹ ≤ target ≤ 10⁹\nOnly one valid answer exists.`,
  patterns: ["Hash Map", "Two Pointers"],
  prevSlug: "palindrome-number",
  nextSlug: "add-two-numbers",
  sheetName: "Blind 75",
  acceptanceRate: 49.2,
  frequency: 87,
  xpReward: 50,
};

export const mockUserProgress: UserProgress = {
  solved: false,
  bookmarked: false,
  confidence: null,
  notes: "",
};

export const mockUserAccount: UserAccount = {
  xp: 1340,
  plan: "plus", // ← toggle: "free" | "plus"
  aiCreditsRemaining: 18,
  aiCreditsTotal: 25,
};
