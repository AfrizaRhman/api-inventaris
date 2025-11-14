-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(70) NOT NULL,
    "phone" VARCHAR(20),
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" VARCHAR(10) DEFAULT 'active',
    "password_reset_token" TEXT,
    "password_reset_expires" INTEGER,
    "created_at" INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::integer,
    "updated_at" INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::integer,
    "deleted_at" INTEGER,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "odtw_id" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::integer,
    "updated_at" INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::integer,
    "deleted_at" INTEGER,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::integer,
    "updated_at" INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::integer,
    "deleted_at" INTEGER,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::integer,
    "updated_at" INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::integer,
    "deleted_at" INTEGER,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "suplier" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "created_at" INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::integer,
    "updated_at" INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::integer,
    "deleted_at" INTEGER,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skus" (
    "id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "created_at" INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::integer,
    "updated_at" INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::integer,
    "deleted_at" INTEGER,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "skus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "odtws" (
    "id" UUID NOT NULL,
    "odtw_code" VARCHAR(3) NOT NULL,
    "name" TEXT NOT NULL,
    "ticket_price" INTEGER,
    "address" TEXT,
    "village" TEXT,
    "district" TEXT,
    "city" TEXT,
    "province" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "latitude" TEXT,
    "longitude" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "webhook_url" TEXT,
    "max_device" INTEGER DEFAULT 1,
    "bank_name" TEXT,
    "account_name" TEXT,
    "account_number" TEXT,
    "created_at" INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::integer,
    "updated_at" INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::integer,
    "deleted_at" INTEGER,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "odtws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledges" (
    "id" UUID NOT NULL,
    "odtw_id" UUID NOT NULL,
    "topic_code" VARCHAR(6) NOT NULL,
    "topic" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::integer,
    "updated_at" INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::integer,
    "deleted_at" INTEGER,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "knowledges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "warehouses_name_idx" ON "warehouses"("name");

-- CreateIndex
CREATE INDEX "units_name_idx" ON "units"("name");

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "categories"("name");

-- CreateIndex
CREATE INDEX "items_unit_id_idx" ON "items"("unit_id");

-- CreateIndex
CREATE INDEX "items_category_id_idx" ON "items"("category_id");

-- CreateIndex
CREATE INDEX "items_name_idx" ON "items"("name");

-- CreateIndex
CREATE INDEX "items_code_idx" ON "items"("code");

-- CreateIndex
CREATE INDEX "skus_item_id_idx" ON "skus"("item_id");

-- CreateIndex
CREATE INDEX "skus_warehouse_id_idx" ON "skus"("warehouse_id");

-- CreateIndex
CREATE INDEX "skus_code_idx" ON "skus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "odtws_odtw_code_key" ON "odtws"("odtw_code");

-- CreateIndex
CREATE UNIQUE INDEX "odtws_email_key" ON "odtws"("email");

-- CreateIndex
CREATE UNIQUE INDEX "odtws_phone_key" ON "odtws"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "knowledges_topic_code_key" ON "knowledges"("topic_code");

-- CreateIndex
CREATE INDEX "knowledges_odtw_id_idx" ON "knowledges"("odtw_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_odtw_id_fkey" FOREIGN KEY ("odtw_id") REFERENCES "odtws"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skus" ADD CONSTRAINT "skus_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skus" ADD CONSTRAINT "skus_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledges" ADD CONSTRAINT "knowledges_odtw_id_fkey" FOREIGN KEY ("odtw_id") REFERENCES "odtws"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
