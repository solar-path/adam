import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const todoTable = sqliteTable('task', {
    id: integer('id').primaryKey(),
    title: text('title').notNull(),
    status: text('status').notNull().default('pending'),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
})