/*
  Warnings:

  - You are about to drop the column `extention` on the `files` table. All the data in the column will be lost.
  - Added the required column `extension` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" DROP COLUMN "extention",
ADD COLUMN     "extension" TEXT NOT NULL;
