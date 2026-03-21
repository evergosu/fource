CREATE TABLE "ban_vote" (
	"id" uuid PRIMARY KEY NOT NULL,
	"story_id" uuid NOT NULL,
	"voter_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbox" (
	"occurred_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"aggregate_id" uuid NOT NULL,
	"payload" jsonb NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "story" ADD COLUMN "is_banned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "story" ADD COLUMN "version" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "ban_vote" ADD CONSTRAINT "ban_vote_story_id_story_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."story"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ban_vote_unique" ON "ban_vote" USING btree ("story_id","voter_id");--> statement-breakpoint
CREATE INDEX "ban_vote_story_idx" ON "ban_vote" USING btree ("story_id");--> statement-breakpoint
CREATE INDEX "ban_vote_voter_idx" ON "ban_vote" USING btree ("voter_id");