/*
  Warnings:

  - You are about to drop the `Loan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LoanDetail` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LoanDetail" DROP CONSTRAINT "LoanDetail_loan_id_fkey";

-- DropForeignKey
ALTER TABLE "LoanDetail" DROP CONSTRAINT "LoanDetail_sku_id_fkey";

-- DropTable
DROP TABLE "Loan";

-- DropTable
DROP TABLE "LoanDetail";

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT,
    "email" TEXT,
    "necessity" TEXT,
    "note" TEXT,
    "loan_date" TIMESTAMP(3),
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_details" (
    "id" TEXT NOT NULL,
    "loan_id" TEXT NOT NULL,
    "sku_id" TEXT NOT NULL,
    "qty" INTEGER,
    "return_date" TIMESTAMP(3),
    "status" TEXT,

    CONSTRAINT "loan_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "loan_details" ADD CONSTRAINT "loan_details_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_details" ADD CONSTRAINT "loan_details_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "Sku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
