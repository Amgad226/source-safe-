/*
  Warnings:

  - Added the required column `extension` to the `file_versions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "file_versions" ADD COLUMN     "extension" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "checked_in" BOOLEAN NOT NULL DEFAULT false;
