import { Lucia } from "lucia";
import { BunSQLiteAdapter } from "@lucia-auth/adapter-sqlite";
import { db, sqlite } from "./database";
import { sessionTable, userTable } from "./schema.drizzle";

const adapter = new BunSQLiteAdapter(sqlite, {
  user: 'user',
  session: 'session'
});

export const auth = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production"
    }
  },
  getUserAttributes: (attributes) => {
    return {
      userId: attributes.id,
      email: attributes.email,
      isVerified: attributes.isVerified
    };
  }
});

declare module "lucia" {
  interface Register {
    Lucia: typeof auth;
    DatabaseUserAttributes: {
      email: string;
      isVerified: boolean;
    };
    DatabaseSessionAttributes: Record<string, never>;
  }
}

// Extend Hono's Context type to include our custom variables
declare module "hono" {
  interface ContextVariableMap {
    userId: string;
  }
}
