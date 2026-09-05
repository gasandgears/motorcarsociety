CREATE TABLE `dossier_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`car_id` text NOT NULL,
	`requester_user_id` text NOT NULL,
	`requester_email` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`requester_user_id`) REFERENCES `accounts`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_dossier_requests_car_user` ON `dossier_requests` (`car_id`,`requester_user_id`);--> statement-breakpoint
CREATE INDEX `idx_dossier_requests_status_created` ON `dossier_requests` (`status`,`created_at`);