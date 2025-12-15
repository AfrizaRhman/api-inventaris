/*
  Warnings:

  - The `deleted_at` column on the `Odtw` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `created_at` column on the `Sku` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted_at` column on the `loan_details` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updated_at` to the `Sku` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Odtw" DROP COLUMN "deleted_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Sku" DROP COLUMN "created_at",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "updated_at",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "loan_details" DROP COLUMN "deleted_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);
