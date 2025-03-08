CREATE TABLE `business_company` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`companySlug` text NOT NULL,
	`logo` text,
	`industry` text NOT NULL,
	`residence` text NOT NULL,
	`businessIdentificationNumber` text NOT NULL,
	`contact` text,
	`address` text,
	`author` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text,
	FOREIGN KEY (`author`) REFERENCES `auth_account`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `business_company_companySlug_unique` ON `business_company` (`companySlug`);--> statement-breakpoint
CREATE UNIQUE INDEX `business_company_businessIdentificationNumber_unique` ON `business_company` (`businessIdentificationNumber`);--> statement-breakpoint
CREATE TABLE `business_department` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`company` text NOT NULL,
	`parent` text,
	`author` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text,
	FOREIGN KEY (`company`) REFERENCES `business_company`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent`) REFERENCES `business_department`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author`) REFERENCES `auth_account`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `business_position` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`author` text NOT NULL,
	`company` text NOT NULL,
	`department` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text,
	FOREIGN KEY (`author`) REFERENCES `auth_account`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company`) REFERENCES `business_company`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`department`) REFERENCES `business_department`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `business_orgchart` (
	`id` text PRIMARY KEY NOT NULL,
	`company` text,
	`department` text,
	`position` text,
	`employee` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text,
	`hireDate` text,
	`terminationDate` text,
	`terminationReason` text,
	`terminationNotes` text,
	FOREIGN KEY (`company`) REFERENCES `business_company`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`department`) REFERENCES `business_department`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`position`) REFERENCES `business_position`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`employee`) REFERENCES `auth_account`(`id`) ON UPDATE no action ON DELETE cascade
);
