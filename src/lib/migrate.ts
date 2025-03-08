import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { db } from './database';

// This will run migrations on the database, creating tables if they don't exist.
console.log('Running migrations...');

async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error: unknown) {
    console.error('Error running migrations:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

runMigrations();