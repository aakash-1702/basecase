/*
  Warnings:

  - You are about to drop the column `confidence` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `solvedAt` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "confidence",
DROP COLUMN "notes",
DROP COLUMN "solvedAt";
