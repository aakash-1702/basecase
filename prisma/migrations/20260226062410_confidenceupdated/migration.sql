/*
  Warnings:

  - You are about to drop the column `confidence` on the `UserProblem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProblem" DROP COLUMN "confidence";

-- DropEnum
DROP TYPE "ConfidenceLevel";
