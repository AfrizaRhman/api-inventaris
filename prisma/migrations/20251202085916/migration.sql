/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `Unit` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `Unit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "deleted_at",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
