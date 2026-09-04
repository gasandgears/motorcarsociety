CREATE TABLE `car_files` (
	`id` text PRIMARY KEY NOT NULL,
	`car_id` text NOT NULL,
	`storage_key` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`category` text NOT NULL,
	`uploaded_by` text NOT NULL,
	`uploaded_by_email` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_car_files_car_id` ON `car_files` (`car_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_car_files_storage_key` ON `car_files` (`storage_key`);--> statement-breakpoint
CREATE TABLE `cars` (
	`id` text PRIMARY KEY NOT NULL,
	`created_by` text NOT NULL,
	`created_by_email` text NOT NULL,
	`year` text NOT NULL,
	`make` text NOT NULL,
	`model` text NOT NULL,
	`seller_name` text NOT NULL,
	`seller_phone` text NOT NULL,
	`expected_price` text NOT NULL,
	`seller_email` text NOT NULL,
	`location` text NOT NULL,
	`vin` text NOT NULL,
	`notes` text NOT NULL,
	`visibility` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_cars_updated_at` ON `cars` (`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_cars_status_updated_at` ON `cars` (`status`,`updated_at`);