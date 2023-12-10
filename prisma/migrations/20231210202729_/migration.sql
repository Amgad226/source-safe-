/*
  Warnings:

  - You are about to drop the column `checked_in` on the `files` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "files" DROP COLUMN "checked_in",
ADD COLUMN     "status" "StatusEnum" NOT NULL DEFAULT 'check_out';
