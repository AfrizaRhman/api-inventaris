/*
  Warnings:

  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `knowledges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `odtws` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `skus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `units` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `warehouses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_category_id_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "knowledges" DROP CONSTRAINT "knowledges_odtw_id_fkey";

-- DropForeignKey
ALTER TABLE "skus" DROP CONSTRAINT "skus_item_id_fkey";

-- DropForeignKey
ALTER TABLE "skus" DROP CONSTRAINT "skus_warehouse_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_odtw_id_fkey";

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "items";

-- DropTable
DROP TABLE "knowledges";

-- DropTable
DROP TABLE "odtws";

-- DropTable
DROP TABLE "skus";

-- DropTable
DROP TABLE "units";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "warehouses";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "status" TEXT,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "warehouse_id" TEXT,
    "name" TEXT NOT NULL,
    "supplier" TEXT,
    "price" INTEGER,
    "stock" INTEGER NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "image" TEXT,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SKU" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,

    CONSTRAINT "SKU_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemMovement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "memo_number" TEXT,
    "email" TEXT,
    "necessity" TEXT,
    "request_date" TIMESTAMP(3),
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ItemMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemMovementDetail" (
    "id" TEXT NOT NULL,
    "item_movement_id" TEXT NOT NULL,
    "sku_id" TEXT NOT NULL,
    "item_id" TEXT,

    CONSTRAINT "ItemMovementDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT,
    "email" TEXT,
    "necessity" TEXT,
    "note" TEXT,
    "loan_date" TIMESTAMP(3),
    "user_id" TEXT,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanDetail" (
    "id" TEXT NOT NULL,
    "loan_id" TEXT NOT NULL,
    "sku_id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "return_date" TIMESTAMP(3),
    "status" TEXT,

    CONSTRAINT "LoanDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SKU" ADD CONSTRAINT "SKU_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SKU" ADD CONSTRAINT "SKU_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemMovement" ADD CONSTRAINT "ItemMovement_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemMovement" ADD CONSTRAINT "ItemMovement_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemMovementDetail" ADD CONSTRAINT "ItemMovementDetail_item_movement_id_fkey" FOREIGN KEY ("item_movement_id") REFERENCES "ItemMovement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemMovementDetail" ADD CONSTRAINT "ItemMovementDetail_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemMovementDetail" ADD CONSTRAINT "ItemMovementDetail_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanDetail" ADD CONSTRAINT "LoanDetail_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanDetail" ADD CONSTRAINT "LoanDetail_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
