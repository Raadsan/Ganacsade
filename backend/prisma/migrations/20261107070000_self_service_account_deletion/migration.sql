DROP INDEX IF EXISTS "public"."users_email_key";
DROP INDEX IF EXISTS "public"."users_phone_number_key";

CREATE UNIQUE INDEX "users_email_key"
  ON "public"."users"("email")
  WHERE "deleted_at" IS NULL;

CREATE UNIQUE INDEX "users_phone_number_key"
  ON "public"."users"("phone_number")
  WHERE "deleted_at" IS NULL;
