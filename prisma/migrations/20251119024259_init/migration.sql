/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deleted_at" INTEGER,
ADD COLUMN     "odtw_id" TEXT;

-- CreateTable
CREATE TABLE "Odtw" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "deleted_at" INTEGER,

    CONSTRAINT "Odtw_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_odtw_id_fkey" FOREIGN KEY ("odtw_id") REFERENCES "Odtw"("id") ON DELETE SET NULL ON UPDATE CASCADE;
