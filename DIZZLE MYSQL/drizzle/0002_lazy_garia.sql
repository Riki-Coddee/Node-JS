ALTER TABLE `sessions` MODIFY COLUMN `user_id` int;--> statement-breakpoint
ALTER TABLE `users` ADD `is_email_valid` boolean DEFAULT false NOT NULL;