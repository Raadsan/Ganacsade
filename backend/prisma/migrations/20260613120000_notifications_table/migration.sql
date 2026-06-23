-- Create notifications table for in-app alerts
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "type" VARCHAR(50),
    "data" JSONB DEFAULT '{}',
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_notifications_user_created"
ON "notifications" ("user_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_notifications_user_read"
ON "notifications" ("user_id", "is_read");

ALTER TABLE "notifications"
ADD CONSTRAINT "fk_notifications_user"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE NO ACTION;
