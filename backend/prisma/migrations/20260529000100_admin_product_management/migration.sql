ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "role" VARCHAR(20) NOT NULL DEFAULT 'user';

ALTER TABLE "products"
ADD COLUMN IF NOT EXISTS "title" VARCHAR(160),
ADD COLUMN IF NOT EXISTS "brand" VARCHAR(120),
ADD COLUMN IF NOT EXISTS "discount_price" INTEGER,
ADD COLUMN IF NOT EXISTS "stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "images" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "thumbnail" VARCHAR(500),
ADD COLUMN IF NOT EXISTS "tags" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "visibility_status" VARCHAR(30) NOT NULL DEFAULT 'visible',
ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;

UPDATE "products"
SET
  "title" = COALESCE("title", "name"),
  "discount_price" = COALESCE("discount_price", "original_price"),
  "stock" = CASE WHEN "stock" = 0 THEN 100 ELSE "stock" END,
  "featured" = CASE WHEN "popularity" >= 90 THEN true ELSE "featured" END
WHERE "title" IS NULL OR "stock" = 0;

CREATE TABLE IF NOT EXISTS "categories" (
  "id" TEXT NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "slug" VARCHAR(140) NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_key" ON "categories"("slug");
CREATE INDEX IF NOT EXISTS "categories_slug_idx" ON "categories"("slug");
CREATE INDEX IF NOT EXISTS "products_visibility_status_idx" ON "products"("visibility_status");
