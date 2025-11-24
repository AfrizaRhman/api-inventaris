/*
  Warnings:

  - The primary key for the `LoanDetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `LoanDetail` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `created_at` column on the `Sku` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted_at` column on the `Sku` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_at` column on the `Sku` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Loan` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `loan_id` on the `LoanDetail` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `qty` on table `LoanDetail` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "LoanDetail" DROP CONSTRAINT "LoanDetail_loan_id_fkey";

-- AlterTable
ALTER TABLE "LoanDetail" DROP CONSTRAINT "LoanDetail_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "loan_id",
ADD COLUMN     "loan_id" INTEGER NOT NULL,
ALTER COLUMN "qty" SET NOT NULL,
ADD CONSTRAINT "LoanDetail_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Sku" DROP COLUMN "created_at",
ADD COLUMN     "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "deleted_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
DROP COLUMN "updated_at",
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- DropTable
DROP TABLE "Loan";

-- CreateTable
CREATE TABLE "Loans" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Loans_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LoanDetail" ADD CONSTRAINT "LoanDetail_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "Loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
