-- CreateEnum
CREATE TYPE "ExampleVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "displayInput" TEXT,
    "displayOutput" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "visibility" "ExampleVisibility" NOT NULL DEFAULT 'PRIVATE',

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
