CREATE TABLE "attendance_records" (
	"attendance_record_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"volunteer_id" uuid NOT NULL
);

ALTER TABLE "attendance_records" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "event_attendance_urls" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_attendance_url_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"token" text NOT NULL,
	CONSTRAINT "event_attendance_urls_event_id_unique" UNIQUE("event_id"),
	CONSTRAINT "uq_event_attendance_urls_token" UNIQUE("token")
);

ALTER TABLE "event_attendance_urls" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "events" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text,
	"event_dates" date[] NOT NULL,
	"event_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "staffs" (
	"auth_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"staff_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "staffs_auth_user_id_unique" UNIQUE("auth_user_id")
);

ALTER TABLE "staffs" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "volunteers" (
	"code" char(6) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_id" uuid NOT NULL,
	"gender" text,
	"name" text NOT NULL,
	"participation_dates" date[] NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"volunteer_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "uq_volunteers_event_id_code" UNIQUE("event_id","code")
);

ALTER TABLE "volunteers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_volunteer_id_volunteers_volunteer_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("volunteer_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "event_attendance_urls" ADD CONSTRAINT "event_attendance_urls_event_id_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_event_id_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "idx_attendance_records_volunteer_id_recorded_at" ON "attendance_records" USING btree ("volunteer_id","recorded_at");
CREATE INDEX "idx_event_attendance_urls_token" ON "event_attendance_urls" USING btree ("token");
CREATE INDEX "idx_events_name" ON "events" USING btree ("name");
CREATE INDEX "idx_volunteers_event_id" ON "volunteers" USING btree ("event_id");