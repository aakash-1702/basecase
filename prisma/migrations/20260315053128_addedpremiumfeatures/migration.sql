-- AlterTable
ALTER TABLE "user" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "interviewCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "roadmapCredits" INTEGER NOT NULL DEFAULT 0;
