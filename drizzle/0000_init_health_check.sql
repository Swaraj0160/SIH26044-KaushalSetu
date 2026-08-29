CREATE TABLE "health_check" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text DEFAULT 'ok' NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL
);
