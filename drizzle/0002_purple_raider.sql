CREATE TABLE `car_task_states` (
	`id` text PRIMARY KEY NOT NULL,
	`car_id` text NOT NULL,
	`task_key` text NOT NULL,
	`status` text NOT NULL,
	`due_at` integer NOT NULL,
	`snooze_count` integer DEFAULT 0 NOT NULL,
	`completed_at` integer,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_car_task_states_car_task` ON `car_task_states` (`car_id`,`task_key`);--> statement-breakpoint
CREATE INDEX `idx_car_task_states_status_due` ON `car_task_states` (`status`,`due_at`);