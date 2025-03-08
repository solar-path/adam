import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from 'drizzle-orm';
import type { Contact, Address } from "./types";
import { defaultContact, defaultAddress } from "./types";

export const user = sqliteTable("account", {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    fullname: text('fullname').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    verified: text('verified').notNull().default('false'),
    vToken: text('vToken').notNull(),
    avatar: text('avatar'),
    gender: text('gender'),
    dob: text('dob'),
    contact: text("contact", { mode: 'json' }).$type<Contact[]>(),
    address: text("address", { mode: 'json' }).$type<Address[]>(),
    createdAt: text('createdAt')
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: text('updatedAt')
   });

export const todoTable = sqliteTable("todo", {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('createdAt')
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: text('updatedAt')
});