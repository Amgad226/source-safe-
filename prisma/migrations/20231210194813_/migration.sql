/*
  Warnings:

  - You are about to drop the column `file_verion_id` on the `file_statistics` table. All the data in the column will be lost.
  - Added the required column `file_version_id` to the `file_statistics` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "file_statistics" DROP CONSTRAINT "file_statistics_file_verion_id_fkey";

-- AlterTable
ALTER TABLE "file_statistics" DROP COLUMN "file_verion_id",
ADD COLUMN     "file_version_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "file_statistics" ADD CONSTRAINT "file_statistics_file_version_id_fkey" FOREIGN KEY ("file_version_id") REFERENCES "file_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
