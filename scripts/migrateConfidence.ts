import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const high = await prisma.$executeRawUnsafe(`
    UPDATE "UserProblem" SET "confidenceV2" = 'HIGH'
    WHERE confidence = 'confident'
  `);

  const medium = await prisma.$executeRawUnsafe(`
    UPDATE "UserProblem" SET "confidenceV2" = 'MEDIUM'
    WHERE confidence = 'needs_revision'
  `);

  const low = await prisma.$executeRawUnsafe(`
    UPDATE "UserProblem" SET "confidenceV2" = 'LOW'
    WHERE confidence IN ('failed', 'skipped', 'not_attempted')
  `);

  console.log(`Migrated: ${high} HIGH, ${medium} MEDIUM, ${low} LOW`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
