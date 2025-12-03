/*
  Warnings:

  - You are about to drop the `Item_Movement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "item_movement_detail" DROP CONSTRAINT "item_movement_detail_item_movement_id_fkey";

-- AlterTable
ALTER TABLE "item_movement_detail" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- DropTable
DROP TABLE "Item_Movement";

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
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "item_movement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "item_movement_detail" ADD CONSTRAINT "item_movement_detail_item_movement_id_fkey" FOREIGN KEY ("item_movement_id") REFERENCES "item_movement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
