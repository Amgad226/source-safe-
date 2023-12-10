/*
  Warnings:

  - You are about to drop the column `file_version_id` on the `check_in` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "check_in" DROP CONSTRAINT "check_in_file_version_id_fkey";

-- AlterTable
ALTER TABLE "check_in" DROP COLUMN "file_version_id";
