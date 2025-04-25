import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

// Specify node-postgres connection options
export const db = drizzle({
  connection: {
    connectionString:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/database',
    //ssl: true,
  },
});
