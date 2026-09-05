CREATE TABLE `mailing_contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`source` text DEFAULT 'client list' NOT NULL,
	`permission` text DEFAULT 'needs_review' NOT NULL,
	`invite_status` text DEFAULT 'not_sent' NOT NULL,
	`unsubscribed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_mailing_contacts_email` ON `mailing_contacts` (`email`);--> statement-breakpoint
CREATE INDEX `idx_mailing_contacts_permission_status` ON `mailing_contacts` (`permission`,`invite_status`);