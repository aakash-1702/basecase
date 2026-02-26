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
  await prisma.$executeRawUnsafe(`
    DELETE FROM "_prisma_migrations" 
    WHERE migration_name = '20260226042858_schemachanges'
  `);

  await prisma.$executeRawUnsafe(`
    DROP TYPE IF EXISTS "ConfidenceLevelV2"
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "UserProblem" DROP COLUMN IF EXISTS "newConfidence"
  `);

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
