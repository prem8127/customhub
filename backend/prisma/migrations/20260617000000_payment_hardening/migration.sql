-- Make orders.user_id required and add payment_ref column

-- First, delete any orphan orders with no user
DELETE FROM orders WHERE user_id IS NULL;

-- Make user_id NOT NULL
ALTER TABLE orders ALTER COLUMN user_id SET NOT NULL;

-- Add payment_ref column to store Razorpay IDs for audit
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_ref VARCHAR(500);

-- Update foreign key to CASCADE (was SET NULL — no longer valid)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
