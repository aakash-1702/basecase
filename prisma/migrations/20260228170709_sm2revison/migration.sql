-- AlterTable
ALTER TABLE "UserProblem" ADD COLUMN     "interval" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "nextAttempt" TIMESTAMP(3);
