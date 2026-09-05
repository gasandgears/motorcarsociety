CREATE TABLE `accounts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`collection_notes` text DEFAULT '' NOT NULL,
	`role` text DEFAULT 'applicant' NOT NULL,
	`tier` text DEFAULT 'none' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_accounts_email` ON `accounts` (`email`);--> statement-breakpoint
CREATE INDEX `idx_accounts_status_role` ON `accounts` (`status`,`role`);--> statement-breakpoint
CREATE TABLE `wanted_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`marques` text DEFAULT '' NOT NULL,
	`specific_car` text DEFAULT '' NOT NULL,
	`value_range` text DEFAULT '500-1500' NOT NULL,
	`era` text DEFAULT 'postwar' NOT NULL,
	`primary_interest` text DEFAULT 'important' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `accounts`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_wanted_profiles_user_id` ON `wanted_profiles` (`user_id`);