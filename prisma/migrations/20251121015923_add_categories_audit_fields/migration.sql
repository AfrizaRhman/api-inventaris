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
  - Added the required column `updated_at` to the `Categories` table without a default value. This is not possible if the table is not empty.

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

-- AlterTable
ALTER TABLE "Categories" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_by" TEXT;

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
