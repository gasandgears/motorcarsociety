ALTER TABLE `cars` ADD `category` text DEFAULT 'Uncategorized' NOT NULL;--> statement-breakpoint
UPDATE `cars` SET `registry_id` = 'MCS-LEGACY-' || upper(substr(replace(`id`, '-', ''), 1, 8)) WHERE `registry_id` = '';--> statement-breakpoint
UPDATE `cars` SET `category` = 'American Performance' WHERE `id` = '856aea06-d11f-4785-929a-00164cd6571e';--> statement-breakpoint
CREATE UNIQUE INDEX `idx_cars_registry_id` ON `cars` (`registry_id`) WHERE "cars"."registry_id" <> '';--> statement-breakpoint
CREATE INDEX `idx_cars_category_status` ON `cars` (`category`,`status`);
