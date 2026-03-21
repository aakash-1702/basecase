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
      console.log(`  ⚠️ Request failed, retrying in ${RETRY_DELAY_MS}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
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

const EASY_PROBLEMS = [
  {
    title: "Best Time to Buy and Sell Stock",
    difficulty: "easy",
    link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    description: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.`,
    tags: ["Array", "Sliding Window"],
    companies: ["Amazon", "Microsoft", "Goldman Sachs", "Bloomberg"],
    examples: [
      `Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.`,
      `Input: prices = [7,6,4,3,1]
Output: 0
Explanation: In this case, no transactions are done and the max profit = 0.`,
    ],
    editorial: `Sliding window with two pointers (buy and sell)
Place left pointer at buy day and right pointer at sell day
If prices[right] > prices[left], calculate profit and update maximum
If prices[right] <= prices[left], move left to right (found a cheaper buy day)
Advance right pointer every iteration
Time complexity: O(n), Space complexity: O(1)`,
    aiHints: `Use two pointers: one for the buy day and one for the sell day
When should you move the buy pointer forward?
You want to minimize the buy price and maximize the sell price`,
    testCases: [
      {
        input: "[7,1,5,3,6,4]",
        expectedOutput: "5",
        displayInput: "prices = [7,1,5,3,6,4]",
        displayOutput: "5",
        visibility: "PUBLIC",
      },
      {
        input: "[7,6,4,3,1]",
        expectedOutput: "0",
        displayInput: "prices = [7,6,4,3,1]",
        displayOutput: "0",
        visibility: "PUBLIC",
      },
      {
        input: "[2,4,1,7]",
        expectedOutput: "6",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Valid Palindrome",
    difficulty: "easy",
    link: "https://leetcode.com/problems/valid-palindrome/",
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string s, return true if it is a palindrome, or false otherwise.`,
    tags: ["Two Pointers", "String"],
    companies: ["Meta", "Amazon", "Microsoft"],
    examples: [
      `Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.`,
      `Input: s = "race a car"
Output: false
Explanation: "raceacar" is not a palindrome.`,
      `Input: s = " "
Output: true
Explanation: s is an empty string "" after removing non-alphanumeric characters. Since an empty string reads the same forward and backward, it is a palindrome.`,
    ],
    editorial: `Two pointers from both ends converging inward
Place left pointer at start and right pointer at end
Skip non-alphanumeric characters on both sides
Compare characters (case-insensitive) at both pointers
If mismatch found return false; otherwise move both pointers inward
Time complexity: O(n), Space complexity: O(1)`,
    aiHints: `Use two pointers starting from each end of the string
How do you skip non-alphanumeric characters?
What does case-insensitive comparison mean for your implementation?`,
    testCases: [
      {
        input: "A man, a plan, a canal: Panama",
        expectedOutput: "true",
        displayInput: 's = "A man, a plan, a canal: Panama"',
        displayOutput: "true",
        visibility: "PUBLIC",
      },
      {
        input: "race a car",
        expectedOutput: "false",
        displayInput: 's = "race a car"',
        displayOutput: "false",
        visibility: "PUBLIC",
      },
      {
        input: " ",
        expectedOutput: "true",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Squares of a Sorted Array",
    difficulty: "easy",
    link: "https://leetcode.com/problems/squares-of-a-sorted-array/",
    description: `Given an integer array nums sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.`,
    tags: ["Array", "Two Pointers", "Sorting"],
    companies: ["Amazon", "Google", "Apple"],
    examples: [
      `Input: nums = [-4,-1,0,3,10]
Output: [0,1,9,16,100]
Explanation: After squaring, the array becomes [16,1,0,9,100]. After sorting, it becomes [0,1,9,16,100].`,
      `Input: nums = [-7,-3,2,3,11]
Output: [4,9,9,49,121]`,
    ],
    editorial: `Two pointers from both ends, filling result from the back
The largest square is always at one of the two ends (most negative or most positive)
Compare absolute values at left and right pointers
Place the larger square at the current back position of the result array
Move the corresponding pointer inward
Time complexity: O(n), Space complexity: O(n)`,
    aiHints: `The largest squared values are at the extremes of the sorted array
Use two pointers: one at the start (most negative) and one at the end (most positive)
Fill the result array from the back to the front`,
    testCases: [
      {
        input: "[-4,-1,0,3,10]",
        expectedOutput: "[0,1,9,16,100]",
        displayInput: "nums = [-4,-1,0,3,10]",
        displayOutput: "[0,1,9,16,100]",
        visibility: "PUBLIC",
      },
      {
        input: "[-7,-3,2,3,11]",
        expectedOutput: "[4,9,9,49,121]",
        displayInput: "nums = [-7,-3,2,3,11]",
        displayOutput: "[4,9,9,49,121]",
        visibility: "PUBLIC",
      },
      {
        input: "[-1]",
        expectedOutput: "[1]",
        visibility: "PRIVATE",
      },
    ],
  },
  
  {
    title: "Remove Duplicates from Sorted Array",
    difficulty: "easy",
    link: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
    description: `Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same. Then return the number of unique elements in nums.

Consider the number of unique elements of nums to be k. To get accepted, you need to do the following things:
- Change the array nums such that the first k elements of nums contain the unique elements in the order they were present in nums initially.
- Return k.`,
    tags: ["Array", "Two Pointers"],
    companies: ["Amazon", "Google", "Microsoft", "Apple"],
    examples: [
      `Input: nums = [1,1,2]
Output: 2, nums = [1,2,_]
Explanation: Your function should return k = 2, with the first two elements of nums being 1 and 2 respectively.`,
      `Input: nums = [0,0,1,1,1,2,2,3,3,4]
Output: 5, nums = [0,1,2,3,4,_,_,_,_,_]`,
    ],
    editorial: `Two pointers: slow writer and fast reader
Slow pointer k tracks the position for the next unique element
Fast pointer i scans through the array
When nums[i] != nums[k-1], a new unique element is found — write it at k and increment k
Return k as the count of unique elements
Time complexity: O(n), Space complexity: O(1)`,
    aiHints: `Use a slow pointer that only advances when a new unique element is found
The fast pointer scans every element
Since the array is sorted, duplicates are always adjacent`,
    testCases: [
      {
        input: "[1,1,2]",
        expectedOutput: "2",
        displayInput: "nums = [1,1,2]",
        displayOutput: "2",
        visibility: "PUBLIC",
      },
      {
        input: "[0,0,1,1,1,2,2,3,3,4]",
        expectedOutput: "5",
        displayInput: "nums = [0,0,1,1,1,2,2,3,3,4]",
        displayOutput: "5",
        visibility: "PUBLIC",
      },
      {
        input: "[1,2,3]",
        expectedOutput: "3",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Move Zeroes",
    difficulty: "easy",
    link: "https://leetcode.com/problems/move-zeroes/",
    description: `Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements.

Note that you must do this in-place without making a copy of the array.`,
    tags: ["Array", "Two Pointers"],
    companies: ["Amazon", "Google", "Microsoft", "Bloomberg"],
    examples: [
      `Input: nums = [0,1,0,3,12]
Output: [1,3,12,0,0]`,
      `Input: nums = [0]
Output: [0]`,
    ],
    editorial: `Two pointers: slow pointer for next non-zero position, fast pointer scanning
Slow pointer k tracks where the next non-zero element should go
Fast pointer i scans through all elements
When nums[i] != 0, write it to nums[k] and increment k
After the loop, fill positions from k to end with zeros
Time complexity: O(n), Space complexity: O(1)`,
    aiHints: `Use a slow pointer to track where to place the next non-zero element
After placing all non-zero elements, what fills the remaining positions?
How do you maintain the relative order of non-zero elements?`,
    testCases: [
      {
        input: "[0,1,0,3,12]",
        expectedOutput: "[1,3,12,0,0]",
        displayInput: "nums = [0,1,0,3,12]",
        displayOutput: "[1,3,12,0,0]",
        visibility: "PUBLIC",
      },
      {
        input: "[0]",
        expectedOutput: "[0]",
        displayInput: "nums = [0]",
        displayOutput: "[0]",
        visibility: "PUBLIC",
      },
      {
        input: "[1,0,0,2,0,3]",
        expectedOutput: "[1,2,3,0,0,0]",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Two Sum II - Input Array Is Sorted",
    difficulty: "easy",
    link: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
    description: `Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number. Let these two numbers be numbers[index1] and numbers[index2] where 1 <= index1 < index2 <= numbers.length.

Return the indices of the two numbers, index1 and index2, added by one as an integer array [index1, index2] of length 2.

You may not use the same element twice. There is exactly one solution. You must use only constant extra space.`,
    tags: ["Array", "Two Pointers", "Binary Search"],
    companies: ["Amazon", "Google", "Microsoft"],
    examples: [
      `Input: numbers = [2,7,11,15], target = 9
Output: [1,2]
Explanation: The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2. We return [1, 2].`,
      `Input: numbers = [2,3,4], target = 6
Output: [1,3]`,
      `Input: numbers = [-1,0], target = -1
Output: [1,2]`,
    ],
    editorial: `Classic two-pointer on a sorted array
Left pointer starts at index 0, right pointer starts at the last index
If sum equals target, return the 1-indexed positions
If sum < target, increment left pointer (need a larger value)
If sum > target, decrement right pointer (need a smaller value)
Time complexity: O(n), Space complexity: O(1)`,
    aiHints: `The array is sorted — how does that help narrow your search?
If the current sum is too small, which pointer should you move?
If the current sum is too large, which pointer should you move?`,
    testCases: [
      {
        input: "[2,7,11,15]\n9",
        expectedOutput: "[1,2]",
        displayInput: "numbers = [2,7,11,15], target = 9",
        displayOutput: "[1,2]",
        visibility: "PUBLIC",
      },
      {
        input: "[2,3,4]\n6",
        expectedOutput: "[1,3]",
        displayInput: "numbers = [2,3,4], target = 6",
        displayOutput: "[1,3]",
        visibility: "PUBLIC",
      },
      {
        input: "[-1,0]\n-1",
        expectedOutput: "[1,2]",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Contains Duplicate II",
    difficulty: "easy",
    link: "https://leetcode.com/problems/contains-duplicate-ii/",
    description: `Given an integer array nums and an integer k, return true if there are two distinct indices i and j in the array such that nums[i] == nums[j] and abs(i - j) <= k.`,
    tags: ["Array", "Hash Table", "Sliding Window"],
    companies: ["Amazon", "Palantir", "Google"],
    examples: [
      `Input: nums = [1,2,3,1], k = 3
Output: true`,
      `Input: nums = [1,0,1,1], k = 1
Output: true`,
      `Input: nums = [1,2,3,1,2,3], k = 2
Output: false`,
    ],
    editorial: `Sliding window of size k using a hash set
Maintain a set of at most k elements (the current window)
For each new element, check if it already exists in the set
If yes, return true (duplicate within distance k found)
If no, add it to the set; if set size exceeds k, remove the oldest element
Time complexity: O(n), Space complexity: O(k)`,
    aiHints: `Maintain a sliding window of the last k elements
A hash set gives O(1) lookup for duplicates within the window
When the window grows beyond size k, which element do you remove?`,
    testCases: [
      {
        input: "[1,2,3,1]\n3",
        expectedOutput: "true",
        displayInput: "nums = [1,2,3,1], k = 3",
        displayOutput: "true",
        visibility: "PUBLIC",
      },
      {
        input: "[1,0,1,1]\n1",
        expectedOutput: "true",
        displayInput: "nums = [1,0,1,1], k = 1",
        displayOutput: "true",
        visibility: "PUBLIC",
      },
      {
        input: "[1,2,3,1,2,3]\n2",
        expectedOutput: "false",
        visibility: "PRIVATE",
      },
    ],
  },
];

const MEDIUM_PROBLEMS = [
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "medium",
    link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    description: `Given a string s, find the length of the longest substring without repeating characters.`,
    tags: ["Hash Table", "String", "Sliding Window"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Bloomberg"],
    examples: [
      `Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.`,
      `Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.`,
      `Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.`,
    ],
    editorial: `Sliding window with a hash map storing last seen index of each character
Maintain left pointer as the start of the current valid window
For each character at right pointer, if it was seen and its last index >= left, move left past it
Update the last seen index of the current character
Track the maximum window size
Time complexity: O(n), Space complexity: O(min(n, m)) where m is the charset size`,
    aiHints: `Maintain a window that contains only unique characters
When you find a duplicate, where should the left pointer jump to?
A hash map storing the last seen index is more efficient than a set`,
    testCases: [
      {
        input: "abcabcbb",
        expectedOutput: "3",
        displayInput: 's = "abcabcbb"',
        displayOutput: "3",
        visibility: "PUBLIC",
      },
      {
        input: "bbbbb",
        expectedOutput: "1",
        displayInput: 's = "bbbbb"',
        displayOutput: "1",
        visibility: "PUBLIC",
      },
      {
        input: "pwwkew",
        expectedOutput: "3",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "3Sum",
    difficulty: "medium",
    link: "https://leetcode.com/problems/3sum/",
    description: `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.

Notice that the solution set must not contain duplicate triplets.`,
    tags: ["Array", "Two Pointers", "Sorting"],
    companies: ["Amazon", "Microsoft", "Apple", "Adobe", "Google"],
    examples: [
      `Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]`,
      `Input: nums = [0,1,1]
Output: []`,
      `Input: nums = [0,0,0]
Output: [[0,0,0]]`,
    ],
    editorial: `Sort the array then use two pointers for each fixed element
Fix the first element with an outer loop (skip duplicates)
Use left and right pointers to find pairs summing to -nums[i]
If sum < 0, move left pointer right; if sum > 0, move right pointer left
Skip duplicate values at both pointers after finding a valid triplet
Time complexity: O(n²), Space complexity: O(1) excluding output`,
    aiHints: `Sorting allows you to use two pointers and skip duplicates efficiently
Fix one element and reduce the problem to two sum on the remaining array
How do you ensure no duplicate triplets are included in the result?`,
    testCases: [
      {
        input: "[-1,0,1,2,-1,-4]",
        expectedOutput: "[[-1,-1,2],[-1,0,1]]",
        displayInput: "nums = [-1,0,1,2,-1,-4]",
        displayOutput: "[[-1,-1,2],[-1,0,1]]",
        visibility: "PUBLIC",
      },
      {
        input: "[0,1,1]",
        expectedOutput: "[]",
        displayInput: "nums = [0,1,1]",
        displayOutput: "[]",
        visibility: "PUBLIC",
      },
      {
        input: "[0,0,0]",
        expectedOutput: "[[0,0,0]]",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Container With Most Water",
    difficulty: "medium",
    link: "https://leetcode.com/problems/container-with-most-water/",
    description: `You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.`,
    tags: ["Array", "Two Pointers", "Greedy"],
    companies: ["Amazon", "Google", "Meta", "Bloomberg"],
    examples: [
      `Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49
Explanation: The vertical lines are at positions with heights 8 and 7. Area = min(8,7) * 8 = 49.`,
      `Input: height = [1,1]
Output: 1`,
    ],
    editorial: `Two pointers from both ends moving inward greedily
Start with the widest possible container (pointers at each end)
Area = min(height[left], height[right]) * (right - left)
Move the pointer pointing to the shorter line inward
This greedy choice is optimal: moving the taller line can only decrease or maintain area
Track the maximum area throughout
Time complexity: O(n), Space complexity: O(1)`,
    aiHints: `Start with the widest container and try to find a taller one
Moving the shorter line inward is the only way to possibly increase the area
Why is it always safe to discard the shorter line?`,
    testCases: [
      {
        input: "[1,8,6,2,5,4,8,3,7]",
        expectedOutput: "49",
        displayInput: "height = [1,8,6,2,5,4,8,3,7]",
        displayOutput: "49",
        visibility: "PUBLIC",
      },
      {
        input: "[1,1]",
        expectedOutput: "1",
        displayInput: "height = [1,1]",
        displayOutput: "1",
        visibility: "PUBLIC",
      },
      {
        input: "[4,3,2,1,4]",
        expectedOutput: "16",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Fruit Into Baskets",
    difficulty: "medium",
    link: "https://leetcode.com/problems/fruit-into-baskets/",
    description: `You are visiting a farm that has a single row of fruit trees arranged from left to right. The trees are represented by an integer array fruits where fruits[i] is the type of fruit the ith tree produces.

You want to collect as much fruit as possible. However, the owner has some strict rules that you must follow:
- You only have two baskets, and each basket can hold only one type of fruit. There is no limit on the amount of fruit each basket can hold.
- Starting from any tree of your choice, you must pick exactly one fruit from every tree (including the start tree) while moving to the right. The picked fruits must fit in one of your baskets.
- Once you reach a tree with fruit that cannot fit in your baskets, you must stop.

Given the integer array fruits, return the maximum number of fruits you can pick.`,
    tags: ["Array", "Hash Table", "Sliding Window"],
    companies: ["Amazon", "Google"],
    examples: [
      `Input: fruits = [1,2,1]
Output: 3
Explanation: We can pick from all 3 trees.`,
      `Input: fruits = [0,1,2,2]
Output: 3
Explanation: We can pick from trees [1,2,2]. If we had started at the first tree, we would only pick from trees [0,1].`,
      `Input: fruits = [1,2,3,2,2]
Output: 4
Explanation: We can pick from trees [2,3,2,2].`,
    ],
    editorial: `Sliding window with at most 2 distinct values (longest subarray with at most 2 distinct)
Use a hash map to count fruit type frequencies in the current window
Expand right pointer and add fruit to window
When more than 2 distinct types in window, shrink from left until only 2 remain
Track the maximum window size throughout
Time complexity: O(n), Space complexity: O(1) — at most 3 entries in map`,
    aiHints: `This is equivalent to finding the longest subarray with at most 2 distinct elements
Use a sliding window and a frequency map to track types in the window
When should you shrink the left side of the window?`,
    testCases: [
      {
        input: "[1,2,1]",
        expectedOutput: "3",
        displayInput: "fruits = [1,2,1]",
        displayOutput: "3",
        visibility: "PUBLIC",
      },
      {
        input: "[0,1,2,2]",
        expectedOutput: "3",
        displayInput: "fruits = [0,1,2,2]",
        displayOutput: "3",
        visibility: "PUBLIC",
      },
      {
        input: "[1,2,3,2,2]",
        expectedOutput: "4",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Permutation in String",
    difficulty: "medium",
    link: "https://leetcode.com/problems/permutation-in-string/",
    description: `Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise.

In other words, return true if one of s1's permutations is a substring of s2.`,
    tags: ["Hash Table", "Two Pointers", "String", "Sliding Window"],
    companies: ["Amazon", "Google", "Microsoft", "Bloomberg"],
    examples: [
      `Input: s1 = "ab", s2 = "eidbaooo"
Output: true
Explanation: s2 contains one permutation of s1 ("ba").`,
      `Input: s1 = "ab", s2 = "eidboaoo"
Output: false`,
    ],
    editorial: `Fixed-size sliding window of length s1, comparing character frequencies
Build a frequency map for s1 and a frequency map for the current window in s2
Slide a window of size s1.length across s2
At each step, add the new right character and remove the leftmost character
Compare the two frequency maps; if equal, a permutation exists
Optimize by tracking a match counter instead of comparing full maps
Time complexity: O(n), Space complexity: O(1) — fixed 26-character alphabet`,
    aiHints: `A permutation has the same character frequencies as the original
Use a fixed-size window equal to the length of s1
Instead of comparing the full maps, track how many characters have matching counts`,
    testCases: [
      {
        input: "ab\neidbaooo",
        expectedOutput: "true",
        displayInput: 's1 = "ab", s2 = "eidbaooo"',
        displayOutput: "true",
        visibility: "PUBLIC",
      },
      {
        input: "ab\neidboaoo",
        expectedOutput: "false",
        displayInput: 's1 = "ab", s2 = "eidboaoo"',
        displayOutput: "false",
        visibility: "PUBLIC",
      },
      {
        input: "adc\ndcda",
        expectedOutput: "true",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Subarray Sum Equals K",
    difficulty: "medium",
    link: "https://leetcode.com/problems/subarray-sum-equals-k/",
    description: `Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    tags: ["Array", "Hash Table", "Prefix Sum"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Goldman Sachs"],
    examples: [
      `Input: nums = [1,1,1], k = 2
Output: 2`,
      `Input: nums = [1,2,3], k = 3
Output: 2`,
    ],
    editorial: `Prefix sum with hash map — sliding window doesn't work due to negative numbers
Maintain a running prefix sum and a map from prefix sum to its frequency
For each position, check if (prefixSum - k) exists in the map
If yes, add its frequency to the answer (all subarrays from that earlier point to current sum to k)
Initialize map with {0: 1} to handle subarrays starting from index 0
Time complexity: O(n), Space complexity: O(n)`,
    aiHints: `A subarray sum equals k if prefixSum[j] - prefixSum[i] == k
Rearrange to: prefixSum[i] == prefixSum[j] - k
Use a hash map to count how many times each prefix sum has been seen`,
    testCases: [
      {
        input: "[1,1,1]\n2",
        expectedOutput: "2",
        displayInput: "nums = [1,1,1], k = 2",
        displayOutput: "2",
        visibility: "PUBLIC",
      },
      {
        input: "[1,2,3]\n3",
        expectedOutput: "2",
        displayInput: "nums = [1,2,3], k = 3",
        displayOutput: "2",
        visibility: "PUBLIC",
      },
      {
        input: "[-1,-1,1]\n0",
        expectedOutput: "1",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Maximum Average Subarray I",
    difficulty: "medium",
    link: "https://leetcode.com/problems/maximum-average-subarray-i/",
    description: `You are given an integer array nums consisting of n elements, and an integer k.

Find a contiguous subarray whose length is equal to k that has the maximum average value and return this value. Any answer with a calculation error less than 10-5 will be accepted.`,
    tags: ["Array", "Sliding Window"],
    companies: ["Amazon", "Google"],
    examples: [
      `Input: nums = [1,12,-5,-6,50,3], k = 4
Output: 12.75000
Explanation: Maximum average is (12 - 5 - 6 + 50) / 4 = 51 / 4 = 12.75`,
      `Input: nums = [5], k = 1
Output: 5.00000`,
    ],
    editorial: `Fixed-size sliding window of length k
Compute the sum of the first k elements as the initial window
Slide right: subtract the element leaving the window on the left, add the element entering on the right
Track the maximum window sum seen throughout
Return maxSum / k as the result
Time complexity: O(n), Space complexity: O(1)`,
    aiHints: `Compute the first window sum, then slide it across the array
When sliding, remove the leftmost element and add the new rightmost element
You only need to track the sum, not every element in the window`,
    testCases: [
      {
        input: "[1,12,-5,-6,50,3]\n4",
        expectedOutput: "12.75000",
        displayInput: "nums = [1,12,-5,-6,50,3], k = 4",
        displayOutput: "12.75000",
        visibility: "PUBLIC",
      },
      {
        input: "[5]\n1",
        expectedOutput: "5.00000",
        displayInput: "nums = [5], k = 1",
        displayOutput: "5.00000",
        visibility: "PUBLIC",
      },
      {
        input: "[0,4,0,3,2]\n1",
        expectedOutput: "4.00000",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "4Sum",
    difficulty: "medium",
    link: "https://leetcode.com/problems/4sum/",
    description: `Given an array nums of n integers, return an array of all the unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that:
- 0 <= a, b, c, d < n
- a, b, c, and d are distinct
- nums[a] + nums[b] + nums[c] + nums[d] == target

You may return the answer in any order.`,
    tags: ["Array", "Two Pointers", "Sorting"],
    companies: ["Amazon", "Google", "Microsoft"],
    examples: [
      `Input: nums = [1,0,-1,0,-2,2], target = 0
Output: [[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]`,
      `Input: nums = [2,2,2,2,2], target = 8
Output: [[2,2,2,2]]`,
    ],
    editorial: `Extend 3Sum with an additional outer loop
Sort the array first
Two nested loops fix the first two elements (skip duplicates)
Two pointers find the remaining two elements summing to (target - nums[i] - nums[j])
Skip duplicates at all four pointer positions to avoid duplicate quadruplets
Time complexity: O(n³), Space complexity: O(1) excluding output`,
    aiHints: `This extends 3Sum by adding one more outer loop
Fix two elements with nested loops and use two pointers for the remaining pair
How do you generalize the duplicate-skipping logic from 3Sum?`,
    testCases: [
      {
        input: "[1,0,-1,0,-2,2]\n0",
        expectedOutput: "[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]",
        displayInput: "nums = [1,0,-1,0,-2,2], target = 0",
        displayOutput: "[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]",
        visibility: "PUBLIC",
      },
      {
        input: "[2,2,2,2,2]\n8",
        expectedOutput: "[[2,2,2,2]]",
        displayInput: "nums = [2,2,2,2,2], target = 8",
        displayOutput: "[[2,2,2,2]]",
        visibility: "PUBLIC",
      },
      {
        input: "[0,0,0,0]\n0",
        expectedOutput: "[[0,0,0,0]]",
        visibility: "PRIVATE",
      },
    ],
  },
];

const HARD_PROBLEMS = [
  {
    title: "Minimum Window Substring",
    difficulty: "hard",
    link: "https://leetcode.com/problems/minimum-window-substring/",
    description: `Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string "".

The testcases will be generated such that the answer is unique.`,
    tags: ["Hash Table", "String", "Sliding Window"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Uber"],
    examples: [
      `Input: s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
Explanation: The minimum window substring "BANC" includes 'A', 'B', and 'C' from string t.`,
      `Input: s = "a", t = "a"
Output: "a"`,
      `Input: s = "a", t = "aa"
Output: ""
Explanation: Both 'a's from t must be included in the window. Since the largest window of s only has one 'a', return "".`,
    ],
    editorial: `Variable-size sliding window with two frequency maps
Build a need map from t's character frequencies
Expand the right pointer and add characters to the window map
Track a formed counter for how many unique characters are fully satisfied
When all characters are satisfied, try shrinking the left pointer
Update the minimum window whenever a valid window is found
Time complexity: O(m + n), Space complexity: O(m + n)`,
    aiHints: `Expand right until all required characters are covered
Then shrink left as much as possible while keeping the window valid
A formed counter avoids comparing the full frequency maps every step`,
    testCases: [
      {
        input: "ADOBECODEBANC\nABC",
        expectedOutput: "BANC",
        displayInput: 's = "ADOBECODEBANC", t = "ABC"',
        displayOutput: "BANC",
        visibility: "PUBLIC",
      },
      {
        input: "a\na",
        expectedOutput: "a",
        displayInput: 's = "a", t = "a"',
        displayOutput: "a",
        visibility: "PUBLIC",
      },
      {
        input: "a\naa",
        expectedOutput: "",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Sliding Window Maximum",
    difficulty: "hard",
    link: "https://leetcode.com/problems/sliding-window-maximum/",
    description: `You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position.

Return the max sliding window.`,
    tags: ["Array", "Queue", "Sliding Window", "Heap", "Monotonic Queue"],
    companies: ["Amazon", "Google", "Meta", "Microsoft"],
    examples: [
      `Input: nums = [1,3,-1,-3,5,3,6,7], k = 3
Output: [3,3,5,5,6,7]
Explanation:
Window position                Max
---------------               -----
[1  3  -1] -3  5  3  6  7       3
 1 [3  -1  -3] 5  3  6  7       3
 1  3 [-1  -3  5] 3  6  7       5
 1  3  -1 [-3  5  3] 6  7       5
 1  3  -1  -3 [5  3  6] 7       6
 1  3  -1  -3  5 [3  6  7]      7`,
      `Input: nums = [1], k = 1
Output: [1]`,
    ],
    editorial: `Monotonic deque maintaining indices of useful elements
Maintain a deque of indices in decreasing order of their values
For each new element, remove from back of deque all indices with smaller values (they can never be the max)
Remove from front of deque indices that have fallen outside the window
The front of the deque is always the index of the current window maximum
Time complexity: O(n), Space complexity: O(k)`,
    aiHints: `A monotonic deque efficiently tracks the maximum of the current window
Elements smaller than the new element can never be future maximums — remove them
How do you know when an element in the deque has left the window?`,
    testCases: [
      {
        input: "[1,3,-1,-3,5,3,6,7]\n3",
        expectedOutput: "[3,3,5,5,6,7]",
        displayInput: "nums = [1,3,-1,-3,5,3,6,7], k = 3",
        displayOutput: "[3,3,5,5,6,7]",
        visibility: "PUBLIC",
      },
      {
        input: "[1]\n1",
        expectedOutput: "[1]",
        displayInput: "nums = [1], k = 1",
        displayOutput: "[1]",
        visibility: "PUBLIC",
      },
      {
        input: "[9,11]\n2",
        expectedOutput: "[11]",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Trapping Rain Water",
    difficulty: "hard",
    link: "https://leetcode.com/problems/trapping-rain-water/",
    description: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`,
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack", "Monotonic Stack"],
    companies: ["Amazon", "Google", "Meta", "Apple", "Microsoft"],
    examples: [
      `Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The above elevation map traps 6 units of rain water.`,
      `Input: height = [4,2,0,3,2,5]
Output: 9`,
    ],
    editorial: `Two pointers from both ends, tracking left and right max heights
Maintain leftMax and rightMax as the tallest bar seen from each side
If leftMax < rightMax, process the left pointer: water at left = leftMax - height[left]
Otherwise process the right pointer: water at right = rightMax - height[right]
Move the processed pointer inward
Water at a position = min(leftMax, rightMax) - height[i]
Time complexity: O(n), Space complexity: O(1)`,
    aiHints: `Water trapped at any position depends on the shorter of the two surrounding walls
Two pointers let you process from both ends simultaneously
The side with the smaller max height determines how much water is trapped there`,
    testCases: [
      {
        input: "[0,1,0,2,1,0,1,3,2,1,2,1]",
        expectedOutput: "6",
        displayInput: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        displayOutput: "6",
        visibility: "PUBLIC",
      },
      {
        input: "[4,2,0,3,2,5]",
        expectedOutput: "9",
        displayInput: "height = [4,2,0,3,2,5]",
        displayOutput: "9",
        visibility: "PUBLIC",
      },
      {
        input: "[4,2,3]",
        expectedOutput: "1",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Minimum Number of K Consecutive Bit Flips",
    difficulty: "hard",
    link: "https://leetcode.com/problems/minimum-number-of-k-consecutive-bit-flips/",
    description: `You are given a binary array nums and an integer k.

A k-bit flip is choosing a subarray of length k from nums and simultaneously changing every 0 in the subarray to 1, and every 1 in the subarray to 0.

Return the minimum number of k-bit flips required so that there are no 0's in the array. If it is not possible, return -1.`,
    tags: ["Array", "Bit Manipulation", "Queue", "Sliding Window", "Prefix Sum"],
    companies: ["Google", "Amazon"],
    examples: [
      `Input: nums = [0,1,0], k = 1
Output: 2
Explanation: Flip nums[0], then flip nums[2].`,
      `Input: nums = [1,1,0], k = 2
Output: -1
Explanation: No matter how we flip subarrays of size 2, we can't make the array become [1,1,1].`,
      `Input: nums = [0,0,0,1,0,1,1,0], k = 3
Output: 3`,
    ],
    editorial: `Sliding window to track cumulative flips without re-flipping
Use a difference array or a queue to track active flips at each index
flipped[i] = 1 means a flip starting at i is still active
The current effective bit at index i = (nums[i] + sum of active flips) % 2
If effective bit is 0, we must flip starting at i — check if i + k <= n, otherwise return -1
Maintain a running flip count using a sliding window of size k
Time complexity: O(n), Space complexity: O(n)`,
    aiHints: `Greedily flip at the leftmost 0 you encounter
Repeatedly re-flipping is expensive — track the effect of past flips using a difference array
The total number of flips affecting position i can be tracked with a prefix sum`,
    testCases: [
      {
        input: "[0,1,0]\n1",
        expectedOutput: "2",
        displayInput: "nums = [0,1,0], k = 1",
        displayOutput: "2",
        visibility: "PUBLIC",
      },
      {
        input: "[1,1,0]\n2",
        expectedOutput: "-1",
        displayInput: "nums = [1,1,0], k = 2",
        displayOutput: "-1",
        visibility: "PUBLIC",
      },
      {
        input: "[0,0,0,1,0,1,1,0]\n3",
        expectedOutput: "3",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Longest Repeating Character Replacement",
    difficulty: "hard",
    link: "https://leetcode.com/problems/longest-repeating-character-replacement/",
    description: `You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times.

Return the length of the longest substring containing the same letter you can get after performing the above operations.`,
    tags: ["Hash Table", "String", "Sliding Window"],
    companies: ["Amazon", "Google", "Meta", "Bloomberg"],
    examples: [
      `Input: s = "ABAB", k = 2
Output: 4
Explanation: Replace the two 'A's with two 'B's or vice versa.`,
      `Input: s = "AABABBA", k = 1
Output: 4
Explanation: Replace the one 'A' in the middle with 'B' and form "AABBBBA". The substring "BBBB" has the longest repeating letters, which is 4.`,
    ],
    editorial: `Sliding window tracking the most frequent character in the window
Expand the right pointer and update the frequency map
Window is valid if (window size - max frequency) <= k (replacements needed)
If window becomes invalid, shrink from the left (but max frequency never decreases — a key insight)
The window size never shrinks below the best valid size found so far
Time complexity: O(n), Space complexity: O(1) — 26 letters`,
    aiHints: `The number of characters to replace in the window = window size - count of most frequent char
If replacements needed exceed k, the window is invalid — shrink from left
Why does the maximum frequency in the window never need to decrease?`,
    testCases: [
      {
        input: "ABAB\n2",
        expectedOutput: "4",
        displayInput: 's = "ABAB", k = 2',
        displayOutput: "4",
        visibility: "PUBLIC",
      },
      {
        input: "AABABBA\n1",
        expectedOutput: "4",
        displayInput: 's = "AABABBA", k = 1',
        displayOutput: "4",
        visibility: "PUBLIC",
      },
      {
        input: "AAAA\n0",
        expectedOutput: "4",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Subarrays with K Different Integers",
    difficulty: "hard",
    link: "https://leetcode.com/problems/subarrays-with-k-different-integers/",
    description: `Given an integer array nums and an integer k, return the number of good subarrays of nums.

A good array is an array where the number of different integers in that array is exactly k.

For example, [1,2,3,1,2] has 3 different integers: 1, 2, and 3.`,
    tags: ["Array", "Hash Table", "Sliding Window", "Counting"],
    companies: ["Amazon", "Google"],
    examples: [
      `Input: nums = [1,2,1,2,3], k = 2
Output: 7
Explanation: Subarrays formed with exactly 2 different integers: [1,2], [2,1], [1,2], [2,3], [1,2,1], [2,1,2], [1,2,1,2].`,
      `Input: nums = [1,2,1,3,4], k = 3
Output: 3`,
    ],
    editorial: `Exactly k = at most k minus at most (k-1)
atMost(k) counts subarrays with at most k distinct integers using a sliding window
For each right pointer, left shrinks while distinct count exceeds k
Number of valid subarrays ending at right = right - left + 1
Answer = atMost(k) - atMost(k-1)
Time complexity: O(n), Space complexity: O(n)`,
    aiHints: `Exactly k distinct = at most k distinct minus at most (k-1) distinct
Sliding window for "at most k" is straightforward — how does it extend to "exactly k"?
Count valid subarrays ending at each right pointer position`,
    testCases: [
      {
        input: "[1,2,1,2,3]\n2",
        expectedOutput: "7",
        displayInput: "nums = [1,2,1,2,3], k = 2",
        displayOutput: "7",
        visibility: "PUBLIC",
      },
      {
        input: "[1,2,1,3,4]\n3",
        expectedOutput: "3",
        displayInput: "nums = [1,2,1,3,4], k = 3",
        displayOutput: "3",
        visibility: "PUBLIC",
      },
      {
        input: "[1,1,1,1]\n1",
        expectedOutput: "10",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Count of Range Sum",
    difficulty: "hard",
    link: "https://leetcode.com/problems/count-of-range-sum/",
    description: `Given an integer array nums and two integers lower and upper, return the number of range sums that lie in [lower, upper] inclusive.

Range sum S(i, j) is defined as the sum of the elements in nums between indices i and j inclusive, where i <= j.`,
    tags: ["Array", "Binary Search", "Divide and Conquer", "Sorting", "Prefix Sum"],
    companies: ["Google", "Amazon"],
    examples: [
      `Input: nums = [-2,5,-1], lower = -2, upper = 2
Output: 3
Explanation: The three ranges are: [0,0], [2,2], and [0,2] and their respective sums are: -2, -1, 2.`,
      `Input: nums = [0], lower = 0, upper = 0
Output: 1`,
    ],
    editorial: `Prefix sums + merge sort (or sorted list with binary search)
Compute prefix sums array where prefixSum[i] is sum of nums[0..i-1]
Range sum S(i,j) = prefixSum[j+1] - prefixSum[i]
Need to count pairs (i,j) where lower <= prefixSum[j] - prefixSum[i] <= upper
Use merge sort on prefix sums: during merge, count valid pairs across left and right halves
Two pointers find the count of valid right indices for each left index
Time complexity: O(n log n), Space complexity: O(n)`,
    aiHints: `Express range sums using prefix sums: S(i,j) = prefix[j+1] - prefix[i]
You need to count pairs with a specific difference range — think merge sort
During the merge step, sorted halves allow two pointers to count valid pairs efficiently`,
    testCases: [
      {
        input: "[-2,5,-1]\n-2\n2",
        expectedOutput: "3",
        displayInput: "nums = [-2,5,-1], lower = -2, upper = 2",
        displayOutput: "3",
        visibility: "PUBLIC",
      },
      {
        input: "[0]\n0\n0",
        expectedOutput: "1",
        displayInput: "nums = [0], lower = 0, upper = 0",
        displayOutput: "1",
        visibility: "PUBLIC",
      },
      {
        input: "[-2,5,-1,3]\n-2\n4",
        expectedOutput: "6",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Minimum Size Subarray Sum",
    difficulty: "hard",
    link: "https://leetcode.com/problems/minimum-size-subarray-sum/",
    description: `Given an array of positive integers nums and a positive integer target, return the minimal length of a subarray whose sum is greater than or equal to target. If there is no such subarray, return 0 instead.

Follow up: If you have figured out the O(n) solution, try coding another solution of which the time complexity is O(n log(n)).`,
    tags: ["Array", "Binary Search", "Sliding Window", "Prefix Sum"],
    companies: ["Amazon", "Google", "Microsoft", "Facebook"],
    examples: [
      `Input: target = 7, nums = [2,3,1,2,4,3]
Output: 2
Explanation: The subarray [4,3] has the minimal length under the problem constraint.`,
      `Input: target = 4, nums = [1,4,4]
Output: 1`,
      `Input: target = 11, nums = [1,1,1,1,1,1,1,1]
Output: 0`,
    ],
    editorial: `Variable sliding window shrinking when sum meets target
Expand right pointer adding elements to running sum
When sum >= target, record current window length and shrink from left
Continue shrinking left while sum remains >= target, updating minimum length
Track global minimum window length throughout
Time complexity: O(n) for sliding window, O(n log n) for binary search on prefix sums`,
    aiHints: `Expand the window until the sum meets the target
Once met, try to shrink from the left to find the smallest valid window
All numbers are positive — this guarantees the sliding window approach works`,
    testCases: [
      {
        input: "7\n[2,3,1,2,4,3]",
        expectedOutput: "2",
        displayInput: "target = 7, nums = [2,3,1,2,4,3]",
        displayOutput: "2",
        visibility: "PUBLIC",
      },
      {
        input: "4\n[1,4,4]",
        expectedOutput: "1",
        displayInput: "target = 4, nums = [1,4,4]",
        displayOutput: "1",
        visibility: "PUBLIC",
      },
      {
        input: "11\n[1,1,1,1,1,1,1,1]",
        expectedOutput: "0",
        visibility: "PRIVATE",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// SHEET CONFIGURATION
// ─────────────────────────────────────────────────────────────────

const SHEET_CONFIG = {
  title: "Sliding Window & Two Pointer Problems",
  description:
    "A curated collection of sliding window and two pointer problems covering fixed and variable windows, two-pointer on sorted arrays, and advanced techniques like monotonic deques and prefix sums.",
  sections: [
    {
      title: "Easy Problems",
      description: "Foundational two pointer and fixed sliding window problems to build core intuition.",
      difficulty: "easy" as const,
    },
    {
      title: "Medium Problems",
      description: "Intermediate sliding window and two pointer challenges including variable windows, frequency maps, and prefix sums.",
      difficulty: "medium" as const,
    },
    {
      title: "Hard Problems",
      description: "Advanced problems requiring monotonic deques, multi-window tricks, and combined prefix sum techniques.",
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
