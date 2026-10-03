const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      user: process.env.DB_USER || process.env.PGUSER || 'postgres',
      host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
      database: process.env.DB_NAME || process.env.PGDATABASE || 'shetibazaar',
      password: process.env.DB_PASSWORD || process.env.PGPASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || process.env.PGPORT || '5432', 10),
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  // Client checked out from pool
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL idle client warning:', err.message);
});

// Helper to test database connection on startup
async function testConnection() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT current_database(), current_user, version()');
    console.log('✅ PostgreSQL Database connected successfully!');
    console.log(`   Database: ${res.rows[0].current_database} | User: ${res.rows[0].current_user}`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error('   👉 Check your backend/.env database credentials (DATABASE_URL or DB_USER, DB_PASSWORD, DB_PORT, DB_NAME)');
    return false;
  }
}

module.exports = pool;
module.exports.testConnection = testConnection;
