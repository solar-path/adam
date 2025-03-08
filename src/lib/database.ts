import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { z } from 'zod';
import * as schema from './schema';

const envSchema = z.object({
  DB_FILE_NAME: z.string().min(1),
});

const processEnv = envSchema.parse(process.env);

const sqlite = new Database(processEnv.DB_FILE_NAME);
export const db = drizzle(sqlite, { schema });