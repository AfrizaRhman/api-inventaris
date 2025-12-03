/*
  Warnings:

  - You are about to drop the column `created_by` on the `loans` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `loans` table. All the data in the column will be lost.
  - The `deleted_at` column on the `loans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `qty` on table `loan_details` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `loan_details` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone_number` on table `loans` required. This step will fail if there are existing NULL values in that column.
  - Made the column `loan_date` on table `loans` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "loan_details" DROP CONSTRAINT "loan_details_loan_id_fkey";

-- AlterTable
ALTER TABLE "loan_details" ADD COLUMN     "deleted_at" INTEGER,
ALTER COLUMN "qty" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL;

-- AlterTable
ALTER TABLE "loans" DROP COLUMN "created_by",
DROP COLUMN "updated_by",
ALTER COLUMN "phone_number" SET NOT NULL,
ALTER COLUMN "loan_date" SET NOT NULL,
ALTER COLUMN "loan_date" SET DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "deleted_at",
ADD COLUMN     "deleted_at" INTEGER;

-- AddForeignKey
ALTER TABLE "loan_details" ADD CONSTRAINT "loan_details_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
