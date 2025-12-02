/*
  Warnings:

  - You are about to drop the `item_movement_detail` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "item_movement_detail" DROP CONSTRAINT "item_movement_detail_item_movement_id_fkey";

-- DropForeignKey
ALTER TABLE "item_movement_detail" DROP CONSTRAINT "item_movement_detail_sku_id_fkey";

-- DropTable
DROP TABLE "item_movement_detail";

-- CreateTable
CREATE TABLE "ItemMovementDetail" (
    "id" TEXT NOT NULL,
    "sku_id" TEXT NOT NULL,
    "sku_code" TEXT,
    "item_movement_id" TEXT NOT NULL,

    CONSTRAINT "ItemMovementDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ItemMovementDetail" ADD CONSTRAINT "ItemMovementDetail_item_movement_id_fkey" FOREIGN KEY ("item_movement_id") REFERENCES "item_movement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemMovementDetail" ADD CONSTRAINT "ItemMovementDetail_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "Sku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
