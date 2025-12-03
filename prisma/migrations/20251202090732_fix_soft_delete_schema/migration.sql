/*
  Warnings:

  - The `deleted_at` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted_at` column on the `Sku` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted_at` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted_at` column on the `Warehouse` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "deleted_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Sku" DROP COLUMN "deleted_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deleted_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Warehouse" DROP COLUMN "deleted_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);
