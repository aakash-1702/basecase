-- CreateEnum
CREATE TYPE "INTERVIEWTYPES" AS ENUM ('DSA', 'SYSTEM_DESIGN', 'RESUME', 'GITHUB');

-- CreateEnum
CREATE TYPE "InterviewProgress" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ANALYSIS_PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "Interview2" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interviewType" "INTERVIEWTYPES" NOT NULL,
    "repoLink" TEXT,
    "repoName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "InterviewProgress" NOT NULL DEFAULT 'NOT_STARTED',

    CONSTRAINT "Interview2_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Interview2_userId_idx" ON "Interview2"("userId");
