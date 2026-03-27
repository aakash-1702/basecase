import "dotenv/config";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SEED_KEY = process.env.SEED_KEY || "seed123";

const REQUEST_DELAY_MS = 1500;
const TESTCASE_DELAY_MS = 2000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

async function createOrFetchProblem(problemData: any, testCases?: any[]) {
  const created = await apiRequest("/api/problems", "POST", problemData);
  console.log(`  ✓ Ready: ${created.title}`);

  if (testCases && testCases.length > 0) {
    await apiRequest(`/api/problems/${created.slug}/testcases`, "POST", {
      testCases,
    });
    console.log(`    → Test cases ready`);
  }

  return created;
}

async function createOrFetchSheet(sheetData: any) {
  const created = await apiRequest("/api/sheets", "POST", sheetData);
  console.log(`  ✓ Ready sheet: ${created.title}`);
  return created;
}

async function createOrFetchSection(sheetSlug: string, sectionData: any) {
  const created = await apiRequest(
    `/api/sheets/${sheetSlug}/section`,
    "POST",
    sectionData,
  );
  console.log(`  ✓ Ready section: ${created.title}`);
  return created;
}

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
// PROBLEM DATA — STACKS & QUEUES
// ─────────────────────────────────────────────────────────────────

const EASY_PROBLEMS = [
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "easy",
    link: "https://leetcode.com/problems/valid-parentheses/",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n- Open brackets must be closed by the same type of brackets.\n- Open brackets must be closed in the correct order.\n- Every close bracket has a corresponding open bracket of the same type.`,
    tags: ["Stack", "String"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Bloomberg"],
    examples: [
      `Input: s = "()"\nOutput: true`,
      `Input: s = "()[]{}" \nOutput: true`,
      `Input: s = "(]"\nOutput: false`,
    ],
    editorial: `Use a stack. For each character:\n- If it's an opening bracket, push it.\n- If it's a closing bracket, check if the stack top is the matching opener. If not (or stack is empty), return false.\nAfter processing all characters, return true only if the stack is empty.\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `Push opening brackets onto the stack\nFor closing brackets, check if the stack top is the matching opening bracket\nAt the end, the stack must be empty for the string to be valid`,
    testCases: [
      { input: "()", expectedOutput: "true", displayInput: 's = "()"', displayOutput: "true", visibility: "PUBLIC" },
      { input: "()[]{}", expectedOutput: "true", displayInput: 's = "()[]{}"', displayOutput: "true", visibility: "PUBLIC" },
      { input: "(]", expectedOutput: "false", displayInput: 's = "(]"', displayOutput: "false", visibility: "PUBLIC" },
      { input: "{[]}", expectedOutput: "true", visibility: "PRIVATE" },
      { input: "([)]", expectedOutput: "false", visibility: "PRIVATE" },
      { input: "]", expectedOutput: "false", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Implement Stack using Queues",
    slug: "implement-stack-using-queues",
    difficulty: "easy",
    link: "https://leetcode.com/problems/implement-stack-using-queues/",
    description: `Implement a last-in-first-out (LIFO) stack using only two queues. The implemented stack should support all the functions of a normal stack (push, top, pop, and empty).\n\nImplement the MyStack class:\n- void push(int x) — Pushes element x to the top of the stack.\n- int pop() — Removes the element on the top of the stack and returns it.\n- int top() — Returns the element on the top of the stack.\n- boolean empty() — Returns true if the stack is empty, false otherwise.`,
    tags: ["Stack", "Queue", "Design"],
    companies: ["Amazon", "Microsoft", "Bloomberg"],
    examples: [
      `Input: ["MyStack","push","push","top","pop","empty"]\n[[], [1], [2], [], [], []]\nOutput: [null,null,null,2,2,false]`,
    ],
    editorial: `Single-queue approach: after pushing a new element, rotate the queue (n-1) times so the new element moves to the front.\nThis makes pop() and top() O(1) at the cost of O(n) push.\nAlternatively use two queues swapping roles on each push.\nTime complexity: push O(n), pop O(1), top O(1), Space: O(n).`,
    aiHints: `After pushing, rotate all previous elements behind the new one\nThis way the queue front always holds the stack top\nUse a single queue and re-enqueue n-1 elements after each push`,
    testCases: [
      { input: "push 1\npush 2\ntop\npop\nempty", expectedOutput: "null\nnull\n2\n2\nfalse", displayInput: 'push(1), push(2), top(), pop(), empty()', displayOutput: "2, 2, false", visibility: "PUBLIC" },
      { input: "push 5\npush 3\npop\npush 7\ntop\nempty", expectedOutput: "null\nnull\n3\nnull\n7\nfalse", visibility: "PRIVATE" },
      { input: "push 1\npop\nempty", expectedOutput: "null\n1\ntrue", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Implement Queue using Stacks",
    slug: "implement-queue-using-stacks",
    difficulty: "easy",
    link: "https://leetcode.com/problems/implement-queue-using-stacks/",
    description: `Implement a first-in-first-out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty).\n\nImplement the MyQueue class:\n- void push(int x) — Pushes element x to the back of the queue.\n- int pop() — Removes the element from the front of the queue and returns it.\n- int peek() — Returns the element at the front of the queue.\n- boolean empty() — Returns true if the queue is empty, false otherwise.`,
    tags: ["Stack", "Queue", "Design"],
    companies: ["Amazon", "Microsoft", "Bloomberg", "Apple"],
    examples: [
      `Input: ["MyQueue","push","push","peek","pop","empty"]\n[[], [1], [2], [], [], []]\nOutput: [null,null,null,1,1,false]`,
    ],
    editorial: `Use two stacks: input stack and output stack.\npush: always push to input stack — O(1).\npop/peek: if output stack is empty, pour all elements from input to output (reverses order). Then pop/peek from output — amortized O(1).\nEach element is moved at most once.\nTime complexity: amortized O(1) all operations, Space: O(n).`,
    aiHints: `Use one stack for input and one for output\nOnly transfer input→output when the output stack is empty\nThis lazy transfer gives amortized O(1) for pop and peek`,
    testCases: [
      { input: "push 1\npush 2\npeek\npop\nempty", expectedOutput: "null\nnull\n1\n1\nfalse", displayInput: "push(1), push(2), peek(), pop(), empty()", displayOutput: "1, 1, false", visibility: "PUBLIC" },
      { input: "push 3\npush 5\npush 7\npop\npop\npeek", expectedOutput: "null\nnull\nnull\n3\n5\n7", visibility: "PRIVATE" },
      { input: "push 1\npop\nempty", expectedOutput: "null\n1\ntrue", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Baseball Game",
    slug: "baseball-game",
    difficulty: "easy",
    link: "https://leetcode.com/problems/baseball-game/",
    description: `You are keeping the scores for a baseball game with strange rules. At the beginning of the game, you start with an empty record.\n\nYou are given a list of strings operations, where operations[i] is the ith operation you must apply:\n- Integer x: Record a new score of x.\n- '+': Record a new score that is the sum of the previous two scores.\n- 'D': Record a new score that is double the previous score.\n- 'C': Invalidate the previous score, removing it from the record.\n\nReturn the sum of all scores.`,
    tags: ["Stack", "Array", "Simulation"],
    companies: ["Google", "Amazon", "Microsoft"],
    examples: [
      `Input: ops = ["5","2","C","D","+"]\nOutput: 30`,
      `Input: ops = ["5","-2","4","C","D","9","+","+"]\nOutput: 27`,
    ],
    editorial: `Simulate using a stack.\n- Integer: push to stack.\n- 'C': pop the top.\n- 'D': push top * 2.\n- '+': push sum of top two (don't remove them).\nReturn the sum of all elements in the stack.\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `Use a stack to maintain the current valid scores\n'C' pops, 'D' pushes double the top, '+' pushes sum of top two\nSum all remaining stack elements at the end`,
    testCases: [
      { input: "5 2 C D +", expectedOutput: "30", displayInput: 'ops = ["5","2","C","D","+"]', displayOutput: "30", visibility: "PUBLIC" },
      { input: "5 -2 4 C D 9 + +", expectedOutput: "27", displayInput: 'ops = ["5","-2","4","C","D","9","+","+"]', displayOutput: "27", visibility: "PUBLIC" },
      { input: "1", expectedOutput: "1", visibility: "PRIVATE" },
      { input: "1 2 + D C", expectedOutput: "3", visibility: "PRIVATE" },
      { input: "10 D D D", expectedOutput: "150", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Min Stack",
    slug: "min-stack",
    difficulty: "easy",
    link: "https://leetcode.com/problems/min-stack/",
    description: `Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.\n\nImplement the MinStack class:\n- MinStack() initializes the stack object.\n- void push(int val) pushes the element val onto the stack.\n- void pop() removes the element on the top of the stack.\n- int top() gets the top element of the stack.\n- int getMin() retrieves the minimum element in the stack.`,
    tags: ["Stack", "Design"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Bloomberg", "Apple"],
    examples: [
      `Input: ["MinStack","push","push","push","getMin","pop","top","getMin"]\n[[], [-2], [0], [-3], [], [], [], []]\nOutput: [null,null,null,null,-3,null,0,-2]`,
    ],
    editorial: `Maintain two stacks: a main stack and a min stack.\nOn push: push to main stack; push to min stack only if value <= current min (or min stack is empty).\nOn pop: pop from main stack; if popped value == min stack top, pop from min stack too.\ngetMin: return min stack top.\nTime complexity: O(1) all operations, Space complexity: O(n).`,
    aiHints: `Maintain an auxiliary min stack alongside the main stack\nPush to the min stack whenever the new value is <= the current minimum\nPop from the min stack when the popped main value equals the current minimum`,
    testCases: [
      { input: "push -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin", expectedOutput: "null\nnull\nnull\n-3\nnull\n0\n-2", displayInput: "push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()", displayOutput: "-3, 0, -2", visibility: "PUBLIC" },
      { input: "push 5\npush 3\npush 7\ngetMin\npop\ngetMin", expectedOutput: "null\nnull\nnull\n3\nnull\n3", visibility: "PRIVATE" },
      { input: "push 1\npush 1\ngetMin\npop\ngetMin", expectedOutput: "null\nnull\n1\nnull\n1", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Removing Stars From a String",
    slug: "removing-stars-from-a-string",
    difficulty: "easy",
    link: "https://leetcode.com/problems/removing-stars-from-a-string/",
    description: `You are given a string s, which contains stars *.\n\nIn one operation, you can choose a star in s, remove the closest non-star character to its left, as well as remove the star itself.\n\nReturn the string after all stars have been removed. The input will be generated such that the operation is always possible.`,
    tags: ["Stack", "String", "Simulation"],
    companies: ["Amazon", "Google", "Microsoft"],
    examples: [
      `Input: s = "leet**cod*e"\nOutput: "lecoe"`,
      `Input: s = "erase*****"\nOutput: ""`,
    ],
    editorial: `Use a stack (or a list acting as one). Iterate through the string:\n- If the character is not a star, push it.\n- If it's a star, pop the top of the stack (removes closest non-star to the left).\nJoin the stack to form the result.\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `Treat the result as a stack: push non-star characters, pop on each star\nThis naturally removes the closest left non-star for each star\nJoin the stack contents at the end`,
    testCases: [
      { input: "leet**cod*e", expectedOutput: "lecoe", displayInput: 's = "leet**cod*e"', displayOutput: '"lecoe"', visibility: "PUBLIC" },
      { input: "erase*****", expectedOutput: "", displayInput: 's = "erase*****"', displayOutput: '""', visibility: "PUBLIC" },
      { input: "abc", expectedOutput: "abc", visibility: "PRIVATE" },
      { input: "a*b*c*", expectedOutput: "", visibility: "PRIVATE" },
      { input: "ab*cd**e", expectedOutput: "ae", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Number of Students Unable to Eat Lunch",
    slug: "number-of-students-unable-to-eat-lunch",
    difficulty: "easy",
    link: "https://leetcode.com/problems/number-of-students-unable-to-eat-lunch/",
    description: `The school cafeteria offers circular and square sandwiches at lunch break, referred to by numbers 0 and 1 respectively. All students stand in a queue. Each student either prefers square or circular sandwiches.\n\nThe number of sandwiches in the cafeteria is equal to the number of students. The sandwiches are placed in a stack. If the student at the front of the queue prefers the sandwich on the top of the stack, they will take it and leave the queue. Otherwise, they will leave it and go to the queue's back. This continues until none of the queue students want to take the top sandwich and are thus unable to eat.\n\nReturn the number of students that are unable to eat.`,
    tags: ["Stack", "Queue", "Array", "Simulation"],
    companies: ["Amazon", "Google"],
    examples: [
      `Input: students = [1,1,0,0], sandwiches = [0,1,0,1]\nOutput: 0`,
      `Input: students = [1,1,1,0,0,1], sandwiches = [1,0,0,0,1,1]\nOutput: 3`,
    ],
    editorial: `Count the number of students wanting 0s and 1s.\nFor each sandwich on top of the stack:\n- If count for that type > 0, serve it (decrement count).\n- Else no student wants this type — all remaining students are stuck. Return the total remaining count.\nTime complexity: O(n), Space complexity: O(1).`,
    aiHints: `Count how many students want each type (0 or 1) — no need to simulate the queue\nProcess sandwiches top to bottom; if any sandwich type has zero wanting students, everyone remaining is stuck\nReturn the sum of remaining counts when stuck`,
    testCases: [
      { input: "1 1 0 0\n0 1 0 1", expectedOutput: "0", displayInput: "students = [1,1,0,0], sandwiches = [0,1,0,1]", displayOutput: "0", visibility: "PUBLIC" },
      { input: "1 1 1 0 0 1\n1 0 0 0 1 1", expectedOutput: "3", displayInput: "students = [1,1,1,0,0,1], sandwiches = [1,0,0,0,1,1]", displayOutput: "3", visibility: "PUBLIC" },
      { input: "0\n0", expectedOutput: "0", visibility: "PRIVATE" },
      { input: "1\n0", expectedOutput: "1", visibility: "PRIVATE" },
      { input: "0 0 0\n0 0 0", expectedOutput: "0", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Make The String Great",
    slug: "make-the-string-great",
    difficulty: "easy",
    link: "https://leetcode.com/problems/make-the-string-great/",
    description: `Given a string s of lower and upper case English letters.\n\nA good string is a string which doesn't have two adjacent characters s[i] and s[i + 1] where:\n- 0 <= i <= s.length - 2\n- s[i] is a lower-case letter and s[i + 1] is the same letter but in upper-case or vice-versa.\n\nTo make the string good, you can choose two adjacent characters that make the string bad and remove them. Return the string after making it good.`,
    tags: ["Stack", "String"],
    companies: ["Google", "Amazon"],
    examples: [
      `Input: s = "leEeetcode"\nOutput: "leetcode"`,
      `Input: s = "abBAcC"\nOutput: ""`,
    ],
    editorial: `Use a stack. For each character in s:\n- If the stack is non-empty and the top character is the same letter in opposite case, pop the top (they cancel out).\n- Otherwise push the current character.\nJoin the stack for the result.\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `Use a stack and check if the incoming character cancels the stack top\nTwo characters cancel if they are the same letter but differ by case (e.g., 'a' and 'A')\nCheck using: same letter (case-insensitive) but different case (c != stack.top)`,
    testCases: [
      { input: "leEeetcode", expectedOutput: "leetcode", displayInput: 's = "leEeetcode"', displayOutput: '"leetcode"', visibility: "PUBLIC" },
      { input: "abBAcC", expectedOutput: "", displayInput: 's = "abBAcC"', displayOutput: '""', visibility: "PUBLIC" },
      { input: "s", expectedOutput: "s", visibility: "PRIVATE" },
      { input: "Pp", expectedOutput: "", visibility: "PRIVATE" },
      { input: "aAbBcC", expectedOutput: "", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Next Greater Element I",
    slug: "next-greater-element-i",
    difficulty: "easy",
    link: "https://leetcode.com/problems/next-greater-element-i/",
    description: `The next greater element of some element x in an array is the first greater element that is to the right of x in the same array.\n\nYou are given two distinct 0-indexed integer arrays nums1 and nums2, where nums1 is a subset of nums2.\n\nFor each 0 <= i < nums1.length, find the index j such that nums1[i] == nums2[j] and determine the next greater element of nums2[j] in nums2. If there is no next greater element, then the answer for this query is -1.\n\nReturn an array ans of length nums1.length such that ans[i] is the next greater element.`,
    tags: ["Stack", "Array", "Hash Table", "Monotonic Stack"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    examples: [
      `Input: nums1 = [4,1,2], nums2 = [1,3,4,2]\nOutput: [-1,3,-1]`,
      `Input: nums1 = [2,4], nums2 = [1,2,3,4]\nOutput: [3,-1]`,
    ],
    editorial: `Use a monotonic decreasing stack on nums2 to precompute the next greater element for every value.\nIterate nums2; while the current element is greater than the stack top, map stack top → current element.\nStore results in a hash map, then look up each element of nums1.\nTime complexity: O(m + n), Space complexity: O(n).`,
    aiHints: `Use a monotonic stack to precompute next-greater for every element in nums2\nWhen a larger element is found, it is the next greater for all smaller elements currently in the stack\nStore results in a hash map and look up nums1 elements`,
    testCases: [
      { input: "3\n4 1 2\n4\n1 3 4 2", expectedOutput: "-1 3 -1", displayInput: "nums1 = [4,1,2], nums2 = [1,3,4,2]", displayOutput: "[-1,3,-1]", visibility: "PUBLIC" },
      { input: "2\n2 4\n4\n1 2 3 4", expectedOutput: "3 -1", displayInput: "nums1 = [2,4], nums2 = [1,2,3,4]", displayOutput: "[3,-1]", visibility: "PUBLIC" },
      { input: "1\n1\n3\n3 2 1", expectedOutput: "-1", visibility: "PRIVATE" },
      { input: "2\n1 3\n4\n1 2 3 4", expectedOutput: "2 4", visibility: "PRIVATE" },
      { input: "1\n5\n3\n3 5 7", expectedOutput: "7", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Crawler Log Folder",
    slug: "crawler-log-folder",
    difficulty: "easy",
    link: "https://leetcode.com/problems/crawler-log-folder/",
    description: `The Leetcode file system keeps a log each time some user performs a change folder operation.\n\nThe operations are described as follows:\n- "../" : Move to the parent folder of the current folder. (If you are already in the main folder, remain in the same folder.)\n- "./" : Remain in the same folder.\n- "x/" : Move to the child folder named x (this folder is guaranteed to always exist).\n\nYou are given a list of strings logs where logs[i] is the operation performed by the user at the ith step.\n\nReturn the minimum number of operations needed to go back to the main folder after the log.`,
    tags: ["Stack", "Array", "String"],
    companies: ["Amazon", "Google"],
    examples: [
      `Input: logs = ["d1/","d2/","../","d21/","./"]\nOutput: 2`,
      `Input: logs = ["d1/","d2/","./","d3/","../","d31/"]\nOutput: 3`,
    ],
    editorial: `Track the current depth (distance from root) as an integer.\n- "../": depth = max(0, depth - 1).\n- "./": depth stays the same.\n- "x/": depth += 1.\nReturn the final depth.\nTime complexity: O(n), Space complexity: O(1).`,
    aiHints: `Track depth as a single integer — no need for an actual stack\nEach named folder increments depth, "../" decrements (min 0), "./" is a no-op\nReturn the final depth`,
    testCases: [
      { input: "d1/ d2/ ../ d21/ ./", expectedOutput: "2", displayInput: 'logs = ["d1/","d2/","../","d21/","./"]', displayOutput: "2", visibility: "PUBLIC" },
      { input: "d1/ d2/ ./ d3/ ../ d31/", expectedOutput: "3", displayInput: 'logs = ["d1/","d2/","./","d3/","../","d31/"]', displayOutput: "3", visibility: "PUBLIC" },
      { input: "../", expectedOutput: "0", visibility: "PRIVATE" },
      { input: "d1/ ../ d2/ ../", expectedOutput: "0", visibility: "PRIVATE" },
      { input: "a/ b/ c/ d/ ../", expectedOutput: "3", visibility: "PRIVATE" },
    ],
  },
];

const MEDIUM_PROBLEMS = [
  {
    title: "Daily Temperatures",
    slug: "daily-temperatures",
    difficulty: "medium",
    link: "https://leetcode.com/problems/daily-temperatures/",
    description: `Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day for which this is possible, keep answer[i] == 0 instead.`,
    tags: ["Stack", "Array", "Monotonic Stack"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Bloomberg"],
    examples: [
      `Input: temperatures = [73,74,75,71,69,72,76,73]\nOutput: [1,1,4,2,1,1,0,0]`,
      `Input: temperatures = [30,40,50,60]\nOutput: [1,1,1,0]`,
    ],
    editorial: `Use a monotonic decreasing stack storing indices.\nFor each day i: while the stack is non-empty and temperatures[i] > temperatures[stack top], pop the index j and set answer[j] = i - j.\nPush i onto the stack.\nRemaining indices in the stack have no warmer future day — their answer is 0.\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `Use a monotonic stack of indices — maintain indices in decreasing temperature order\nWhen a warmer temperature is found, it resolves all colder indices waiting in the stack\nThe difference in indices gives the number of days to wait`,
    testCases: [
      { input: "73 74 75 71 69 72 76 73", expectedOutput: "1 1 4 2 1 1 0 0", displayInput: "temperatures = [73,74,75,71,69,72,76,73]", displayOutput: "[1,1,4,2,1,1,0,0]", visibility: "PUBLIC" },
      { input: "30 40 50 60", expectedOutput: "1 1 1 0", displayInput: "temperatures = [30,40,50,60]", displayOutput: "[1,1,1,0]", visibility: "PUBLIC" },
      { input: "30 60 90", expectedOutput: "1 1 0", visibility: "PRIVATE" },
      { input: "89 62 70 58 47 47 46 76 100 70", expectedOutput: "8 1 5 4 3 2 1 1 0 0", visibility: "PRIVATE" },
      { input: "50 50 50", expectedOutput: "0 0 0", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Evaluate Reverse Polish Notation",
    slug: "evaluate-reverse-polish-notation",
    difficulty: "medium",
    link: "https://leetcode.com/problems/evaluate-reverse-polish-notation/",
    description: `You are given an array of strings tokens that represents an arithmetic expression in a Reverse Polish Notation (postfix notation).\n\nEvaluate the expression. Return an integer that represents the value of the expression.\n\nNote: The valid operators are '+', '-', '*', and '/'. Each operand may be an integer or another expression. The division between two integers always truncates toward zero.`,
    tags: ["Stack", "Array", "Math"],
    companies: ["Amazon", "Google", "Microsoft", "LinkedIn"],
    examples: [
      `Input: tokens = ["2","1","+","3","*"]\nOutput: 9\nExplanation: ((2 + 1) * 3) = 9`,
      `Input: tokens = ["4","13","5","/","+"]\nOutput: 6\nExplanation: (4 + (13 / 5)) = 6`,
    ],
    editorial: `Use a stack of integers. For each token:\n- If it's a number, push it.\n- If it's an operator, pop two numbers (b then a), apply the operator (a op b), and push the result.\nNote: division truncates toward zero — use integer division with appropriate handling for negatives.\nReturn the single remaining stack element.\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `Push numbers; on operator pop two values and push the result\nRemember to pop b first then a — order matters for subtraction and division\nDivision truncates toward zero (use int() in Python, integer division in Java/C++)`,
    testCases: [
      { input: "2 1 + 3 *", expectedOutput: "9", displayInput: 'tokens = ["2","1","+","3","*"]', displayOutput: "9", visibility: "PUBLIC" },
      { input: "4 13 5 / +", expectedOutput: "6", displayInput: 'tokens = ["4","13","5","/","+"]', displayOutput: "6", visibility: "PUBLIC" },
      { input: "10 6 9 3 + -11 * / * 17 + 5 +", expectedOutput: "22", displayInput: 'tokens = ["10","6","9","3","+","-11","*","/","*","17","+","5","+"]', displayOutput: "22", visibility: "PUBLIC" },
      { input: "3 4 -", expectedOutput: "-1", visibility: "PRIVATE" },
      { input: "6 -132 /", expectedOutput: "0", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Online Stock Span",
    slug: "online-stock-span",
    difficulty: "medium",
    link: "https://leetcode.com/problems/online-stock-span/",
    description: `Design an algorithm that collects daily price quotes for some asset and returns the span of that asset's price for the current day.\n\nThe span of the asset's price today is defined as the maximum number of consecutive days (starting from today and going backward) for which the stock price was less than or equal to today's price.\n\nImplement the StockSpanner class:\n- StockSpanner() Initializes the object of the class.\n- int next(int price) Returns the span of the given price for the current day.`,
    tags: ["Stack", "Design", "Monotonic Stack", "Data Stream"],
    companies: ["Amazon", "Google", "Microsoft", "Facebook"],
    examples: [
      `Input: ["StockSpanner","next","next","next","next","next","next","next"]\n[[], [100], [80], [60], [70], [60], [75], [85]]\nOutput: [null,1,1,1,2,1,4,6]`,
    ],
    editorial: `Use a monotonic decreasing stack of (price, span) pairs.\nFor each new price, initialize span = 1.\nWhile the stack top price <= current price, pop it and add its span to current span (collapsing consecutive non-greater days).\nPush (price, span) and return span.\nTime complexity: amortized O(1) per call, Space complexity: O(n).`,
    aiHints: `Store (price, span) pairs in a monotonic decreasing stack\nWhen the new price dominates stack top prices, absorb their spans into the current span\nEach element is pushed and popped at most once — amortized O(1)`,
    testCases: [
      { input: "100\n80\n60\n70\n60\n75\n85", expectedOutput: "1\n1\n1\n2\n1\n4\n6", displayInput: "next(100,80,60,70,60,75,85)", displayOutput: "1,1,1,2,1,4,6", visibility: "PUBLIC" },
      { input: "10\n20\n30\n40\n50", expectedOutput: "1\n2\n3\n4\n5", visibility: "PRIVATE" },
      { input: "50\n40\n30\n20\n10", expectedOutput: "1\n1\n1\n1\n1", visibility: "PRIVATE" },
      { input: "5\n5\n5\n5", expectedOutput: "1\n2\n3\n4", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Decode String",
    slug: "decode-string",
    difficulty: "medium",
    link: "https://leetcode.com/problems/decode-string/",
    description: `Given an encoded string, return its decoded string.\n\nThe encoding rule is: k[encoded_string], where the encoded_string inside the square brackets is being repeated exactly k times. You may assume that the input string is always valid — no extra white spaces, square brackets are well-formed, etc. Furthermore, you may assume that the original data does not contain any digits and that all the integers in the input represent repetition numbers that are k > 0.\n\nNote: The integers can be multi-digit.`,
    tags: ["Stack", "String", "Recursion"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    examples: [
      `Input: s = "3[a]2[bc]"\nOutput: "aaabcbc"`,
      `Input: s = "3[a2[c]]"\nOutput: "accaccacc"`,
    ],
    editorial: `Use two stacks: one for repeat counts and one for string prefixes.\nWhen you see a digit, accumulate the number.\nWhen you see '[': push current count and current string onto stacks, reset both.\nWhen you see ']': pop count and prefix, repeat current string count times, prepend prefix.\nWhen you see a letter: append to current string.\nTime complexity: O(output length), Space complexity: O(depth * max_string_length).`,
    aiHints: `Two stacks: one for repeat counts, one for the string built so far before the bracket\nOn '[': save current state to stacks; on ']': restore and repeat\nBuild up the number when you see digits (can be multi-digit)`,
    testCases: [
      { input: "3[a]2[bc]", expectedOutput: "aaabcbc", displayInput: 's = "3[a]2[bc]"', displayOutput: '"aaabcbc"', visibility: "PUBLIC" },
      { input: "3[a2[c]]", expectedOutput: "accaccacc", displayInput: 's = "3[a2[c]]"', displayOutput: '"accaccacc"', visibility: "PUBLIC" },
      { input: "2[abc]3[cd]ef", expectedOutput: "abcabccdcdcdef", visibility: "PRIVATE" },
      { input: "10[a]", expectedOutput: "aaaaaaaaaa", visibility: "PRIVATE" },
      { input: "2[3[a]b]", expectedOutput: "aaabaaab", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Asteroid Collision",
    slug: "asteroid-collision",
    difficulty: "medium",
    link: "https://leetcode.com/problems/asteroid-collision/",
    description: `We are given an array asteroids of integers representing asteroids in a row. The absolute value represents its size, and the sign represents its direction (positive meaning right, negative meaning left). Each asteroid moves at the same speed.\n\nFind out the state of the asteroids after all collisions. If two asteroids meet, the smaller one will explode. If both are the same size, both will explode. Two asteroids moving in the same direction will never meet.`,
    tags: ["Stack", "Array", "Simulation"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    examples: [
      `Input: asteroids = [5,10,-5]\nOutput: [5,10]`,
      `Input: asteroids = [8,-8]\nOutput: []`,
      `Input: asteroids = [10,2,-5]\nOutput: [10]`,
    ],
    editorial: `Use a stack. For each asteroid:\n- If moving right (+), push it.\n- If moving left (-): while stack top is positive and smaller in absolute value, pop it (explodes). If stack top == |asteroid|, pop it (mutual destroy) and skip. If stack top is larger or stack is empty or top is negative, push (or discard if destroyed).\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `Only collisions between a right-moving (positive) top and a left-moving (negative) incoming asteroid matter\nPop right-movers from the stack when the incoming left-mover is larger\nIf sizes are equal, pop the stack top and discard the incoming asteroid`,
    testCases: [
      { input: "5 10 -5", expectedOutput: "5 10", displayInput: "asteroids = [5,10,-5]", displayOutput: "[5,10]", visibility: "PUBLIC" },
      { input: "8 -8", expectedOutput: "", displayInput: "asteroids = [8,-8]", displayOutput: "[]", visibility: "PUBLIC" },
      { input: "10 2 -5", expectedOutput: "10", displayInput: "asteroids = [10,2,-5]", displayOutput: "[10]", visibility: "PUBLIC" },
      { input: "-2 -1 1 2", expectedOutput: "-2 -1 1 2", visibility: "PRIVATE" },
      { input: "1 -2 2 -1", expectedOutput: "-2 2", visibility: "PRIVATE" },
    ],
  },
  {
    title: "132 Pattern",
    slug: "132-pattern",
    difficulty: "medium",
    link: "https://leetcode.com/problems/132-pattern/",
    description: `Given an array of n integers nums, a 132 pattern is a subsequence of three integers nums[i], nums[j] and nums[k] such that i < j < k and nums[i] < nums[k] < nums[j].\n\nReturn true if there is a 132 pattern in nums, otherwise return false.`,
    tags: ["Stack", "Array", "Monotonic Stack", "Binary Search", "Ordered Set"],
    companies: ["Amazon", "Google", "Facebook"],
    examples: [
      `Input: nums = [1,2,3,4]\nOutput: false`,
      `Input: nums = [3,1,4,2]\nOutput: true`,
    ],
    editorial: `Traverse from right to left with a monotonic stack.\nTrack k (the "32" part — the value just below the stack, our nums[k] candidate) as the largest popped value.\nFor each element from the right: if it is less than k, we found nums[i] < nums[k] < nums[j] — return true.\nPop elements from the stack smaller than current (updating k), then push current.\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `Traverse right to left; maintain a monotonic decreasing stack and track the "third element" k\nWhenever you pop from the stack, update k — k represents the best nums[k] candidate seen so far\nIf any element is less than k, the 132 pattern exists`,
    testCases: [
      { input: "1 2 3 4", expectedOutput: "false", displayInput: "nums = [1,2,3,4]", displayOutput: "false", visibility: "PUBLIC" },
      { input: "3 1 4 2", expectedOutput: "true", displayInput: "nums = [3,1,4,2]", displayOutput: "true", visibility: "PUBLIC" },
      { input: "-1 3 2 0", expectedOutput: "true", displayInput: "nums = [-1,3,2,0]", displayOutput: "true", visibility: "PUBLIC" },
      { input: "1 0 1 -4 -3", expectedOutput: "false", visibility: "PRIVATE" },
      { input: "3 5 0 3 4", expectedOutput: "true", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Number of Visible People in a Queue",
    slug: "number-of-visible-people-in-a-queue",
    difficulty: "medium",
    link: "https://leetcode.com/problems/number-of-visible-people-in-a-queue/",
    description: `There are n people standing in a queue, and they numbered from 0 to n - 1 in left to right order. You are given an array heights of distinct integers where heights[i] represents the height of the ith person.\n\nA person can see another person to their right in the queue if everybody in between is shorter than both of them. More formally, the ith person can see the jth person if i < j and min(heights[i], heights[j]) > max(heights[i+1], heights[j-1]).\n\nReturn an array answer of length n where answer[i] is the number of people the ith person can see to their right.`,
    tags: ["Stack", "Array", "Monotonic Stack"],
    companies: ["Amazon", "Google", "Facebook"],
    examples: [
      `Input: heights = [10,6,8,5,11,9]\nOutput: [3,1,2,1,1,0]`,
      `Input: heights = [5,1,2,3,10]\nOutput: [4,1,1,1,0]`,
    ],
    editorial: `Use a monotonic decreasing stack traversing from right to left.\nFor each person i: count how many people are popped from the stack (visible and then blocked). If the stack is non-empty after popping, add 1 more (the first person taller than current).\nPush current person's height.\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `Traverse right to left with a monotonic stack\nEach person popped is visible to the current person (and blocks further view)\nIf the stack is still non-empty after popping, the top is also visible (the first blocker)`,
    testCases: [
      { input: "10 6 8 5 11 9", expectedOutput: "3 1 2 1 1 0", displayInput: "heights = [10,6,8,5,11,9]", displayOutput: "[3,1,2,1,1,0]", visibility: "PUBLIC" },
      { input: "5 1 2 3 10", expectedOutput: "4 1 1 1 0", displayInput: "heights = [5,1,2,3,10]", displayOutput: "[4,1,1,1,0]", visibility: "PUBLIC" },
      { input: "1", expectedOutput: "0", visibility: "PRIVATE" },
      { input: "4 3 2 1", expectedOutput: "1 1 1 0", visibility: "PRIVATE" },
      { input: "1 2 3 4", expectedOutput: "1 1 1 0", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Simplify Path",
    slug: "simplify-path",
    difficulty: "medium",
    link: "https://leetcode.com/problems/simplify-path/",
    description: `Given an absolute path for a Unix-style file system, which begins with a slash '/', transform this path into its simplified canonical path.\n\nIn Unix-style file system:\n- A single period '.' refers to the current directory.\n- A double period '..' refers to the parent directory.\n- Multiple consecutive slashes '//' are treated as a single slash '/'.\n\nThe simplified canonical path should start with '/', and two directory names are separated by a single '/'. It should not end with '/' unless it is the root directory. It should not have any single or double periods.`,
    tags: ["Stack", "String"],
    companies: ["Facebook", "Amazon", "Google", "Microsoft"],
    examples: [
      `Input: path = "/home/"\nOutput: "/home"`,
      `Input: path = "/home//foo/"\nOutput: "/home/foo"`,
      `Input: path = "/home/user/Documents/../Pictures"\nOutput: "/home/user/Pictures"`,
    ],
    editorial: `Split the path by '/'. Use a stack.\nFor each component:\n- Skip empty strings and '.'.\n- For '..': pop the stack if non-empty.\n- Otherwise push the directory name.\nJoin the stack with '/' and prepend '/'\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `Split by '/' to get components; skip empty parts and single dots\nFor '..' pop the stack (go up); for any real name push it\nJoin with '/' and prepend a leading slash`,
    testCases: [
      { input: "/home/", expectedOutput: "/home", displayInput: 'path = "/home/"', displayOutput: '"/home"', visibility: "PUBLIC" },
      { input: "/home//foo/", expectedOutput: "/home/foo", displayInput: 'path = "/home//foo/"', displayOutput: '"/home/foo"', visibility: "PUBLIC" },
      { input: "/home/user/Documents/../Pictures", expectedOutput: "/home/user/Pictures", displayInput: 'path = "/home/user/Documents/../Pictures"', displayOutput: '"/home/user/Pictures"', visibility: "PUBLIC" },
      { input: "/../", expectedOutput: "/", visibility: "PRIVATE" },
      { input: "/a/./b/../../c/", expectedOutput: "/c", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Maximum Width Ramp",
    slug: "maximum-width-ramp",
    difficulty: "medium",
    link: "https://leetcode.com/problems/maximum-width-ramp/",
    description: `A ramp in an integer array nums is a pair (i, j) for which i < j and nums[i] <= nums[j]. The width of such a ramp is j - i.\n\nReturn the maximum width of a ramp in nums. If there is no ramp, return 0.`,
    tags: ["Stack", "Array", "Monotonic Stack", "Two Pointers"],
    companies: ["Amazon", "Google"],
    examples: [
      `Input: nums = [6,0,8,2,1,5]\nOutput: 4`,
      `Input: nums = [9,8,1,0,1,9,4,0,4,1]\nOutput: 7`,
    ],
    editorial: `Build a monotonically decreasing stack of candidate left indices (only add index i if nums[i] < all elements to its left in the stack).\nThen scan from the right: for each j, while the stack top index i satisfies nums[i] <= nums[j], pop and update max width = max(max_width, j - i).\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `Build a decreasing stack of left indices first (only candidates where nums[i] < all previous stack tops)\nScan from right to left to find the farthest valid left index for each j\nPop whenever nums[stack top] <= nums[j] and record the width`,
    testCases: [
      { input: "6 0 8 2 1 5", expectedOutput: "4", displayInput: "nums = [6,0,8,2,1,5]", displayOutput: "4", visibility: "PUBLIC" },
      { input: "9 8 1 0 1 9 4 0 4 1", expectedOutput: "7", displayInput: "nums = [9,8,1,0,1,9,4,0,4,1]", displayOutput: "7", visibility: "PUBLIC" },
      { input: "1", expectedOutput: "0", visibility: "PRIVATE" },
      { input: "0 1", expectedOutput: "1", visibility: "PRIVATE" },
      { input: "1 0", expectedOutput: "0", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Remove K Digits",
    slug: "remove-k-digits",
    difficulty: "medium",
    link: "https://leetcode.com/problems/remove-k-digits/",
    description: `Given string num representing a non-negative integer num, and an integer k, return the smallest possible integer after removing k digits from num.\n\nNote: The result must not contain any leading zeros except for "0" itself.`,
    tags: ["Stack", "String", "Greedy", "Monotonic Stack"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    examples: [
      `Input: num = "1432219", k = 3\nOutput: "1219"`,
      `Input: num = "10200", k = 1\nOutput: "200"`,
    ],
    editorial: `Use a monotonic increasing stack.\nFor each digit: while k > 0 and the stack top is greater than the current digit, pop (remove larger digit) and decrement k.\nPush the current digit.\nIf k > 0 after processing, remove the last k digits.\nStrip leading zeros.\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `Monotonic increasing stack: remove a larger digit when a smaller one arrives (greedy)\nEach pop counts as one removal; stop when k reaches 0\nStrip leading zeros from the final stack result`,
    testCases: [
      { input: "3\n1432219", expectedOutput: "1219", displayInput: 'num = "1432219", k = 3', displayOutput: '"1219"', visibility: "PUBLIC" },
      { input: "1\n10200", expectedOutput: "200", displayInput: 'num = "10200", k = 1', displayOutput: '"200"', visibility: "PUBLIC" },
      { input: "3\n9\n10", expectedOutput: "0", displayInput: 'num = "10", k = 2', displayOutput: '"0"', visibility: "PUBLIC" },
      { input: "2\n1234567890", expectedOutput: "12345678", visibility: "PRIVATE" },
      { input: "1\n112", expectedOutput: "11", visibility: "PRIVATE" },
    ],
  },
];

const HARD_PROBLEMS = [
  {
    title: "Largest Rectangle in Histogram",
    slug: "largest-rectangle-in-histogram",
    difficulty: "hard",
    link: "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    description: `Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.`,
    tags: ["Stack", "Array", "Monotonic Stack"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Apple"],
    examples: [
      `Input: heights = [2,1,5,6,2,3]\nOutput: 10`,
      `Input: heights = [2,4]\nOutput: 4`,
    ],
    editorial: `Use a monotonic increasing stack storing indices.\nFor each bar: while the stack is non-empty and the current height < heights[stack top], pop index i. The width extends from the new stack top + 1 to current index - 1.\nCalculate area = heights[i] * width and update max.\nAppend a sentinel 0 at the end to flush remaining stack.\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `Monotonic increasing stack: when a bar is shorter than the stack top, the top bar's rectangle is complete\nWidth of the popped bar's rectangle extends left to the new stack top and right to the current index\nAppend height 0 at the end to force-pop all remaining bars`,
    testCases: [
      { input: "2 1 5 6 2 3", expectedOutput: "10", displayInput: "heights = [2,1,5,6,2,3]", displayOutput: "10", visibility: "PUBLIC" },
      { input: "2 4", expectedOutput: "4", displayInput: "heights = [2,4]", displayOutput: "4", visibility: "PUBLIC" },
      { input: "1", expectedOutput: "1", visibility: "PRIVATE" },
      { input: "0", expectedOutput: "0", visibility: "PRIVATE" },
      { input: "6 7 5 2 4 5 9 3", expectedOutput: "16", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Maximal Rectangle",
    slug: "maximal-rectangle",
    difficulty: "hard",
    link: "https://leetcode.com/problems/maximal-rectangle/",
    description: `Given a rows x cols binary matrix filled with 0's and 1's, find the largest rectangle containing only 1's and return its area.`,
    tags: ["Stack", "Array", "Dynamic Programming", "Matrix", "Monotonic Stack"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    examples: [
      `Input: matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]\nOutput: 6`,
      `Input: matrix = [["0"]]\nOutput: 0`,
    ],
    editorial: `Build a heights array: for each row and column, heights[j] = number of consecutive 1s above (and including) matrix[row][j].\nAfter building heights for each row, apply the "Largest Rectangle in Histogram" algorithm on that heights array.\nTrack the global maximum across all rows.\nTime complexity: O(m * n), Space complexity: O(n).`,
    aiHints: `Build cumulative column heights row by row (reset to 0 on '0')\nFor each row apply the histogram largest rectangle algorithm on the heights\nTrack the global maximum area across all rows`,
    testCases: [
      { input: "4 5\n1 0 1 0 0\n1 0 1 1 1\n1 1 1 1 1\n1 0 0 1 0", expectedOutput: "6", displayInput: "matrix = [[1,0,1,0,0],[1,0,1,1,1],[1,1,1,1,1],[1,0,0,1,0]]", displayOutput: "6", visibility: "PUBLIC" },
      { input: "1 1\n0", expectedOutput: "0", displayInput: "matrix = [[0]]", displayOutput: "0", visibility: "PUBLIC" },
      { input: "1 1\n1", expectedOutput: "1", visibility: "PRIVATE" },
      { input: "2 2\n1 1\n1 1", expectedOutput: "4", visibility: "PRIVATE" },
      { input: "3 3\n1 1 0\n1 1 1\n0 1 1", expectedOutput: "4", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Basic Calculator",
    slug: "basic-calculator",
    difficulty: "hard",
    link: "https://leetcode.com/problems/basic-calculator/",
    description: `Given a string s representing a valid expression, implement a basic calculator to evaluate it, and return the result of the evaluation.\n\nNote: You are not allowed to use any built-in function which evaluates strings as mathematical expressions, such as eval().\n\nThe expression contains non-negative integers, '+', '-', '(' and ')', and spaces.`,
    tags: ["Stack", "Math", "String", "Recursion"],
    companies: ["Facebook", "Amazon", "Google", "Microsoft"],
    examples: [
      `Input: s = "1 + 1"\nOutput: 2`,
      `Input: s = " 2-1 + 2 "\nOutput: 3`,
      `Input: s = "(1+(4+5+2)-3)+(6+8)"\nOutput: 23`,
    ],
    editorial: `Use a stack to handle parentheses. Track current number, current result, and current sign (+1 or -1).\nOn '(': push current result and sign onto the stack, reset result and sign.\nOn ')': pop sign and previous result, combine: result = popped_result + popped_sign * result.\nFor digits: accumulate the current number.\nFor '+'/'-': add sign*num to result, update sign, reset num.\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `Stack stores (result_so_far, sign_before_paren) when entering a parenthesis\nOn ')' combine: result = stored_result + stored_sign * current_result\nTrack current number and sign; flush before each operator and at string end`,
    testCases: [
      { input: "1 + 1", expectedOutput: "2", displayInput: 's = "1 + 1"', displayOutput: "2", visibility: "PUBLIC" },
      { input: " 2-1 + 2 ", expectedOutput: "3", displayInput: 's = " 2-1 + 2 "', displayOutput: "3", visibility: "PUBLIC" },
      { input: "(1+(4+5+2)-3)+(6+8)", expectedOutput: "23", displayInput: 's = "(1+(4+5+2)-3)+(6+8)"', displayOutput: "23", visibility: "PUBLIC" },
      { input: "-(3+(4-2))", expectedOutput: "-5", visibility: "PRIVATE" },
      { input: "100 + (200 - 50)", expectedOutput: "250", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Sliding Window Maximum",
    slug: "sliding-window-maximum",
    difficulty: "hard",
    link: "https://leetcode.com/problems/sliding-window-maximum/",
    description: `You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position.\n\nReturn the max sliding window (array of maximums).`,
    tags: ["Stack", "Queue", "Array", "Sliding Window", "Monotonic Queue", "Heap"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Bloomberg"],
    examples: [
      `Input: nums = [1,3,-1,-3,5,3,6,7], k = 3\nOutput: [3,3,5,5,6,7]`,
      `Input: nums = [1], k = 1\nOutput: [1]`,
    ],
    editorial: `Use a monotonic decreasing deque storing indices.\nFor each index i:\n- Remove indices from the front if they're out of the window (index <= i - k).\n- Remove indices from the back while nums[back] <= nums[i] (they can never be the max).\n- Push i to the back.\n- If i >= k-1, the front of the deque is the max of the current window.\nTime complexity: O(n), Space complexity: O(k).`,
    aiHints: `Monotonic decreasing deque stores indices of potential maximums\nRemove from the front if the index is out of the window\nRemove from the back while the back value is <= current (they're dominated)`,
    testCases: [
      { input: "3\n1 3 -1 -3 5 3 6 7", expectedOutput: "3 3 5 5 6 7", displayInput: "nums = [1,3,-1,-3,5,3,6,7], k = 3", displayOutput: "[3,3,5,5,6,7]", visibility: "PUBLIC" },
      { input: "1\n1", expectedOutput: "1", displayInput: "nums = [1], k = 1", displayOutput: "[1]", visibility: "PUBLIC" },
      { input: "3\n1 3 1 2 0 5", expectedOutput: "3 3 2 5", visibility: "PRIVATE" },
      { input: "2\n7 2 4", expectedOutput: "7 4", visibility: "PRIVATE" },
      { input: "3\n-7 -8 7 5 7 1 6 0", expectedOutput: "-7 7 7 7 7 6", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Maximum Frequency Stack",
    slug: "maximum-frequency-stack",
    difficulty: "hard",
    link: "https://leetcode.com/problems/maximum-frequency-stack/",
    description: `Design a stack-like data structure to push elements to the stack and pop the most frequent element from the stack.\n\nImplement the FreqStack class:\n- FreqStack() constructs an empty frequency stack.\n- void push(int val) pushes an integer val onto the top of the stack.\n- int pop() removes and returns the most frequent element in the stack. If there is a tie for the most frequent element, the element closest to the top of the stack is removed and returned.`,
    tags: ["Stack", "Hash Table", "Design", "Ordered Set"],
    companies: ["Amazon", "Google", "Facebook", "Twitter"],
    examples: [
      `Input: ["FreqStack","push","push","push","push","push","push","pop","pop","pop","pop"]\n[[], [5], [7], [5], [7], [4], [5], [], [], [], []]\nOutput: [null,null,null,null,null,null,null,5,7,5,4]`,
    ],
    editorial: `Maintain two maps:\n- freq: val → frequency count.\n- group: frequency → stack of values with that frequency.\n- Track maxFreq.\n\npush(val): increment freq[val]; push val to group[freq[val]]; update maxFreq.\npop(): pop from group[maxFreq] (most recent at that frequency); decrement freq of that val; if group[maxFreq] is empty, decrement maxFreq.\nTime complexity: O(1) both operations, Space complexity: O(n).`,
    aiHints: `Map each frequency to a stack of elements that currently have that frequency\nTrack the current maximum frequency globally\nOn pop, take from the max-frequency stack; decrement maxFreq if that stack becomes empty`,
    testCases: [
      { input: "push 5\npush 7\npush 5\npush 7\npush 4\npush 5\npop\npop\npop\npop", expectedOutput: "null\nnull\nnull\nnull\nnull\nnull\n5\n7\n5\n4", displayInput: "push(5,7,5,7,4,5) then pop×4", displayOutput: "5,7,5,4", visibility: "PUBLIC" },
      { input: "push 1\npush 1\npush 2\npush 2\npop\npop\npop\npop", expectedOutput: "null\nnull\nnull\nnull\n2\n1\n2\n1", visibility: "PRIVATE" },
      { input: "push 3\npop\npush 3\npop", expectedOutput: "null\n3\nnull\n3", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Serialize and Deserialize BST",
    slug: "serialize-and-deserialize-bst",
    difficulty: "hard",
    link: "https://leetcode.com/problems/serialize-and-deserialize-bst/",
    description: `Serialization is converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment.\n\nDesign an algorithm to serialize and deserialize a binary search tree. There is no restriction on how your serialization/deserialization algorithm should work. You need to ensure that a BST can be serialized to a string, and this string can be deserialized to the original tree structure.\n\nThe encoded string should be as compact as possible.`,
    tags: ["Stack", "Tree", "Depth-First Search", "Breadth-First Search", "Design", "Binary Search Tree"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    examples: [
      `Input: root = [2,1,3]\nOutput: [2,1,3]`,
      `Input: root = []\nOutput: []`,
    ],
    editorial: `Serialize using preorder DFS (root, left, right) — for BSTs, preorder uniquely determines the tree.\nDeserialize using a stack (or queue) and BST insertion rules:\n- Use a min-heap / bounds approach: reconstruct by passing allowed value ranges.\n- For each value, insert as left child if it is less than the parent bound, else right child.\nTime complexity: O(n log n) worst case (skewed), O(n) average, Space complexity: O(n).`,
    aiHints: `Preorder traversal uniquely defines a BST — use it for serialization\nFor deserialization, use value bounds to reconstruct: left subtree values < root, right subtree values > root\nA stack or recursive approach with (min, max) bounds works cleanly`,
    testCases: [
      { input: "2 1 3", expectedOutput: "2 1 3", displayInput: "root = [2,1,3]", displayOutput: "[2,1,3]", visibility: "PUBLIC" },
      { input: "", expectedOutput: "", displayInput: "root = []", displayOutput: "[]", visibility: "PUBLIC" },
      { input: "4 2 5 1 3", expectedOutput: "4 2 5 1 3", visibility: "PRIVATE" },
      { input: "1 2 3 4 5", expectedOutput: "1 2 3 4 5", visibility: "PRIVATE" },
      { input: "5", expectedOutput: "5", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Maximum Score from Performing Multiplication Operations",
    slug: "max-score-from-performing-multiplication-ops",
    difficulty: "hard",
    link: "https://leetcode.com/problems/maximum-score-from-performing-multiplication-operations/",
    description: `You are given two integer arrays nums and multipliers of size n and m respectively, where n >= m. The arrays are 1-indexed.\n\nYou begin with a score of 0. You want to perform exactly m operations. On the ith operation (1-indexed), you will:\n- Choose one integer x from either the start or the end of the array nums.\n- Add multipliers[i] * x to your score.\n- Remove x from nums.\n\nReturn the maximum score after performing m operations.`,
    tags: ["Stack", "Array", "Dynamic Programming"],
    companies: ["Amazon", "Google", "DoorDash"],
    examples: [
      `Input: nums = [1,2,3], multipliers = [3,2,1]\nOutput: 14\nExplanation: 3*3 + 2*2 + 1*1 = 14`,
      `Input: nums = [-5,-3,-3,-2,7,1], multipliers = [-10,-5,3,4]\nOutput: 102`,
    ],
    editorial: `DP approach: dp[i][j] = max score after i operations where j were taken from the left (so i-j were taken from the right).\nAt step i, the right index = n - 1 - (i - j).\nTransition: dp[i][j] = max(dp[i-1][j-1] + mult[i-1]*nums[j-1], dp[i-1][j] + mult[i-1]*nums[n-(i-j)])\nTime complexity: O(m²), Space complexity: O(m²) or O(m) with rolling array.`,
    aiHints: `DP: track (operation_index, left_picks) — right picks = operation_index - left_picks\nFor each state decide: pick from left or right\nRight index in original array = n - 1 - right_picks = n - 1 - (i - j)`,
    testCases: [
      { input: "3 3\n1 2 3\n3 2 1", expectedOutput: "14", displayInput: "nums = [1,2,3], multipliers = [3,2,1]", displayOutput: "14", visibility: "PUBLIC" },
      { input: "6 4\n-5 -3 -3 -2 7 1\n-10 -5 3 4", expectedOutput: "102", displayInput: "nums = [-5,-3,-3,-2,7,1], multipliers = [-10,-5,3,4]", displayOutput: "102", visibility: "PUBLIC" },
      { input: "3 2\n3 1 4\n2 3", expectedOutput: "19", visibility: "PRIVATE" },
      { input: "4 3\n1 -5 2 4\n1 2 3", expectedOutput: "21", visibility: "PRIVATE" },
      { input: "2 2\n2 -1\n-3 4", expectedOutput: "7", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Sum of Subarray Minimums",
    slug: "sum-of-subarray-minimums",
    difficulty: "hard",
    link: "https://leetcode.com/problems/sum-of-subarray-minimums/",
    description: `Given an array of integers arr, find the sum of min(b), where b ranges over every (contiguous) subarray of arr. Since the answer may be large, return the answer modulo 10^9 + 7.`,
    tags: ["Stack", "Array", "Dynamic Programming", "Monotonic Stack"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    examples: [
      `Input: arr = [3,1,2,4]\nOutput: 17\nExplanation: Subarrays: [3],[1],[2],[4],[3,1],[1,2],[2,4],[3,1,2],[1,2,4],[3,1,2,4] with mins 3,1,2,4,1,1,2,1,1,1. Sum=17.`,
      `Input: arr = [11,81,94,43,3]\nOutput: 444`,
    ],
    editorial: `For each element arr[i], count how many subarrays have arr[i] as their minimum.\nUse monotonic stack to find left[i] = distance to previous smaller element, right[i] = distance to next smaller or equal element.\nContribution of arr[i] = arr[i] * left[i] * right[i].\nSum all contributions modulo 10^9+7.\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `For each element, compute how far left and right it remains the minimum using a monotonic stack\nLeft boundary: previous strictly smaller element; right boundary: next smaller or equal element (handle ties carefully)\nContribution = element value × left_distance × right_distance`,
    testCases: [
      { input: "3 1 2 4", expectedOutput: "17", displayInput: "arr = [3,1,2,4]", displayOutput: "17", visibility: "PUBLIC" },
      { input: "11 81 94 43 3", expectedOutput: "444", displayInput: "arr = [11,81,94,43,3]", displayOutput: "444", visibility: "PUBLIC" },
      { input: "1", expectedOutput: "1", visibility: "PRIVATE" },
      { input: "3 3 3", expectedOutput: "20", visibility: "PRIVATE" },
      { input: "1000000000 1000000000", expectedOutput: "999999993", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Longest Valid Parentheses",
    slug: "longest-valid-parentheses",
    difficulty: "hard",
    link: "https://leetcode.com/problems/longest-valid-parentheses/",
    description: `Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.`,
    tags: ["Stack", "String", "Dynamic Programming"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Bloomberg"],
    examples: [
      `Input: s = "(()"\nOutput: 2`,
      `Input: s = ")()())"\nOutput: 4`,
    ],
    editorial: `Use a stack initialized with -1 (as a base index for valid substring calculation).\nFor '(': push index onto stack.\nFor ')': pop from stack. If stack is now empty, push current index as new base. Otherwise, length = current index - stack top, update max.\nTime complexity: O(n), Space complexity: O(n).`,
    aiHints: `Initialize the stack with -1 as a base for length calculation\nFor '(' push index; for ')' pop — if stack is empty push current index as new base\nLength of valid substring = current index - stack top`,
    testCases: [
      { input: "(()", expectedOutput: "2", displayInput: 's = "(()"', displayOutput: "2", visibility: "PUBLIC" },
      { input: ")()())", expectedOutput: "4", displayInput: 's = ")()())"', displayOutput: "4", visibility: "PUBLIC" },
      { input: "", expectedOutput: "0", visibility: "PRIVATE" },
      { input: "()()", expectedOutput: "4", visibility: "PRIVATE" },
      { input: "((((())))", expectedOutput: "8", visibility: "PRIVATE" },
    ],
  },
  {
    title: "Maximal Score After Applying K Operations",
    slug: "maximal-score-after-applying-k-operations",
    difficulty: "hard",
    link: "https://leetcode.com/problems/maximal-score-after-applying-k-operations/",
    description: `You are given a 0-indexed integer array nums and an integer k. You have a starting score of 0.\n\nIn one operation:\n1. Choose an index i such that 0 <= i < nums.length.\n2. Increase your score by nums[i].\n3. Replace nums[i] with ceil(nums[i] / 3).\n\nReturn the maximum possible score after performing exactly k operations.`,
    tags: ["Stack", "Array", "Greedy", "Heap (Priority Queue)"],
    companies: ["Amazon", "Google", "Meta"],
    examples: [
      `Input: nums = [10,10,10,10,10], k = 5\nOutput: 50`,
      `Input: nums = [1,10,3,3,3], k = 3\nOutput: 17`,
    ],
    editorial: `Greedy with a max-heap: always pick the current maximum element for each operation.\nUse a max-heap. For each of k operations: pop the max, add it to score, push ceil(max/3) back.\nTime complexity: O(k log n), Space complexity: O(n).`,
    aiHints: `Greedy: always pick the largest element available — use a max-heap\nAfter picking, replace the element with ceil(value / 3) and push it back\nRepeat k times and accumulate the score`,
    testCases: [
      { input: "5\n10 10 10 10 10", expectedOutput: "50", displayInput: "nums = [10,10,10,10,10], k = 5", displayOutput: "50", visibility: "PUBLIC" },
      { input: "3\n1 10 3 3 3", expectedOutput: "17", displayInput: "nums = [1,10,3,3,3], k = 3", displayOutput: "17", visibility: "PUBLIC" },
      { input: "1\n1", expectedOutput: "1", visibility: "PRIVATE" },
      { input: "3\n10 5 2", expectedOutput: "22", visibility: "PRIVATE" },
      { input: "5\n9", expectedOutput: "13", visibility: "PRIVATE" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// SHEET CONFIGURATION
// ─────────────────────────────────────────────────────────────────

const SHEET_CONFIG = {
  title: "Stacks & Queues Problems",
  description:
    "A curated collection of stack and queue problems for interview prep — covering monotonic stacks, deques, design problems, expression evaluation, histogram area, and sliding window patterns. Frequently asked at FAANG companies across all difficulty levels.",
  sections: [
    {
      title: "Easy Problems",
      description:
        "Foundational stack and queue problems — bracket matching, Min Stack design, two-stack queue simulation, string cleaning, and basic simulation using stacks.",
      difficulty: "easy" as const,
    },
    {
      title: "Medium Problems",
      description:
        "Intermediate stack and queue challenges including monotonic stacks for daily temperatures, asteroid collision, 132 pattern, decode string, stock span, and path simplification.",
      difficulty: "medium" as const,
    },
    {
      title: "Hard Problems",
      description:
        "Advanced stack and queue problems combining monotonic stacks for histogram area, sliding window deque, frequency stack design, and expression evaluation with nested parentheses.",
      difficulty: "hard" as const,
    },
  ],
};

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

seed()
  .then(() => {
    console.log("✨ Seed process completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seed process failed:", error);
    process.exit(1);
  });