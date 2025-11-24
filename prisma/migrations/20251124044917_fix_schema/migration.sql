/*
  Warnings:

  - The `deleted_at` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `LoanDetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `deleted_at` column on the `Odtw` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted_at` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted_at` column on the `Warehouse` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Item_Movement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Loans` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LoanDetail" DROP CONSTRAINT "LoanDetail_loan_id_fkey";

-- DropForeignKey
ALTER TABLE "item_movement_detail" DROP CONSTRAINT "item_movement_detail_item_movement_id_fkey";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "deleted_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LoanDetail" DROP CONSTRAINT "LoanDetail_pkey",
ALTER COLUMN "qty" DROP NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "loan_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "LoanDetail_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LoanDetail_id_seq";

-- AlterTable
ALTER TABLE "Odtw" DROP COLUMN "deleted_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Sku" ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "created_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deleted_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Warehouse" DROP COLUMN "deleted_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- DropTable
DROP TABLE "Item_Movement";

-- DropTable
DROP TABLE "Loans";

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_movement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT,
    "email" TEXT,
    "necessity" TEXT,
    "request_date" TIMESTAMP(3),
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "item_movement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LoanDetail" ADD CONSTRAINT "LoanDetail_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_movement_detail" ADD CONSTRAINT "item_movement_detail_item_movement_id_fkey" FOREIGN KEY ("item_movement_id") REFERENCES "item_movement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
