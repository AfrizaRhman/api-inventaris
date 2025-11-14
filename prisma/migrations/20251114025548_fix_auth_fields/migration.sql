-- AlterTable
ALTER TABLE "User" ADD COLUMN     "created_at" INTEGER DEFAULT 0,
ADD COLUMN     "deleted_at" INTEGER,
ADD COLUMN     "odtw_id" TEXT,
ADD COLUMN     "password_reset_expires" INTEGER,
ADD COLUMN     "password_reset_token" TEXT,
ADD COLUMN     "updated_at" INTEGER DEFAULT 0,
ADD COLUMN     "user_id" TEXT;

-- CreateTable
CREATE TABLE "Odtw" (
    "id" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "Odtw_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_odtw_id_fkey" FOREIGN KEY ("odtw_id") REFERENCES "Odtw"("id") ON DELETE SET NULL ON UPDATE CASCADE;
