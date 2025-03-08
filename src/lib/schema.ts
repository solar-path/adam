import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from 'drizzle-orm';
import type { Contact, Address } from "./types";

export const user = sqliteTable("auth_account", {
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

export const sessionTable = sqliteTable("auth_session", {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    expiresAt: text("expires_at")
      .notNull(),
  });

  export const companyTable = sqliteTable("business_company", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    companySlug: text("companySlug").notNull().unique(),
    logo: text("logo"),
    industry: text("industry").notNull(),
    residence: text("residence").notNull(),
    bin: text("businessIdentificationNumber").unique().notNull(),
    contact: text("contact", { mode: 'json' }).$type<Contact[]>(),
    address: text("address", { mode: 'json' }).$type<Address[]>(),
    author: text("author").notNull().references(() => user.id),
    createdAt: text("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updatedAt")
  });
  
  export const departmentTable = sqliteTable("business_department", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    company: text("company").notNull().references(() => companyTable.id),
    parent: text("parent").references(():any => departmentTable.id),
    author: text("author").notNull().references(() => user.id),
    createdAt: text("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updatedAt")
  });
  
  export const positionTable = sqliteTable("business_position", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    author: text("author").notNull().references(() => user.id),
    company: text("company").notNull().references(() => companyTable.id),
    department: text("department").references(():any => departmentTable.id),
    createdAt: text("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updatedAt"),
  });


export const structureTable = sqliteTable("business_orgchart", {
    id: text("id").primaryKey(),
    company: text("company").references(() => companyTable.id),
    department: text("department").references(
      () => departmentTable.id
    ),
    position: text("position").references(
      () => positionTable.id
    ),
    employee: text("employee").references(() => user.id, {
      onDelete: "cascade",
    }),
    createdAt: text("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updatedAt"),
    // personnel
    hireDate: text("hireDate"),
    terminationDate: text("terminationDate"),
    terminationReason: text("terminationReason"),
    terminationNotes: text("terminationNotes"),
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