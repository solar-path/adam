import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/lib/schema.drizzle.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env["DB_FILE_NAME"]!,
  },
});
