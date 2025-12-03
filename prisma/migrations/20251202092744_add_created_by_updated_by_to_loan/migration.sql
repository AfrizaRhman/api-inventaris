-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_by" TEXT;
