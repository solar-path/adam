import { defineConfig } from 'drizzle-kit';


export default defineConfig({
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  verbose: true,
  strict: true,
  dbCredentials: {
    url: process.env["DB_FILE_NAME"] ?? 'sqlite.db'
  }
});