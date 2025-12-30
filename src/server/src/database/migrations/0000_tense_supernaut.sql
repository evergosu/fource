CREATE TABLE "story" (
	"expires_at" timestamp DEFAULT now() + interval '24 hours' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"title" varchar(255) NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	CONSTRAINT "expiry_24h_check" CHECK (EXTRACT(EPOCH FROM "story"."expires_at" - "story"."created_at") = 86400)
);
--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "story" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "expires_at_idx" ON "story" USING btree ("expires_at");