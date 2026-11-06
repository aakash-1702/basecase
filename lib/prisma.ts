import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// In mock mode there is no DATABASE_URL; the adapter is still constructed
// (lazily connecting) so importing this module never throws.
const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://mock:mock@127.0.0.1:5432/mock",
});

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
