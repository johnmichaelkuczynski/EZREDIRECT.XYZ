import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;
type PoolInstance = InstanceType<typeof Pool>;
type Database = ReturnType<typeof createDatabase>;

let poolInstance: PoolInstance | undefined;
let databaseInstance: Database | undefined;

function getConnectionString() {
  const connectionString =
    process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Set NEON_DATABASE_URL or DATABASE_URL before making database queries.",
    );
  }
  return connectionString;
}

export function getPool() {
  return (poolInstance ??= new Pool({
    connectionString: getConnectionString(),
  }));
}

function createDatabase() {
  return drizzle(getPool(), { schema });
}

export function getDatabase() {
  return (databaseInstance ??= createDatabase());
}

export const pool = new Proxy({} as PoolInstance, {
  get(_target, property) {
    const instance = getPool();
    const value = Reflect.get(instance, property, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export const db = new Proxy({} as Database, {
  get(_target, property) {
    const instance = getDatabase();
    const value = Reflect.get(instance, property, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export * from "./schema";
