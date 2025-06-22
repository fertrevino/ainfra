import { Pool } from 'pg';
import logger from './logger';

// Log the database connection configuration (excluding sensitive info)
logger.info({
  host: process.env.PGHOST || 'db',
  port: process.env.PGPORT || '5432',
  user: process.env.PGUSER || 'postgres',
  database: process.env.PGDATABASE || 'postgres',
}, 'Initializing PostgreSQL connection pool');

// Use environment variables for security and flexibility
const pool = new Pool({
  host: process.env.PGHOST || 'db',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'postgres',
});

// Add error event logging for the pool
pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected error on idle PostgreSQL client');
});

export default pool;
