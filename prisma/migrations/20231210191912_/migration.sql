/*
  Warnings:

  - You are about to drop the `check_in` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `file_verion_id` to the `file_statistics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `file_statistics` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusEnum" AS ENUM ('check_in', 'check_out');

-- DropForeignKey
ALTER TABLE "check_in" DROP CONSTRAINT "check_in_file_verion_id_fkey";

-- DropForeignKey
ALTER TABLE "check_in" DROP CONSTRAINT "check_in_user_id_fkey";

-- AlterTable
ALTER TABLE "file_statistics" ADD COLUMN     "file_verion_id" INTEGER NOT NULL,
ADD COLUMN     "status" "StatusEnum" NOT NULL,
ALTER COLUMN "text" DROP NOT NULL;

-- DropTable
DROP TABLE "check_in";

-- AddForeignKey
ALTER TABLE "file_statistics" ADD CONSTRAINT "file_statistics_file_verion_id_fkey" FOREIGN KEY ("file_verion_id") REFERENCES "file_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
