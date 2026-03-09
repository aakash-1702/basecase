/*
  Warnings:

  - You are about to drop the `InterviewTurn` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "InterviewTurn" DROP CONSTRAINT "InterviewTurn_interviewId_fkey";

-- DropTable
DROP TABLE "InterviewTurn";
