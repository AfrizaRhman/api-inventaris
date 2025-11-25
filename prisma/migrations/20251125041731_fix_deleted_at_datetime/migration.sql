/*
  Warnings:

  - The `deleted_at` column on the `Sku` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Sku" DROP COLUMN "deleted_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);
