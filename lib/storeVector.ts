import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import type { Chunk } from "./chunker";
import { create } from "domain";
const openai = new OpenAI();

const client = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

const COLLECTION_NAME = "repo_chunks";
const VECTOR_SIZE = 1536; // text-embedding-004 output size
const BATCH_SIZE = 10; // no of chunks to process at once

// ensuring if the collection exists or not , if not then creating one
const ensureCollection = async () => {
  const collections = await client.getCollections();

  const exists = collections.collections.some(
    // ye check kr raha h ki exists krta h ki nhi collection
    (c) => c.name === COLLECTION_NAME,
  );

  if (!exists) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine", // this tells qdrant how to compare vectors , cosine does in terms of angle or direction not magnitude
      },
    });

    // this indexes help is fast scanning of data or vectors , basically ye jo h metadata h jo vector ke saath attach  ho jaate h taaki fast scanning ho paye ...
    await client.createPayloadIndex(COLLECTION_NAME, {
      field_name: "repoId",
      field_schema: "keyword",
    });
    await client.createPayloadIndex(COLLECTION_NAME, {
      field_name: "userId",
      field_schema: "keyword",
    });

    console.log(`[vectorStore] collection created: ${COLLECTION_NAME}`);
  }

  return true;
};

const createEmbedding = async (text: string[]): Promise<number[][]> => {
  const embeddings = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });

  console.log(embeddings);
  return embeddings.data.map((d) => d.embedding);
};

const embedAndStoreChunks = async (
  chunks: Chunk[],
  repoId: string,
  userId: string,
) => {
  // ensure karo ki collection exists krta ya nhi
  const collectionExists = await ensureCollection();

  if (!collectionExists) return null;

  // delete phle wale vectors
  await client.delete(COLLECTION_NAME, {
    filter: {
      must: [{ key: "repoId", match: { value: repoId } }],
    },
  });

  const now = new Date().toISOString();
  const points = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    // filePath bhi prepend kro taaki embedding model ko context mile
    const texts = batch.map((c) => `// ${c.filePath}\n${c.text}`);
    const vectors = await createEmbedding(texts);

    for (let j = 0; j < batch.length; j++) {
      const chunk = batch[j];
      points.push({
        id: uuidv4(),
        vector: vectors[j],
        payload: {
          repoId,
          userId,
          filePath: chunk.filePath,
          chunkIndex: chunk.chunkIndex,
          nodeType: chunk.nodeType,
          startLine: chunk.startLine,
          endLine: chunk.endLine,
          text: chunk.text,
          tokenEstimate: chunk.tokenEstimate,
          lastIndexedAt: now,
        },
      });
    }
  }

  await client.upsert(COLLECTION_NAME, { points, wait: true });
  console.log(
    `[vectorStore] stored ${points.length} chunks for repo ${repoId}`,
  );
};

export type SimilarChunk = {
  text: string;
  filePath: string;
  nodeType: string;
  score: number;
};

const searchSimilarChunk = async (
  query: string,
  repoId: string,
  topK = 8,
): Promise<SimilarChunk[]> => {
  const [queryVector] = await createEmbedding([query]);

  const results = await client.search(COLLECTION_NAME, {
    vector: queryVector,
    limit: topK,
    filter: {
      must: [{ key: "repoId", match: { value: repoId } }],
    },
    with_payload: true,
  });

  return results.map((r) => ({
    text: r.payload?.text as string,
    filePath: r.payload?.filePath as string,
    nodeType: r.payload?.nodeType as string,
    score: r.score,
  }));
};

export { embedAndStoreChunks, searchSimilarChunk };
