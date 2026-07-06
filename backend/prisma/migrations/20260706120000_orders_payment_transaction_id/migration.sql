-- Add payment transaction reference to orders (WaafiPay / eDahab transaction id)
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_transaction_id" VARCHAR(100);
