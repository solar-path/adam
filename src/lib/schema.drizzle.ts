import { int, sqliteTable, text, blob } from "drizzle-orm/sqlite-core";
import { sql } from 'drizzle-orm';

export const userTable = sqliteTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  isVerified: int('is_verified', { mode: 'boolean' }).notNull().default(false),
  verificationToken: text('verification_token'),
  resetToken: text('reset_token'),
  resetTokenExpiresAt: text('reset_token_expires_at'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at')
});

export const sessionTable = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  expiresAt: blob('expires_at', { mode: 'bigint' }).notNull()
});

export const todoTable = sqliteTable('todo_table', {
  id: int('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: int('status', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at')
});