/*
  Warnings:

  - You are about to drop the column `created_by` on the `loans` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `loans` table. All the data in the column will be lost.
  - The `deleted_at` column on the `loans` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "loans" DROP COLUMN "created_by",
DROP COLUMN "updated_by",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "deleted_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);
