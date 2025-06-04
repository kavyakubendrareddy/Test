import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let db: any = null;
let pool: any = null;

if (!process.env.DATABASE_URL || process.env.DATABASE_URL === 'dummy') {
  console.warn("⚠️ DATABASE_URL not set or dummy — skipping DB init");
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { db, pool };
