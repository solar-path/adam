import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import {sql }from 'drizzle-orm'


export const todoTable = sqliteTable("todo", {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').notNull().default('pending'),
    createdAt: text('createdAt')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
    updatedAt: text('updatedAt')
   
})