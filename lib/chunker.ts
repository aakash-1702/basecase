import { Project, SourceFile, SyntaxKind } from "ts-morph";

export interface Chunk {
  filePath: string;
  chunkIndex: number;
  nodeType: string;
  startLine: number;
  endLine: number;
  text: string;
  tokenEstimate: number;
}

const TS_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

const estimateToken = (text: string) => {
  return Math.ceil(text.length / 4);
};

const chunkByLine = (
  filePath: string,
  content: string,
  startIndex: number,
): Chunk[] => {
  const lines = content.split("\n");
  const blockSize = 60; // this is the size fo window which would be becoming the chunk
  const chunks: Chunk[] = [];

  for (let i = 0; i < lines.length; i += blockSize) {
    const blockLines = lines.slice(i, i + blockSize);
    const text = blockLines.join("\n").trim(); // next line ko ek hi line bana do and faltu spaces  hata do
    if (!text) continue; // kuch mila nhi to hata do

    chunks.push({
      filePath,
      chunkIndex: startIndex + chunks.length,
      nodeType: "line_block",
      startLine: i + 1,
      endLine: Math.min(i + blockSize, lines.length),
      text,
      tokenEstimate: estimateToken(text),
    });
  }

  return chunks;
};

// AST stands fro Abstract Syntax Tree : What it does is it tells about the internal tree like structure to the typescript compiler helping in easy execution of function and catching erros early on
const extractionFromAST = (sf: SourceFile, filePath: string): Chunk[] => {
  const raw: {
    startLine: number;
    endLine: number;
    nodeType: string;
    text: string;
  }[] = [];

  for (const fn of sf.getFunctions()) {
    raw.push({
      startLine: fn.getStartLineNumber(),
      endLine: fn.getEndLineNumber(),
      nodeType: "function",
      text: fn.getText(),
    });
  }

  for (const cls of sf.getClasses()) {
    raw.push({
      startLine: cls.getStartLineNumber(),
      endLine: cls.getEndLineNumber(),
      nodeType: "class",
      text: cls.getText(),
    });
  }

  for (const varDecl of sf.getDescendantsOfKind(
    SyntaxKind.VariableDeclaration,
  )) {
    const init = varDecl.getInitializer();
    if (
      init &&
      (init.getKind() === SyntaxKind.ArrowFunction ||
        init.getKind() === SyntaxKind.FunctionExpression)
    ) {
      raw.push({
        startLine: varDecl.getStartLineNumber(),
        endLine: varDecl.getEndLineNumber(),
        nodeType: "arrow_function",
        text: varDecl.getText(),
      });
    }
  }

  if (raw.length == 0) return []; // agar kuch nhi mila to khaali array return kr deni h

  // ab sort krna h startLine ke hissab se taaki overlapping chunks ho hata skein
  raw.sort((a, b) => a.startLine - b.startLine);

  // now classes have been extracted and methods and anonymous functions as well
  const cleanedChunks: typeof raw = [];

  let prevEnd = -1;
  for (const chunk of raw) {
    if (
      cleanedChunks.length > 0 &&
      chunk.startLine >= cleanedChunks[cleanedChunks.length - 1].startLine &&
      chunk.endLine <= prevEnd
    ) {
      continue; // poora ka poora chunk already covered h
    }
    cleanedChunks.push(chunk);
    prevEnd = chunk.endLine;
  }

  return cleanedChunks.map((c, i) => ({
    filePath,
    chunkIndex: i,
    nodeType: c.nodeType,
    startLine: c.startLine,
    endLine: c.endLine,
    text: c.text.trim(),
    tokenEstimate: estimateToken(c.text), // estimating token cost , so that i can remove those chunks which are very largea and prevent errors
  }));
};

const chunkPrismaSchema = (filePath: string, content: string): Chunk[] => {
  const chunks: Chunk[] = [];
  const lines = content.split("\n");

  let blockStart = -1;
  let blockType = "";
  let blockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(model|enum|type)\s+(\w+)\s*\{/);

    if (match && blockStart === -1) {
      blockStart = i;
      blockType = match[1];
      blockLines = [line];
    } else if (blockStart !== -1) {
      blockLines.push(line);
      if (line.trim() === "}") {
        const text = blockLines.join("\n").trim();
        chunks.push({
          filePath,
          chunkIndex: chunks.length,
          nodeType: `prisma_${blockType}`,
          startLine: blockStart + 1,
          endLine: i + 1,
          text,
          tokenEstimate: estimateToken(text),
        });
        blockStart = -1;
        blockLines = [];
      }
    }
  }

  return chunks;
};

export const chunkFiles = (
  files: {
    path: string;
    content: string;
  }[],
): Chunk[] => {
  const allChunks: Chunk[] = [];

  for (const file of files) {
    if(!file.content || file.content.trim() === "") continue; // agar file khaali hai to usko skip kr do
    const ext = "." + file.path?.split(".").pop()?.toLowerCase();
    let chunks: Chunk[] = [];

    if (TS_EXTENSIONS.includes(ext)) {
      // this project is for typescript files , that ts-morph extension one
      const project = new Project({
        useInMemoryFileSystem: true,
        skipFileDependencyResolution: true,
      });
      const sf = project.createSourceFile(file.path, file.content);
      chunks = extractionFromAST(sf, file.path);

      // agar ast se kuch nhi mila to line by line , sliding window formatted chunking krni pdegi
      if (chunks.length == 0) {
        chunks = chunkByLine(file.path, file.content, 0);
      }
    } else if (file.path.endsWith("schema.prisma")) {
      chunks = chunkPrismaSchema(file.path, file.content);
    } else {
      chunks = chunkByLine(file.path, file.content, 0);
    }

    allChunks.push(...chunks); // phle jitne bhi the , uske saath isko bhi add krdo
  }
  return allChunks;
};
