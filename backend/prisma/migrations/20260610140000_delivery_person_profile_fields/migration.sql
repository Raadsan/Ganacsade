ALTER TABLE "public"."delivery_persons"
  ADD COLUMN IF NOT EXISTS "user_id" UUID,
  ADD COLUMN IF NOT EXISTS "user_photo_url" TEXT,
  ADD COLUMN IF NOT EXISTS "vehicle_photos" JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "location" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(11, 8);

CREATE UNIQUE INDEX IF NOT EXISTS "delivery_persons_user_id_key"
  ON "public"."delivery_persons"("user_id")
  WHERE "user_id" IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_delivery_persons_user'
  ) THEN
    ALTER TABLE "public"."delivery_persons"
      ADD CONSTRAINT "fk_delivery_persons_user"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;
