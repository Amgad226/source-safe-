-- AlterTable
ALTER TABLE "folders" ADD COLUMN     "folder_id" INTEGER;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
