/*
  Warnings:

  - You are about to drop the column `email` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `loan_date` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `necessity` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `Loan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "email",
DROP COLUMN "loan_date",
DROP COLUMN "necessity",
DROP COLUMN "note",
DROP COLUMN "phone_number";

-- AlterTable
ALTER TABLE "Sku" ALTER COLUMN "status" DROP DEFAULT;
