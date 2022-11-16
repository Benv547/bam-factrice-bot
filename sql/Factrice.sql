DROP TABLE IF EXISTS "Schedule" CASCADE;
DROP TABLE IF EXISTS "Response" CASCADE;
DROP TABLE IF EXISTS "Quiz" CASCADE;
DROP TABLE IF EXISTS "Question" CASCADE;

CREATE TABLE "Schedule" (
    "id" SERIAL PRIMARY KEY,
    "type" VARCHAR(255) NOT NULL,
    "start" TIMESTAMP NOT NULL,
    "end" TIMESTAMP NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "value" TEXT
);

CREATE TABLE "Quiz" (
    "quiz_name" VARCHAR(255) PRIMARY KEY,
    "current_question" INTEGER
);

CREATE TABLE "Question" (
    "id" SERIAL PRIMARY KEY,
    "quiz_name" VARCHAR(255) NOT NULL,
    "question" TEXT NOT NULL,
    "image_url" TEXT,
    "answers" TEXT NOT NULL,
    "correct_answer" INTEGER NOT NULL,
    "delay" INTEGER NOT NULL DEFAULT 30
);

CREATE TABLE "Response" (
    "id_schedule" INTEGER NOT NULL,
    "id_user" bigint NOT NULL,
    "response" text NOT NULL
);

ALTER TABLE "Question" ADD CONSTRAINT "fk_name_quiz" FOREIGN KEY ("quiz_name") REFERENCES "Quiz" ("quiz_name") ON DELETE CASCADE;
ALTER TABLE "Response" ADD CONSTRAINT "Response_id_schedule_fkey" FOREIGN KEY ("id_schedule") REFERENCES "Schedule" ("id") ON DELETE CASCADE;