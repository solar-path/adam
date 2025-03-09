import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { z } from 'zod';
import { todoTable } from './drizzle.schema';

// Validate environment variables
const envSchema = z.object({
    DATABASE_URL: z.string().min(1).default('./sqlite.db'),
});

const env = envSchema.parse(process.env);

// Initialize database connection
const sqlite = new Database(env.DATABASE_URL);
export const db = drizzle(sqlite, { schema: { todoTable } });