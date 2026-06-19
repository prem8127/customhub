CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(120) NOT NULL,
  "email" VARCHAR(120) NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "avatar" VARCHAR(8) NOT NULL DEFAULT 'CH',
  "addresses" JSONB NOT NULL DEFAULT '[]',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");

CREATE TABLE "products" (
  "id" VARCHAR(80) PRIMARY KEY,
  "slug" VARCHAR(120) NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "category" VARCHAR(120) NOT NULL,
  "price" INTEGER NOT NULL,
  "original_price" INTEGER,
  "popularity" INTEGER NOT NULL DEFAULT 0,
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
  "badge" VARCHAR(80) NOT NULL,
  "summary" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "turnaround" VARCHAR(80) NOT NULL,
  "features" JSONB NOT NULL DEFAULT '[]',
  "materials" JSONB NOT NULL DEFAULT '[]',
  "accent" VARCHAR(16) NOT NULL,
  "surface" VARCHAR(120) NOT NULL,
  "customizable" BOOLEAN NOT NULL DEFAULT true,
  "art" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE INDEX "products_category_idx" ON "products"("category");
CREATE INDEX "products_slug_idx" ON "products"("slug");

CREATE TABLE "orders" (
  "id" VARCHAR(32) PRIMARY KEY,
  "user_id" INTEGER,
  "status" VARCHAR(40) NOT NULL DEFAULT 'placed',
  "total" INTEGER NOT NULL,
  "payment_method" VARCHAR(80) NOT NULL,
  "shipping_address" JSONB NOT NULL,
  "items" JSONB NOT NULL DEFAULT '[]',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

CREATE TABLE "refresh_tokens" (
  "id" TEXT PRIMARY KEY,
  "token_hash" VARCHAR(255) NOT NULL,
  "user_id" INTEGER NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "revoked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");
