/*
  Warnings:

  - You are about to drop the `file_verions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "check_in" DROP CONSTRAINT "check_in_file_verion_id_fkey";

-- DropForeignKey
ALTER TABLE "file_verions" DROP CONSTRAINT "file_verions_file_id_fkey";

-- DropTable
DROP TABLE "file_verions";

-- CreateTable
CREATE TABLE "file_versions" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "file_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_versions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "file_versions" ADD CONSTRAINT "file_versions_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_in" ADD CONSTRAINT "check_in_file_verion_id_fkey" FOREIGN KEY ("file_verion_id") REFERENCES "file_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
