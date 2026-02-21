-- AlterTable
ALTER TABLE "user" ADD COLUMN     "confidence" "ConfidenceLevel" NOT NULL DEFAULT 'not_attempted',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "solvedAt" TIMESTAMP(3);
