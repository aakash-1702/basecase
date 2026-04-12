/*
  Warnings:

  - You are about to drop the column `repoName` on the `Interview2` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Interview2" DROP COLUMN "repoName",
ADD COLUMN     "repoId" TEXT;
