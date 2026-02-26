-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "editorial" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "premium" BOOLEAN NOT NULL DEFAULT false;
