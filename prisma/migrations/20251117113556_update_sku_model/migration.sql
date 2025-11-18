-- DropForeignKey
ALTER TABLE "SKU" DROP CONSTRAINT "SKU_warehouse_id_fkey";

-- AlterTable
ALTER TABLE "SKU" ALTER COLUMN "warehouse_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SKU" ADD CONSTRAINT "SKU_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
