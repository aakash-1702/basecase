import axios from "axios";

const BASE_URL = "http://localhost:3000/api/problems";
// Change port if different

const problems = [
  {
    title: "largest divisible subset",
    description:
      "Find the largest subset where every pair of elements is divisible by each other.",
    difficulty: "hard",
    link: "https://leetcode.com/problems/largest-divisible-subset/description/",
    companies: ["Amazon", "Google", "Microsoft", "Meta"],
    tags: ["Dynamic Programming", "LIS"],
  },
  {
    title: "longest string chain",
    description:
      "Find the longest chain of words where each word is formed by adding one character to the previous word.",
    difficulty: "hard",
    link: "https://leetcode.com/problems/longest-string-chain/description/",
    companies: ["Amazon", "Google", "Microsoft", "Meta"],
    tags: ["Dynamic Programming"],
  },
  {
    title: "number of longest increasing subsequence",
    description:
      "Count how many longest increasing subsequences exist in the array.",
    difficulty: "hard",
    link: "https://leetcode.com/problems/number-of-longest-increasing-subsequence/description/",
    companies: ["Amazon", "Google", "Microsoft", "Meta"],
    tags: ["Dynamic Programming", "LIS"],
  },
  {
    title: "minimum cost to cut a stick",
    description:
      "Find the minimum total cost to cut a stick at given positions.",
    difficulty: "hard",
    link: "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/description/",
    companies: ["Amazon", "Google", "Microsoft", "Meta"],
    tags: ["Dynamic Programming", "Partition DP"],
  },
  {
    title: "burst balloons",
    description:
      "Find the maximum coins obtained by bursting balloons in optimal order.",
    difficulty: "hard",
    link: "https://leetcode.com/problems/burst-balloons/description/",
    companies: ["Amazon", "Google", "Microsoft", "Meta"],
    tags: ["Dynamic Programming", "Partition DP"],
  },
  {
    title: "parsing a boolean expression",
    description:
      "Evaluate a boolean expression string using recursive partitioning and DP.",
    difficulty: "hard",
    link: "https://leetcode.com/problems/parsing-a-boolean-expression/description/",
    companies: ["Amazon", "Google", "Microsoft", "Meta"],
    tags: ["Dynamic Programming", "Partition DP"],
  },
  {
    title: "palindrome partitioning ii",
    description:
      "Find the minimum cuts needed to partition a string into palindromic substrings.",
    difficulty: "hard",
    link: "https://leetcode.com/problems/palindrome-partitioning-ii/description/",
    companies: ["Amazon", "Google", "Microsoft", "Meta"],
    tags: ["Dynamic Programming", "Partition DP"],
  },
  {
    title: "partition array for maximum sum",
    description:
      "Partition array into subarrays to maximize the total sum after applying constraints.",
    difficulty: "hard",
    link: "https://leetcode.com/problems/partition-array-for-maximum-sum/description/",
    companies: ["Amazon", "Google", "Microsoft", "Meta"],
    tags: ["Dynamic Programming"],
  },
  {
    title: "maximal rectangle",
    description:
      "Find the largest rectangle containing only ones in a binary matrix.",
    difficulty: "hard",
    link: "https://leetcode.com/problems/maximal-rectangle/description/",
    companies: ["Amazon", "Google", "Microsoft", "Meta"],
    tags: ["Dynamic Programming", "Matrix"],
  },
  {
    title: "count square submatrices with all ones",
    description: "Count all square submatrices that contain only ones.",
    difficulty: "hard",
    link: "https://leetcode.com/problems/count-square-submatrices-with-all-ones/description/",
    companies: ["Amazon", "Google", "Microsoft", "Meta"],
    tags: ["Dynamic Programming", "Matrix"],
  },
];

async function seedProblems() {
  for (const problem of problems) {
    try {
      const res = await axios.post(BASE_URL, problem, {
        headers: {
          "x-seed-key": "seed123",
        },
      });
      console.log(`✅ Inserted: ${res.data.data.title}`);
    } catch (error: any) {
      console.log(`❌ Failed: ${problem.title}`);
      console.log(error.response?.data || error.message);
    }
  }
}

seedProblems().then(() => console.log("Seeding completed!"));
