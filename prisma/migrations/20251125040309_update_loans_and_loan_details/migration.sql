-- AlterTable
ALTER TABLE "loan_details" ADD COLUMN     "deleted_at" INTEGER;

-- AlterTable
ALTER TABLE "loans" ADD COLUMN     "deleted_at" INTEGER;
