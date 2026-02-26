-- CreateEnum
CREATE TYPE "ConfidenceV2" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "UserProblem" ADD COLUMN     "confidenceV2" "ConfidenceV2" NOT NULL DEFAULT 'LOW';
