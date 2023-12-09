/*
  Warnings:

  - Added the required column `file_id` to the `file_verions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "file_verions" ADD COLUMN     "file_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "file_verions" ADD CONSTRAINT "file_verions_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
