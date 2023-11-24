-- CreateTable
CREATE TABLE "black_list_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "black_list_tokens_pkey" PRIMARY KEY ("id")
);
