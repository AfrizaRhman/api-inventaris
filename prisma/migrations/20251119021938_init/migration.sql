/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemMovement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemMovementDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Loan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LoanDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Odtw` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SKU` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Unit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_created_by_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_updated_by_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_warehouse_id_fkey";

-- DropForeignKey
ALTER TABLE "ItemMovement" DROP CONSTRAINT "ItemMovement_created_by_fkey";

-- DropForeignKey
ALTER TABLE "ItemMovement" DROP CONSTRAINT "ItemMovement_updated_by_fkey";

-- DropForeignKey
ALTER TABLE "ItemMovementDetail" DROP CONSTRAINT "ItemMovementDetail_item_id_fkey";

-- DropForeignKey
ALTER TABLE "ItemMovementDetail" DROP CONSTRAINT "ItemMovementDetail_item_movement_id_fkey";

-- DropForeignKey
ALTER TABLE "ItemMovementDetail" DROP CONSTRAINT "ItemMovementDetail_sku_id_fkey";

-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_user_id_fkey";

-- DropForeignKey
ALTER TABLE "LoanDetail" DROP CONSTRAINT "LoanDetail_loan_id_fkey";

-- DropForeignKey
ALTER TABLE "LoanDetail" DROP CONSTRAINT "LoanDetail_sku_id_fkey";

-- DropForeignKey
ALTER TABLE "SKU" DROP CONSTRAINT "SKU_item_id_fkey";

-- DropForeignKey
ALTER TABLE "SKU" DROP CONSTRAINT "SKU_warehouse_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_odtw_id_fkey";

-- DropForeignKey
ALTER TABLE "Warehouse" DROP CONSTRAINT "Warehouse_created_by_fkey";

-- DropForeignKey
ALTER TABLE "Warehouse" DROP CONSTRAINT "Warehouse_updated_by_fkey";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Item";

-- DropTable
DROP TABLE "ItemMovement";

-- DropTable
DROP TABLE "ItemMovementDetail";

-- DropTable
DROP TABLE "Loan";

-- DropTable
DROP TABLE "LoanDetail";

-- DropTable
DROP TABLE "Odtw";

-- DropTable
DROP TABLE "SKU";

-- DropTable
DROP TABLE "Unit";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Units" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Items" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "suplier" TEXT,
    "price" INTEGER,
    "stock" INTEGER NOT NULL,
    "description" TEXT,
    "code" TEXT,

    CONSTRAINT "Items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sku" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "color" TEXT,
    "status" TEXT,
    "warehouse_id" TEXT,

    CONSTRAINT "Sku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "email" TEXT,
    "type" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT,
    "email" TEXT,
    "necessity" TEXT,
    "note" TEXT,
    "loan_date" TIMESTAMP(3),

    CONSTRAINT "Loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanDetails" (
    "id" TEXT NOT NULL,
    "loan_id" TEXT NOT NULL,
    "sku_id" TEXT NOT NULL,
    "qty" INTEGER,
    "return_date" TIMESTAMP(3),
    "status" TEXT,

    CONSTRAINT "LoanDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item_Movement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT,
    "email" TEXT,
    "necessity" TEXT,
    "request_date" TIMESTAMP(3),
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "Item_Movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_movement_detail" (
    "id" TEXT NOT NULL,
    "item_movement_id" TEXT NOT NULL,
    "sku_id" TEXT NOT NULL,
    "sku_code" TEXT,

    CONSTRAINT "item_movement_detail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Items" ADD CONSTRAINT "Items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Items" ADD CONSTRAINT "Items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sku" ADD CONSTRAINT "Sku_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sku" ADD CONSTRAINT "Sku_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanDetails" ADD CONSTRAINT "LoanDetails_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "Loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanDetails" ADD CONSTRAINT "LoanDetails_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "Sku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_movement_detail" ADD CONSTRAINT "item_movement_detail_item_movement_id_fkey" FOREIGN KEY ("item_movement_id") REFERENCES "Item_Movement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_movement_detail" ADD CONSTRAINT "item_movement_detail_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "Sku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
