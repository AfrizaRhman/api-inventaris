/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "code" TEXT NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT EXTRACT(EPOCH FROM now())::integer,
ALTER COLUMN "updated_at" SET DEFAULT EXTRACT(EPOCH FROM now())::integer;

-- AlterTable
ALTER TABLE "items" ALTER COLUMN "created_at" SET DEFAULT EXTRACT(EPOCH FROM now())::integer,
ALTER COLUMN "updated_at" SET DEFAULT EXTRACT(EPOCH FROM now())::integer;

-- AlterTable
ALTER TABLE "knowledges" ALTER COLUMN "created_at" SET DEFAULT EXTRACT(EPOCH FROM now())::integer,
ALTER COLUMN "updated_at" SET DEFAULT EXTRACT(EPOCH FROM now())::integer;

-- AlterTable
ALTER TABLE "odtws" ALTER COLUMN "created_at" SET DEFAULT EXTRACT(EPOCH FROM now())::integer,
ALTER COLUMN "updated_at" SET DEFAULT EXTRACT(EPOCH FROM now())::integer;

-- AlterTable
ALTER TABLE "skus" ALTER COLUMN "created_at" SET DEFAULT EXTRACT(EPOCH FROM now())::integer,
ALTER COLUMN "updated_at" SET DEFAULT EXTRACT(EPOCH FROM now())::integer;

-- AlterTable
ALTER TABLE "units" ALTER COLUMN "created_at" SET DEFAULT EXTRACT(EPOCH FROM now())::integer,
ALTER COLUMN "updated_at" SET DEFAULT EXTRACT(EPOCH FROM now())::integer;

-- AlterTable
ALTER TABLE "warehouses" ALTER COLUMN "created_at" SET DEFAULT EXTRACT(EPOCH FROM now())::integer,
ALTER COLUMN "updated_at" SET DEFAULT EXTRACT(EPOCH FROM now())::integer;

-- CreateIndex
CREATE UNIQUE INDEX "categories_code_key" ON "categories"("code");
