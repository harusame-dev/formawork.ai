ALTER TABLE "customer_notes"
RENAME COLUMN "id" TO "customer_note_id";

ALTER TABLE "customer_note_images"
DROP CONSTRAINT "customer_note_images_customer_note_id_customer_notes_id_fk";

ALTER TABLE "customer_note_advice"
DROP CONSTRAINT "customer_note_advice_customer_note_id_customer_notes_id_fk";

DROP INDEX "idx_customer_notes_customer_created";

DROP INDEX "idx_customer_notes_staff_id";

ALTER TABLE "customer_note_images" ADD CONSTRAINT "customer_note_images_customer_note_id_customer_notes_customer_note_id_fk" FOREIGN KEY ("customer_note_id") REFERENCES "customer_notes" ("customer_note_id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "customer_note_advice" ADD CONSTRAINT "customer_note_advice_customer_note_id_customer_notes_customer_note_id_fk" FOREIGN KEY ("customer_note_id") REFERENCES "customer_notes" ("customer_note_id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX "idx_customer_notes_customer_service_date" ON "customer_notes" USING btree ("customer_id", "service_date" DESC NULLS LAST);
