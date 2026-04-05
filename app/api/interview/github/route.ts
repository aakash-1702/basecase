// finding the information about the github repo
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
import { chunkFiles } from "@/lib/chunker";
import { embedAndStoreChunks, searchSimilarChunk } from "@/lib/storeVector";
import { v4 as uuidv4 } from "uuid";
import { INTERVIEW_CONFIGS, type InterviewType } from "@/lib/interviewTypes";
import { fetchQuestions } from "@/agents/github.scraper.agent";

import { Project, ScriptTarget } from "ts-morph";
import { success } from "zod";

const interview = "backend";

const ALLOWED_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx", // JS/TS
  ".py",
  ".go",
  ".java",
  ".rb", // other languages
  ".c",
  ".cpp",
  ".h", // system languages
  ".json",
  ".yaml",
  ".yml", // config
  ".md",
  ".env.example", // docs/env
]);

const IGNORED_PATHS = [
  "node_modules/",
  ".next/",
  "dist/",
  "build/",
  "out/",
  ".git/",
  "coverage/",
  "__pycache__/",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
];

function isRelevantFile(filePath: any) {
  // 1. Skip if path contains any ignored segment
  const isIgnored = IGNORED_PATHS.some((ignored) => filePath.includes(ignored));
  if (isIgnored) return false;

  // 2. Extract the extension using regex
  const match = filePath.match(/\.([a-zA-Z0-9]+)$/);
  if (!match) return false; // no extension at all → skip

  const ext = "." + match[1].toLowerCase();

  // 3. Check if extension is in our allowlist
  return ALLOWED_EXTENSIONS.has(ext);
}

function parseGithubURL(url: string) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/); // regex for github url parsing
  if (!match) {
    return null;
  }

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""),
  };
}

async function getFileTree(owner: string, repo: string, token: string) {
  const repoData = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!repoData.ok) {
    const error = await repoData.json();
    console.log("Error scraping repo", error);
    return null;
  }

  const data = await repoData.json();

  if (data.truncated) {
    console.log("Tree truncated by github , too large repo");
  }

  //   console.log("Repo data", data);

  return data;
}

async function fetchFileDetails(url: string, token: string) {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    console.log("Error scraping repo", error);
    return null;
  }

  const data = await res.json();

  // github jo h na base64 main data deta h , to usko decode krna pdega
  const decoded = Buffer.from(data.content, "base64").toString("utf-8");

  // Truncate if file is too large (50KB limit)
  return decoded.length > 50000
    ? decoded.slice(0, 50000) + "\n... [truncated]"
    : decoded;
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  /* user would give me the link to the github repo
    now before even starting to scrape - we need to check if the user has enough credits to start an interview
    
    */

  const { repoLink } = await req.json();

  const repoInfo = parseGithubURL(repoLink);

  if (!repoInfo) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Invalid repo link",
      },
      {
        status: 400,
      },
    );
  }

  // fetching the repo details from github
  const fileData = await getFileTree(
    repoInfo.owner,
    repoInfo.repo,
    GITHUB_TOKEN,
  );

  if (!fileData) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Failed to fetch repo details",
      },
      {
        status: 400,
      },
    );
  }

  // taking or extracting the useful files from  the entire tree

  const relevantFiles = fileData.tree
    .filter((entry: any) => entry.type === "blob") // only files, not folders
    .filter((entry: any) => isRelevantFile(entry.path)) // only relevant extensions
    .slice(0, 30);

  const fileContents = await Promise.all(
    relevantFiles.map(async (file: any) => {
      const content = await fetchFileDetails(file.url, GITHUB_TOKEN);
      return {
        path: file.path,
        content,
      };
    }),
  );

  const repoId = uuidv4();
  const userId = session.user.id;

  const chunks = chunkFiles(fileContents); // { path, content }[] → Chunk[]
  await embedAndStoreChunks(chunks, repoId, userId);

  const config = INTERVIEW_CONFIGS[interview as InterviewType];
  if (!config) {
    return NextResponse.json(
      { success: false, data: null, message: "Invalid interviewType" },
      { status: 400 },
    );
  }

  const retrieveData = await searchSimilarChunk(config.searchQuery, repoId, 8);

  // console.log("retrievedData",retrieveData);

  const fetchedQuestions = await fetchQuestions(
    retrieveData,
    config.searchQuery + config.focusInstruction,
  );

  if (!fetchedQuestions) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Failed to generate questions",
      },
      {
        status: 401,
      },
    );
  }

  // now based on these vectors ineed to generate questions and the flow of how the interview should proceed

  return NextResponse.json(
    {
      success: true,
      data: fetchedQuestions,
      message: "Repo details fetched successfully",
    },
    {
      status: 200,
    },
  );

  // need to figure out the user and the repo link
}
