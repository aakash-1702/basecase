// scripts/fix-status.ts
import { config } from "dotenv";
config({ path: ".env" }); // ← load env before anything else

import prisma from "@/lib/prisma";

async function main() {
  // Update all existing interviews with 'processing' status to 'notStarted'
  const result = await prisma.interview.updateMany({
    where: {
      status: "processing",
    },
    data: {
      status: "notStarted",
    },
  });

  console.log(
    `✓ Updated ${result.count} interviews from 'processing' to 'notStarted'`,
  );

  // Verify the change
  const notStartedCount = await prisma.interview.count({
    where: { status: "notStarted" },
  });

  console.log(
    `✓ Total interviews with 'notStarted' status: ${notStartedCount}`,
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
