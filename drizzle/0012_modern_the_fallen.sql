CREATE TABLE `wanted_vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`year` text DEFAULT '' NOT NULL,
	`make` text DEFAULT '' NOT NULL,
	`model` text DEFAULT '' NOT NULL,
	`variant` text DEFAULT '' NOT NULL,
	`acquisition_low` text DEFAULT '' NOT NULL,
	`acquisition_high` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `accounts`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_wanted_vehicles_user` ON `wanted_vehicles` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_wanted_vehicles_make_model` ON `wanted_vehicles` (`make`,`model`);--> statement-breakpoint
INSERT INTO `wanted_vehicles` (`id`,`user_id`,`year`,`make`,`model`,`variant`,`acquisition_low`,`acquisition_high`,`notes`,`status`,`created_at`,`updated_at`)
SELECT lower(hex(randomblob(16))), `user_id`, '', replace(`marques`, '|', ', '), `specific_car`, '', `acquisition_low`, `acquisition_high`, 'Imported from the original Wanted profile', 'active', `created_at`, `updated_at`
FROM `wanted_profiles` WHERE `specific_car` <> '' OR `marques` <> '';
