/*
  Warnings:

  - Added the required column `importance` to the `Suggestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Suggestion" ADD COLUMN     "importance" TEXT NOT NULL;
