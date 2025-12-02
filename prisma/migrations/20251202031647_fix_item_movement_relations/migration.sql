/*
  Warnings:

  - You are about to drop the `item_movement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ItemMovementDetail" DROP CONSTRAINT "ItemMovementDetail_item_movement_id_fkey";

-- AlterTable
ALTER TABLE "ItemMovementDetail" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- DropTable
DROP TABLE "item_movement";

-- CreateTable
CREATE TABLE "ItemMovement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT,
    "email" TEXT,
    "necessity" TEXT,
    "request_date" TIMESTAMP(3),
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ItemMovement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ItemMovementDetail" ADD CONSTRAINT "ItemMovementDetail_item_movement_id_fkey" FOREIGN KEY ("item_movement_id") REFERENCES "ItemMovement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
