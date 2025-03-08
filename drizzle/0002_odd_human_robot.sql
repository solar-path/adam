ALTER TABLE `account` RENAME TO `auth_account`;--> statement-breakpoint
CREATE TABLE `auth_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_account`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP INDEX `account_email_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `auth_account_email_unique` ON `auth_account` (`email`);