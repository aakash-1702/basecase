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
    title: "Find if Path Exists in Graph",
    slug: "find-if-path-exists-in-graph",
    difficulty: "easy",
    link: "https://leetcode.com/problems/find-if-path-exists-in-graph/",
    description: `There is a bi-directional graph with n vertices, where each vertex is labeled from 0 to n-1. The edges in the graph are represented as a 2D integer array edges, where each edges[i] = [ui, vi] denotes a bi-directional edge between vertex ui and vertex vi.

Given the integer n, the array edges, and two integers source and destination, return true if there is a valid path from source to destination, or false otherwise.`,
    tags: ["Graph", "BFS", "DFS", "Union Find"],
    companies: ["Amazon", "Facebook"],
    examples: [
      `Input: n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2\nOutput: true`,
      `Input: n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5\nOutput: false`,
    ],
    editorial: `Build an adjacency list from the edges array.
Run BFS or DFS from source, marking visited nodes.
If destination is reached at any point, return true.
If traversal completes without reaching destination, return false.
Alternatively use Union-Find: union all edges, then check if source and destination share the same root.
Time complexity: O(n + e), Space complexity: O(n + e).`,
    aiHints: `Build an adjacency list first — store neighbors for each node\nBFS/DFS from source: if you ever reach destination return true\nUnion-Find is also valid: union all edges then check if find(source) == find(destination)`,
    testCases: [
      {
        input: "3 0 2\n0 1\n1 2\n2 0",
        expectedOutput: "true",
        displayInput:
          "n = 3, source = 0, destination = 2, edges = [[0,1],[1,2],[2,0]]",
        displayOutput: "true",
        visibility: "PUBLIC",
      },
      {
        input: "6 0 5\n0 1\n0 2\n3 5\n5 4\n4 3",
        expectedOutput: "false",
        displayInput:
          "n = 6, source = 0, destination = 5, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]]",
        displayOutput: "false",
        visibility: "PUBLIC",
      },
      {
        input: "1 0 0",
        expectedOutput: "true",
        visibility: "PRIVATE",
      },
      {
        input: "4 0 3\n0 1\n1 2\n2 3",
        expectedOutput: "true",
        visibility: "PRIVATE",
      },
      {
        input: "5 0 4\n0 1\n1 2\n3 4",
        expectedOutput: "false",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Number of Islands",
    slug: "number-of-islands",
    difficulty: "easy",
    link: "https://leetcode.com/problems/number-of-islands/",
    description: `Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    tags: ["Graph", "BFS", "DFS", "Union Find"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Bloomberg"],
    examples: [
      `Input: grid = [\n  ["1","1","1","1","0"],\n  ["1","1","0","1","0"],\n  ["1","1","0","0","0"],\n  ["0","0","0","0","0"]\n]\nOutput: 1`,
      `Input: grid = [\n  ["1","1","0","0","0"],\n  ["1","1","0","0","0"],\n  ["0","0","1","0","0"],\n  ["0","0","0","1","1"]\n]\nOutput: 3`,
    ],
    editorial: `Scan each cell. When a '1' is found, increment island count and run DFS/BFS to sink the entire island (mark all connected '1's as '0').
This way each island is counted exactly once.
Four-directional neighbors: up, down, left, right.
Time complexity: O(m*n), Space complexity: O(m*n) recursion stack.`,
    aiHints: `Every time you find an unvisited land cell, you have found a new island\nFrom that cell, DFS/BFS in 4 directions and mark all connected land as visited\nSinking the island (overwriting '1' with '0') avoids needing a separate visited array`,
    testCases: [
      {
        input: "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0",
        expectedOutput: "1",
        displayInput: "4x5 grid — one large island",
        displayOutput: "1",
        visibility: "PUBLIC",
      },
      {
        input: "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1",
        expectedOutput: "3",
        displayInput: "4x5 grid — three islands",
        displayOutput: "3",
        visibility: "PUBLIC",
      },
      {
        input: "1 1\n1",
        expectedOutput: "1",
        visibility: "PRIVATE",
      },
      {
        input: "2 2\n1 0\n0 1",
        expectedOutput: "2",
        visibility: "PRIVATE",
      },
      {
        input: "3 3\n1 1 0\n0 1 0\n0 0 1",
        expectedOutput: "2",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Flood Fill",
    slug: "flood-fill",
    difficulty: "easy",
    link: "https://leetcode.com/problems/flood-fill/",
    description: `You are given an image represented by an m x n integer grid image, where image[i][j] represents the pixel value of the image. You are also given three integers sr, sc, and color.

Perform a flood fill starting from pixel (sr, sc) using the given color. To perform a flood fill, consider the starting pixel, plus any pixels connected 4-directionally to the starting pixel of the same color as the starting pixel, and color them with color (and keep doing this process for each subsequent pixel).

Return the modified image after performing the flood fill.`,
    tags: ["Graph", "DFS", "BFS", "Array"],
    companies: ["Amazon", "Facebook", "Microsoft"],
    examples: [
      `Input: image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2\nOutput: [[2,2,2],[2,2,0],[2,0,1]]`,
      `Input: image = [[0,0,0],[0,0,0]], sr = 0, sc = 0, color = 0\nOutput: [[0,0,0],[0,0,0]]`,
    ],
    editorial: `Record original color at (sr, sc). If it already equals the target color, return image unchanged.
DFS/BFS from (sr, sc): for each cell with the original color, paint it with the new color and recurse on 4 neighbors.
The early-exit check avoids infinite recursion when old == new color.
Time complexity: O(m*n), Space complexity: O(m*n).`,
    aiHints: `Record the original color at the start pixel before modifying anything\nIf old color == new color, return early to avoid infinite recursion\nDFS in 4 directions, only continuing to cells that still have the original color`,
    testCases: [
      {
        input: "3 3 1 1 2\n1 1 1\n1 1 0\n1 0 1",
        expectedOutput: "2 2 2\n2 2 0\n2 0 1",
        displayInput: "image = [[1,1,1],[1,1,0],[1,0,1]], sr=1, sc=1, color=2",
        displayOutput: "[[2,2,2],[2,2,0],[2,0,1]]",
        visibility: "PUBLIC",
      },
      {
        input: "2 3 0 0 0\n0 0 0\n0 0 0",
        expectedOutput: "0 0 0\n0 0 0",
        displayInput: "image = [[0,0,0],[0,0,0]], sr=0, sc=0, color=0",
        displayOutput: "[[0,0,0],[0,0,0]]",
        visibility: "PUBLIC",
      },
      {
        input: "1 1 0 0 1\n0",
        expectedOutput: "1",
        visibility: "PRIVATE",
      },
      {
        input: "3 3 0 0 3\n1 1 0\n1 0 0\n0 0 1",
        expectedOutput: "1 1 3\n1 3 3\n3 3 1",
        visibility: "PRIVATE",
      },
      {
        input: "3 3 1 1 5\n0 0 0\n0 1 1\n0 1 0",
        expectedOutput: "0 0 0\n0 5 5\n0 5 0",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Clone Graph",
    slug: "clone-graph",
    difficulty: "easy",
    link: "https://leetcode.com/problems/clone-graph/",
    description: `Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.

Each node in the graph contains a value (int) and a list (List[Node]) of its neighbors.

The graph is represented in the test input as an adjacency list. Each node's value equals its index (1-indexed).`,
    tags: ["Graph", "DFS", "BFS", "Hash Map"],
    companies: ["Amazon", "Facebook", "Google", "Microsoft"],
    examples: [
      `Input: adjList = [[2,4],[1,3],[2,4],[1,3]]\nOutput: [[2,4],[1,3],[2,4],[1,3]]`,
      `Input: adjList = [[]]\nOutput: [[]]`,
    ],
    editorial: `Use a hash map: original node → cloned node.
DFS from the given node. For each node:
  If already in the map, return the clone.
  Otherwise create a new node, store it in the map, then recursively clone all neighbors.
The hash map prevents infinite loops in cyclic graphs.
Time complexity: O(n + e), Space complexity: O(n).`,
    aiHints: `Use a hash map from original node to its clone to track already-visited nodes\nDFS: if node is already in the map return the existing clone — this handles cycles\nFor each neighbor of the current node, recursively clone and append to the clone's neighbor list`,
    testCases: [
      {
        input: "4\n2 4\n1 3\n2 4\n1 3",
        expectedOutput: "2 4\n1 3\n2 4\n1 3",
        displayInput: "adjList = [[2,4],[1,3],[2,4],[1,3]]",
        displayOutput: "[[2,4],[1,3],[2,4],[1,3]]",
        visibility: "PUBLIC",
      },
      {
        input: "1\n",
        expectedOutput: "",
        displayInput: "adjList = [[]]",
        displayOutput: "[[]]",
        visibility: "PUBLIC",
      },
      {
        input: "2\n2\n1",
        expectedOutput: "2\n1",
        visibility: "PRIVATE",
      },
      {
        input: "3\n2 3\n1 3\n1 2",
        expectedOutput: "2 3\n1 3\n1 2",
        visibility: "PRIVATE",
      },
      {
        input: "5\n2\n1 3\n2 4\n3 5\n4",
        expectedOutput: "2\n1 3\n2 4\n3 5\n4",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Number of Connected Components in an Undirected Graph",
    slug: "number-of-connected-components",
    difficulty: "easy",
    link: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/",
    description: `You have a graph of n nodes. You are given an integer n and an array edges where edges[i] = [ai, bi] indicates that there is an edge between ai and bi in the graph.

Return the number of connected components in the graph.`,
    tags: ["Graph", "DFS", "BFS", "Union Find"],
    companies: ["LinkedIn", "Google", "Amazon"],
    examples: [
      `Input: n = 5, edges = [[0,1],[1,2],[3,4]]\nOutput: 2`,
      `Input: n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]\nOutput: 1`,
    ],
    editorial: `Approach 1 — DFS/BFS: Build adjacency list. For each unvisited node run DFS and mark all reachable nodes visited. Count DFS launches = number of components.
Approach 2 — Union Find: Initialize n components. For each edge, if endpoints have different roots, union them and decrement component count.
Time complexity: O(n + e), Space complexity: O(n + e).`,
    aiHints: `Each unvisited node that you start a DFS from represents a new component\nUnion-Find is cleaner: start with n components, merge connected nodes, count remaining roots\nKeep a visited array to avoid revisiting nodes in BFS/DFS`,
    testCases: [
      {
        input: "5 3\n0 1\n1 2\n3 4",
        expectedOutput: "2",
        displayInput: "n = 5, edges = [[0,1],[1,2],[3,4]]",
        displayOutput: "2",
        visibility: "PUBLIC",
      },
      {
        input: "5 4\n0 1\n1 2\n2 3\n3 4",
        expectedOutput: "1",
        displayInput: "n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]",
        displayOutput: "1",
        visibility: "PUBLIC",
      },
      {
        input: "3 0",
        expectedOutput: "3",
        visibility: "PRIVATE",
      },
      {
        input: "4 2\n0 1\n2 3",
        expectedOutput: "2",
        visibility: "PRIVATE",
      },
      {
        input: "6 4\n0 1\n1 2\n3 4\n4 5",
        expectedOutput: "2",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Max Area of Island",
    slug: "max-area-of-island",
    difficulty: "easy",
    link: "https://leetcode.com/problems/max-area-of-island/",
    description: `You are given an m x n binary matrix grid. An island is a group of 1's (representing land) connected 4-directionally (horizontal or vertical). You may assume all four edges of the grid are surrounded by water.

The area of an island is the number of cells with a value 1 in the island.

Return the maximum area of an island in grid. If there is no island, return 0.`,
    tags: ["Graph", "DFS", "BFS", "Array"],
    companies: ["Amazon", "Facebook", "Google"],
    examples: [
      `Input: grid = [[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],...]\nOutput: 6`,
      `Input: grid = [[0,0,0,0,0,0,0,0]]\nOutput: 0`,
    ],
    editorial: `DFS from each unvisited land cell, counting cells as you go.
Mark cells visited by setting them to 0.
Track the maximum count seen across all DFS calls.
Time complexity: O(m*n), Space complexity: O(m*n) recursion stack.`,
    aiHints: `DFS from every unvisited land cell and count how many cells you visit\nSink visited cells (set to 0) to avoid counting them twice\nReturn the count from DFS and track the maximum across all islands`,
    testCases: [
      {
        input:
          "4 13\n0 0 1 0 0 0 0 1 0 0 0 0 0\n0 0 0 0 0 0 0 1 1 1 0 0 0\n0 1 1 0 1 0 0 0 0 0 0 0 0\n0 1 0 0 1 1 0 0 1 0 1 0 0",
        expectedOutput: "6",
        displayInput: "4x13 grid",
        displayOutput: "6",
        visibility: "PUBLIC",
      },
      {
        input: "1 8\n0 0 0 0 0 0 0 0",
        expectedOutput: "0",
        displayInput: "grid = [[0,0,0,0,0,0,0,0]]",
        displayOutput: "0",
        visibility: "PUBLIC",
      },
      {
        input: "1 1\n1",
        expectedOutput: "1",
        visibility: "PRIVATE",
      },
      {
        input: "3 3\n1 1 0\n1 0 0\n0 0 1",
        expectedOutput: "3",
        visibility: "PRIVATE",
      },
      {
        input: "3 3\n1 1 1\n1 0 1\n1 1 1",
        expectedOutput: "8",
        visibility: "PRIVATE",
      },
    ],
  },
];

const MEDIUM_PROBLEMS = [
  {
    title: "Course Schedule",
    slug: "course-schedule",
    difficulty: "medium",
    link: "https://leetcode.com/problems/course-schedule/",
    description: `There are a total of numCourses courses you have to take, labeled from 0 to numCourses-1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.

Return true if you can finish all courses. Otherwise, return false.`,
    tags: ["Graph", "Topological Sort", "DFS", "BFS"],
    companies: ["Amazon", "Facebook", "Google", "Airbnb", "Uber"],
    examples: [
      `Input: numCourses = 2, prerequisites = [[1,0]]\nOutput: true\nExplanation: Take course 0 then course 1.`,
      `Input: numCourses = 2, prerequisites = [[1,0],[0,1]]\nOutput: false\nExplanation: Cycle — impossible.`,
    ],
    editorial: `This is cycle detection in a directed graph.
Approach 1 — DFS: For each node do DFS. Track state: 0=unvisited, 1=visiting (in stack), 2=done.
If you visit a node in state 1, a cycle exists → return false.
Approach 2 — BFS (Kahn's): Compute in-degrees. Push 0-in-degree nodes to queue. Process queue: for each node reduce neighbor in-degrees; push neighbors that reach 0. If processed count == numCourses, no cycle.
Time complexity: O(V + E), Space complexity: O(V + E).`,
    aiHints: `This reduces to: does the directed graph have a cycle?\nDFS with three states (unvisited/visiting/done) detects back edges which indicate cycles\nKahn's BFS: if you can topologically sort all nodes then no cycle exists`,
    testCases: [
      {
        input: "2 1\n1 0",
        expectedOutput: "true",
        displayInput: "numCourses = 2, prerequisites = [[1,0]]",
        displayOutput: "true",
        visibility: "PUBLIC",
      },
      {
        input: "2 2\n1 0\n0 1",
        expectedOutput: "false",
        displayInput: "numCourses = 2, prerequisites = [[1,0],[0,1]]",
        displayOutput: "false",
        visibility: "PUBLIC",
      },
      {
        input: "1 0",
        expectedOutput: "true",
        visibility: "PRIVATE",
      },
      {
        input: "4 4\n1 0\n2 0\n3 1\n3 2",
        expectedOutput: "true",
        visibility: "PRIVATE",
      },
      {
        input: "3 3\n0 1\n1 2\n2 0",
        expectedOutput: "false",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Number of Provinces",
    slug: "number-of-provinces",
    difficulty: "medium",
    link: "https://leetcode.com/problems/number-of-provinces/",
    description: `There are n cities. Some of them are connected, while some are not. If city a is connected directly with city b, and city b is connected directly with city c, then city a is connected indirectly with city c.

A province is a group of directly or indirectly connected cities and no other cities outside of the group.

You are given an n x n matrix isConnected where isConnected[i][j] = 1 if the i-th city and the j-th city are directly connected, and isConnected[i][j] = 0 otherwise.

Return the total number of provinces.`,
    tags: ["Graph", "DFS", "BFS", "Union Find"],
    companies: ["Amazon", "Bloomberg", "Microsoft"],
    examples: [
      `Input: isConnected = [[1,1,0],[1,1,0],[0,0,1]]\nOutput: 2`,
      `Input: isConnected = [[1,0,0],[0,1,0],[0,0,1]]\nOutput: 3`,
    ],
    editorial: `Treat the matrix as an adjacency matrix. Count connected components using DFS/BFS or Union-Find.
DFS: for each unvisited city, DFS to mark all cities in its province as visited, increment count.
Union-Find: for each pair (i,j) where isConnected[i][j]==1, union them. Count distinct roots.
Time complexity: O(n²), Space complexity: O(n).`,
    aiHints: `The adjacency matrix directly encodes the graph — row i gives all neighbors of city i\nCount the number of DFS/BFS launches needed to visit all cities\nUnion-Find: union connected pairs, then count distinct roots`,
    testCases: [
      {
        input: "3\n1 1 0\n1 1 0\n0 0 1",
        expectedOutput: "2",
        displayInput: "isConnected = [[1,1,0],[1,1,0],[0,0,1]]",
        displayOutput: "2",
        visibility: "PUBLIC",
      },
      {
        input: "3\n1 0 0\n0 1 0\n0 0 1",
        expectedOutput: "3",
        displayInput: "isConnected = [[1,0,0],[0,1,0],[0,0,1]]",
        displayOutput: "3",
        visibility: "PUBLIC",
      },
      {
        input: "1\n1",
        expectedOutput: "1",
        visibility: "PRIVATE",
      },
      {
        input: "4\n1 1 0 0\n1 1 1 0\n0 1 1 0\n0 0 0 1",
        expectedOutput: "2",
        visibility: "PRIVATE",
      },
      {
        input: "4\n1 0 0 1\n0 1 1 0\n0 1 1 0\n1 0 0 1",
        expectedOutput: "2",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Rotting Oranges",
    slug: "rotting-oranges",
    difficulty: "medium",
    link: "https://leetcode.com/problems/rotting-oranges/",
    description: `You are given an m x n integer grid where:
- 0 represents an empty cell,
- 1 represents a fresh orange,
- 2 represents a rotten orange.

Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.

Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.`,
    tags: ["Graph", "BFS", "Matrix"],
    companies: ["Amazon", "Facebook", "Google", "DoorDash"],
    examples: [
      `Input: grid = [[2,1,1],[1,1,0],[0,1,1]]\nOutput: 4`,
      `Input: grid = [[2,1,1],[0,1,1],[1,0,1]]\nOutput: -1`,
    ],
    editorial: `Multi-source BFS starting from all rotten oranges simultaneously.
Enqueue all initial rotten oranges. Track count of fresh oranges.
BFS level by level — each level = 1 minute. Spread rot to fresh 4-directional neighbors.
Decrement fresh count as oranges rot.
After BFS: if fresh count > 0 return -1, else return minutes elapsed (subtract 1 for the initial level).
Time complexity: O(m*n), Space complexity: O(m*n).`,
    aiHints: `This is multi-source BFS — enqueue ALL rotten oranges at minute 0 simultaneously\nProcess the queue level by level where each level represents one minute passing\nAfter BFS completes, if any fresh orange remains it's unreachable — return -1`,
    testCases: [
      {
        input: "3 3\n2 1 1\n1 1 0\n0 1 1",
        expectedOutput: "4",
        displayInput: "grid = [[2,1,1],[1,1,0],[0,1,1]]",
        displayOutput: "4",
        visibility: "PUBLIC",
      },
      {
        input: "3 3\n2 1 1\n0 1 1\n1 0 1",
        expectedOutput: "-1",
        displayInput: "grid = [[2,1,1],[0,1,1],[1,0,1]]",
        displayOutput: "-1",
        visibility: "PUBLIC",
      },
      {
        input: "1 1\n0",
        expectedOutput: "0",
        visibility: "PRIVATE",
      },
      {
        input: "1 2\n2 1",
        expectedOutput: "1",
        visibility: "PRIVATE",
      },
      {
        input: "3 3\n2 1 1\n1 1 1\n0 1 2",
        expectedOutput: "2",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Pacific Atlantic Water Flow",
    slug: "pacific-atlantic-water-flow",
    difficulty: "medium",
    link: "https://leetcode.com/problems/pacific-atlantic-water-flow/",
    description: `There is an m x n rectangular island that borders both the Pacific Ocean and Atlantic Ocean. The Pacific Ocean touches the island's left and top edges, and the Atlantic Ocean touches the island's right and bottom edges.

Water can flow in four directions and flows from a cell to an adjacent one with height equal or less.

Return a list of grid coordinates where water can flow to both the Pacific and Atlantic oceans.`,
    tags: ["Graph", "BFS", "DFS", "Matrix"],
    companies: ["Google", "Amazon", "Salesforce"],
    examples: [
      `Input: heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]\nOutput: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]`,
      `Input: heights = [[1]]\nOutput: [[0,0]]`,
    ],
    editorial: `Reverse the flow direction: instead of flowing down from each cell, flow UP from ocean borders.
BFS/DFS from all Pacific border cells — mark cells reachable.
BFS/DFS from all Atlantic border cells — mark cells reachable.
A cell is in the answer if it appears in both reachable sets.
Reverse condition: move to neighbor if neighbor height >= current height.
Time complexity: O(m*n), Space complexity: O(m*n).`,
    aiHints: `Instead of simulating forward flow (high to low), reverse it: flow backwards from each ocean (low to high)\nRun two separate BFS/DFS passes — one from Pacific borders, one from Atlantic borders\nThe answer is the intersection of the two reachable sets`,
    testCases: [
      {
        input: "5 5\n1 2 2 3 5\n3 2 3 4 4\n2 4 5 3 1\n6 7 1 4 5\n5 1 1 2 4",
        expectedOutput: "0 4\n1 3\n1 4\n2 2\n3 0\n3 1\n4 0",
        displayInput: "5x5 heights grid",
        displayOutput: "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]",
        visibility: "PUBLIC",
      },
      {
        input: "1 1\n1",
        expectedOutput: "0 0",
        displayInput: "heights = [[1]]",
        displayOutput: "[[0,0]]",
        visibility: "PUBLIC",
      },
      {
        input: "2 2\n1 2\n3 4",
        expectedOutput: "0 1\n1 0\n1 1",
        visibility: "PRIVATE",
      },
      {
        input: "1 5\n1 2 3 4 5",
        expectedOutput: "0 4",
        visibility: "PRIVATE",
      },
      {
        input: "3 3\n3 3 3\n3 1 3\n3 3 3",
        expectedOutput: "0 0\n0 1\n0 2\n1 0\n1 2\n2 0\n2 1\n2 2",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Course Schedule II",
    slug: "course-schedule-ii",
    difficulty: "medium",
    link: "https://leetcode.com/problems/course-schedule-ii/",
    description: `There are a total of numCourses courses you have to take, labeled from 0 to numCourses-1. You are given an array prerequisites where prerequisites[i] = [ai, bi] means you must take bi before ai.

Return the ordering of courses you should take to finish all courses. If there are many valid answers, return any of them. If it is impossible to finish all courses, return an empty array.`,
    tags: ["Graph", "Topological Sort", "DFS", "BFS"],
    companies: ["Amazon", "Facebook", "Zenefits", "Airbnb"],
    examples: [
      `Input: numCourses = 2, prerequisites = [[1,0]]\nOutput: [0,1]`,
      `Input: numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]\nOutput: [0,2,1,3]`,
    ],
    editorial: `Topological sort of a directed graph.
Kahn's BFS: Compute in-degrees. Push all 0-in-degree nodes to queue.
Process queue: add node to result, reduce neighbors' in-degrees, push newly 0-in-degree nodes.
If result length == numCourses, return result. Otherwise a cycle exists — return [].
DFS alternative: post-order DFS, push node to stack after visiting all its descendants.
Time complexity: O(V + E), Space complexity: O(V + E).`,
    aiHints: `This is classic topological sort — output nodes in dependency order\nKahn's algorithm: repeatedly remove nodes with no remaining prerequisites\nIf you process all nodes you have a valid ordering; if stuck there is a cycle`,
    testCases: [
      {
        input: "2 1\n1 0",
        expectedOutput: "0 1",
        displayInput: "numCourses = 2, prerequisites = [[1,0]]",
        displayOutput: "[0,1]",
        visibility: "PUBLIC",
      },
      {
        input: "4 4\n1 0\n2 0\n3 1\n3 2",
        expectedOutput: "0 1 2 3",
        displayInput:
          "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]",
        displayOutput: "[0,1,2,3] or [0,2,1,3]",
        visibility: "PUBLIC",
      },
      {
        input: "1 0",
        expectedOutput: "0",
        visibility: "PRIVATE",
      },
      {
        input: "3 3\n1 0\n2 1\n0 2",
        expectedOutput: "",
        visibility: "PRIVATE",
      },
      {
        input: "6 6\n1 0\n2 0\n3 1\n4 2\n5 3\n5 4",
        expectedOutput: "0 1 2 3 4 5",
        visibility: "PRIVATE",
      },
    ],
  },
];

const HARD_PROBLEMS = [
  {
    title: "Word Ladder",
    slug: "word-ladder",
    difficulty: "hard",
    link: "https://leetcode.com/problems/word-ladder/",
    description: `A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence beginWord -> s1 -> s2 -> ... -> sk such that:
- Every adjacent pair of words differs by a single letter.
- Every si for 1 <= i <= k is in wordList.
- sk == endWord.

Given beginWord, endWord, and wordList, return the number of words in the shortest transformation sequence, or 0 if no such sequence exists.`,
    tags: ["Graph", "BFS", "Hash Set", "String"],
    companies: ["Amazon", "Facebook", "LinkedIn", "Snapchat"],
    examples: [
      `Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]\nOutput: 5\nExplanation: hit→hot→dot→dog→cog (5 words).`,
      `Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]\nOutput: 0`,
    ],
    editorial: `BFS on an implicit graph where two words are neighbors if they differ by exactly one character.
Add beginWord to queue. For each word dequeued, try changing each position to every letter a-z.
If the transformed word is in the word set, enqueue it and remove it from the set (avoid revisits).
Return level count when endWord is found, 0 if queue empties.
Optimization: bidirectional BFS from both ends reduces search space significantly.
Time complexity: O(m² * n) where m = word length, n = wordList size.`,
    aiHints: `Model as BFS on a graph — two words are connected if they differ by exactly one character\nGenerate all possible single-character mutations of the current word and check against the word set\nRemove words from the set once visited to prevent revisiting — this also serves as the visited check`,
    testCases: [
      {
        input: "hit cog\nhot dot dog lot log cog",
        expectedOutput: "5",
        displayInput: 'beginWord = "hit", endWord = "cog"',
        displayOutput: "5",
        visibility: "PUBLIC",
      },
      {
        input: "hit cog\nhot dot dog lot log",
        expectedOutput: "0",
        displayInput: 'beginWord = "hit", endWord = "cog" (no cog in list)',
        displayOutput: "0",
        visibility: "PUBLIC",
      },
      {
        input: "a b\na b",
        expectedOutput: "2",
        visibility: "PRIVATE",
      },
      {
        input: "hot dog\nhot dog",
        expectedOutput: "2",
        visibility: "PRIVATE",
      },
      {
        input:
          "sand acne\nsand band bend bead dead dean mean bean lean team tram acne",
        expectedOutput: "9",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Cheapest Flights Within K Stops",
    slug: "cheapest-flights-within-k-stops",
    difficulty: "hard",
    link: "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
    description: `There are n cities connected by some number of flights. You are given an array flights where flights[i] = [fromi, toi, pricei] indicates that there is a flight from city fromi to city toi with cost pricei.

Given the integers n, flights, src, dst, and k, return the cheapest price from src to dst with at most k stops. If there is no such route, return -1.`,
    tags: ["Graph", "BFS", "Dynamic Programming", "Shortest Path"],
    companies: ["Amazon", "Google", "Uber", "Airbnb"],
    examples: [
      `Input: n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1\nOutput: 700`,
      `Input: n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1\nOutput: 200`,
    ],
    editorial: `Bellman-Ford with k+1 iterations (modified for k stops).
dp[i] = min cost to reach city i using at most j edges (j from 1 to k+1).
Use a copy of previous iteration's dp to avoid using more edges than allowed per step.
Alternatively use BFS (modified Dijkstra) with state (city, stops_used).
Avoid standard Dijkstra — it may relax edges using too many stops.
Time complexity: O(k * |flights|), Space complexity: O(n).`,
    aiHints: `Standard Dijkstra doesn't work here because a cheaper path might use too many stops\nBellman-Ford: run exactly k+1 relaxation rounds — each round adds at most one more edge\nUse a temporary copy of the distance array per round to prevent chain updates in a single round`,
    testCases: [
      {
        input: "4 0 3 1\n0 1 100\n1 2 100\n2 0 100\n1 3 600\n2 3 200",
        expectedOutput: "700",
        displayInput: "n=4, src=0, dst=3, k=1",
        displayOutput: "700",
        visibility: "PUBLIC",
      },
      {
        input: "3 0 2 1\n0 1 100\n1 2 100\n0 2 500",
        expectedOutput: "200",
        displayInput: "n=3, src=0, dst=2, k=1",
        displayOutput: "200",
        visibility: "PUBLIC",
      },
      {
        input: "3 0 2 0\n0 1 100\n1 2 100\n0 2 500",
        expectedOutput: "500",
        visibility: "PRIVATE",
      },
      {
        input: "4 0 3 0\n0 1 100\n1 3 100",
        expectedOutput: "-1",
        visibility: "PRIVATE",
      },
      {
        input: "5 0 4 2\n0 1 100\n1 2 100\n2 3 100\n3 4 100\n0 3 500",
        expectedOutput: "400",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Network Delay Time",
    slug: "network-delay-time",
    difficulty: "hard",
    link: "https://leetcode.com/problems/network-delay-time/",
    description: `You are given a network of n nodes, labeled from 1 to n. You are also given times, a list of travel times as directed edges where times[i] = (ui, vi, wi) and wi is the time it takes for a signal to travel from node ui to node vi.

We will send a signal from a given node k. Return the minimum time it takes for all the n nodes to receive the signal. If it is impossible for all the n nodes to receive the signal, return -1.`,
    tags: ["Graph", "Shortest Path", "Dijkstra", "Heap"],
    companies: ["Amazon", "Google", "Facebook"],
    examples: [
      `Input: times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2\nOutput: 2`,
      `Input: times = [[1,2,1]], n = 2, k = 1\nOutput: 1`,
    ],
    editorial: `Single-source shortest path from node k using Dijkstra's algorithm.
Use a min-heap of (distance, node). Start with (0, k).
Relax edges greedily — always process the closest unvisited node first.
After processing all reachable nodes, find max(dist[1..n]).
If any node has dist = infinity it is unreachable — return -1.
Time complexity: O((V + E) log V), Space complexity: O(V + E).`,
    aiHints: `This is single-source shortest path — Dijkstra from node k\nUse a min-heap to always process the node with the current smallest distance\nThe answer is the maximum shortest path across all nodes — the "last" node to receive the signal`,
    testCases: [
      {
        input: "4 2 3\n2 1 1\n2 3 1\n3 4 1",
        expectedOutput: "2",
        displayInput: "n=4, k=2, times=[[2,1,1],[2,3,1],[3,4,1]]",
        displayOutput: "2",
        visibility: "PUBLIC",
      },
      {
        input: "2 1 1\n1 2 1",
        expectedOutput: "1",
        displayInput: "n=2, k=1, times=[[1,2,1]]",
        displayOutput: "1",
        visibility: "PUBLIC",
      },
      {
        input: "2 2 1\n1 2 1",
        expectedOutput: "-1",
        visibility: "PRIVATE",
      },
      {
        input: "3 1 3\n1 2 1\n2 3 2\n1 3 4",
        expectedOutput: "3",
        visibility: "PRIVATE",
      },
      {
        input: "5 1 4\n1 2 3\n1 3 10\n2 3 4\n2 4 5\n3 4 2\n4 5 1",
        expectedOutput: "9",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Reconstruct Itinerary",
    slug: "reconstruct-itinerary",
    difficulty: "hard",
    link: "https://leetcode.com/problems/reconstruct-itinerary/",
    description: `You are given a list of airline tickets represented by pairs of departure and arrival airports [from, to]. Reconstruct the itinerary in order and return it.

All of the tickets must be used exactly once. The itinerary must begin with "JFK". If there are multiple valid itineraries, return the itinerary that has the smallest lexical order when read as a single string.`,
    tags: ["Graph", "DFS", "Eulerian Path"],
    companies: ["Google", "Amazon", "Uber"],
    examples: [
      `Input: tickets = [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]\nOutput: ["JFK","MUC","LHR","SFO","SJC"]`,
      `Input: tickets = [["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]]\nOutput: ["JFK","ATL","JFK","SFO","ATL","SFO"]`,
    ],
    editorial: `Hierholzer's algorithm for Eulerian path.
Build adjacency list with sorted neighbors (lexical order).
DFS from JFK: greedily visit smallest neighbor. After exhausting all edges from a node, append it to the result.
Reverse the result at the end.
The post-order append handles dead-ends correctly — a dead-end is always the last segment of the path.
Time complexity: O(E log E), Space complexity: O(E).`,
    aiHints: `Sort each airport's destinations lexicographically — always visit the smallest option first\nUse Hierholzer's algorithm: DFS and only add a node to the result AFTER all its outgoing edges are used\nReverse the result at the end — this handles dead-ends automatically`,
    testCases: [
      {
        input: "4\nMUC LHR\nJFK MUC\nSFO SJC\nLHR SFO",
        expectedOutput: "JFK MUC LHR SFO SJC",
        displayInput: "tickets = [[MUC,LHR],[JFK,MUC],[SFO,SJC],[LHR,SFO]]",
        displayOutput: "[JFK,MUC,LHR,SFO,SJC]",
        visibility: "PUBLIC",
      },
      {
        input: "5\nJFK SFO\nJFK ATL\nSFO ATL\nATL JFK\nATL SFO",
        expectedOutput: "JFK ATL JFK SFO ATL SFO",
        displayInput:
          "tickets = [[JFK,SFO],[JFK,ATL],[SFO,ATL],[ATL,JFK],[ATL,SFO]]",
        displayOutput: "[JFK,ATL,JFK,SFO,ATL,SFO]",
        visibility: "PUBLIC",
      },
      {
        input: "1\nJFK AAA",
        expectedOutput: "JFK AAA",
        visibility: "PRIVATE",
      },
      {
        input: "3\nJFK KUL\nJFK NRT\nNRT JFK",
        expectedOutput: "JFK NRT JFK KUL",
        visibility: "PRIVATE",
      },
      {
        input: "4\nJFK AAA\nJFK BBB\nAAA JFK\nBBB CCC",
        expectedOutput: "JFK AAA JFK BBB CCC",
        visibility: "PRIVATE",
      },
    ],
  },
  {
    title: "Alien Dictionary",
    slug: "alien-dictionary",
    difficulty: "hard",
    link: "https://leetcode.com/problems/alien-dictionary/",
    description: `There is a new alien language that uses the English alphabet. However, the order of the letters is unknown to you.

You are given a list of strings words from the alien language's dictionary, where the strings in words are sorted lexicographically by the rules of this new language.

Return a string of the unique letters in the new language sorted in the rules of this language. If there is no solution, return "". If there are multiple solutions, return any of them.`,
    tags: ["Graph", "Topological Sort", "DFS", "BFS", "String"],
    companies: ["Google", "Facebook", "Airbnb", "Amazon", "Twitter"],
    examples: [
      `Input: words = ["wrt","wrf","er","ett","rftt"]\nOutput: "wertf"`,
      `Input: words = ["z","x"]\nOutput: "zx"`,
    ],
    editorial: `Extract ordering constraints by comparing adjacent words character by character.
For words[i] and words[i+1], find the first position where they differ — that character in words[i] comes before the character in words[i+1] in the alien alphabet.
Edge case: if words[i+1] is a prefix of words[i], return "" (invalid).
Build directed graph of these constraints. Run topological sort (Kahn's BFS or DFS).
If a cycle is found, return "". Otherwise return the topological order.
Time complexity: O(C) where C = total characters across all words.`,
    aiHints: `Compare adjacent word pairs to extract character ordering constraints\nEach constraint is a directed edge in a graph — find the FIRST differing character between consecutive words\nRun topological sort on the constraint graph; a cycle means the input is invalid`,
    testCases: [
      {
        input: "5\nwrt\nwrf\ner\nett\nrftt",
        expectedOutput: "wertf",
        displayInput: 'words = ["wrt","wrf","er","ett","rftt"]',
        displayOutput: '"wertf"',
        visibility: "PUBLIC",
      },
      {
        input: "2\nz\nx",
        expectedOutput: "zx",
        displayInput: 'words = ["z","x"]',
        displayOutput: '"zx"',
        visibility: "PUBLIC",
      },
      {
        input: "1\na",
        expectedOutput: "a",
        visibility: "PRIVATE",
      },
      {
        input: "2\nabc\nab",
        expectedOutput: "",
        visibility: "PRIVATE",
      },
      {
        input: "4\nz\nz",
        expectedOutput: "z",
        visibility: "PRIVATE",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// SHEET CONFIGURATION
// ─────────────────────────────────────────────────────────────────

const SHEET_CONFIG = {
  title: "Graph Problems",
  description:
    "A curated collection of graph problems for interview prep and SDE OAs — covering BFS, DFS, topological sort, Union-Find, shortest paths, and Eulerian paths across easy, medium, and hard difficulties.",
  sections: [
    {
      title: "Easy Problems",
      description:
        "Foundational graph problems covering basic BFS/DFS traversal, connected components, and grid graphs.",
      difficulty: "easy" as const,
    },
    {
      title: "Medium Problems",
      description:
        "Intermediate graph challenges including topological sort, multi-source BFS, and cycle detection.",
      difficulty: "medium" as const,
    },
    {
      title: "Hard Problems",
      description:
        "Advanced graph problems combining shortest path algorithms, Eulerian paths, and constraint-based graph construction.",
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
