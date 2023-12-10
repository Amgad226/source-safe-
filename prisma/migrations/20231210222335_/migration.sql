-- CreateTable
CREATE TABLE "check_in" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "file_verion_id" INTEGER NOT NULL,
    "file_id" INTEGER NOT NULL,

    CONSTRAINT "check_in_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "check_in" ADD CONSTRAINT "check_in_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_in" ADD CONSTRAINT "check_in_file_verion_id_fkey" FOREIGN KEY ("file_verion_id") REFERENCES "file_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_in" ADD CONSTRAINT "check_in_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
