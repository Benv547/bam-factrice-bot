DROP TABLE IF EXISTS "Schedule" CASCADE;
DROP TABLE IF EXISTS "Response" CASCADE;

CREATE TABLE "Schedule" (
    "id" SERIAL PRIMARY KEY,
    "type" VARCHAR(255) NOT NULL,
    "start" TIMESTAMP NOT NULL,
    "end" TIMESTAMP NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "value" TEXT
);

CREATE TABLE "Response" (
    "id_schedule" INTEGER NOT NULL,
    "id_user" bigint NOT NULL,
    "response" text NOT NULL
);

ALTER TABLE "Response" ADD CONSTRAINT "Response_id_schedule_fkey" FOREIGN KEY ("id_schedule") REFERENCES "Schedule" ("id") ON DELETE CASCADE;