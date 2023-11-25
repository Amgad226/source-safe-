/*
  Warnings:

  - You are about to drop the column `file_id` on the `check_in` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `files` table. All the data in the column will be lost.
  - Added the required column `file_verion_id` to the `check_in` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "check_in" DROP CONSTRAINT "check_in_file_id_fkey";

-- AlterTable
ALTER TABLE "check_in" DROP COLUMN "file_id",
ADD COLUMN     "fileVerionId" INTEGER,
ADD COLUMN     "file_verion_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "files" DROP COLUMN "deleted_at",
DROP COLUMN "path",
DROP COLUMN "size";

-- CreateTable
CREATE TABLE "file_verions" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_verions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "check_in" ADD CONSTRAINT "check_in_file_verion_id_fkey" FOREIGN KEY ("file_verion_id") REFERENCES "file_verions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
