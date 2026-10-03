const fs = require('fs');
const path = require('path');
const { Client, Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const dbName = process.env.DB_NAME || 'shetibazaar';
const dbUser = process.env.DB_USER || process.env.PGUSER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || process.env.PGPASSWORD || 'postgres';
const dbHost = process.env.DB_HOST || process.env.PGHOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || process.env.PGPORT || '5432', 10);

async function runMigration() {
  console.log('🚀 Starting ShetiBazaar PostgreSQL Migration...');

  // Step 1: Ensure target database exists
  let targetDb = dbName;
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      targetDb = url.pathname.replace(/^\//, '') || dbName;
    } catch {
      targetDb = dbName;
    }
  }

  // Connect to default maintenance database 'postgres' to check/create target database
  const maintenanceConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL.replace(/\/[^/?]+(\?.*)?$/, '/postgres$1') }
    : { user: dbUser, host: dbHost, database: 'postgres', password: dbPassword, port: dbPort };

  const adminClient = new Client(maintenanceConfig);

  try {
    await adminClient.connect();
    const checkDb = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDb]
    );

    if (checkDb.rows.length === 0) {
      console.log(`📦 Database "${targetDb}" does not exist. Creating it now...`);
      await adminClient.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`✅ Database "${targetDb}" created successfully.`);
    } else {
      console.log(`ℹ️ Database "${targetDb}" already exists.`);
    }
  } catch (err) {
    console.warn(`⚠️ Notice while checking database existence: ${err.message}`);
    console.log('   Attempting direct connection to target database...');
  } finally {
    try {
      await adminClient.end();
    } catch {}
  }

  // Step 2: Connect to target database and execute schema.sql
  const targetConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : { user: dbUser, host: dbHost, database: targetDb, password: dbPassword, port: dbPort };

  const targetClient = new Client(targetConfig);

  try {
    await targetClient.connect();
    console.log(`🔌 Connected to database "${targetDb}" on ${dbHost}:${dbPort}`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📜 Executing schema.sql to create tables and indexes...');
    await targetClient.query(schemaSql);

    console.log('✅ PostgreSQL Tables created successfully:');
    console.log('   - users (id, name, email, password, phone, village, district, state, farm_name, role)');
    console.log('   - products (id, seller_id, name, name_marathi, category, price, quantity, unit, location)');
    console.log('   - orders & order_items');
    console.log('   - cart & wishlist');
    console.log('   - reviews & messages');
    console.log('   - notifications & saved_searches');
    console.log('   - price_history & user_behavior');
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('   Please verify database credentials in backend/.env:');
    console.error(`   Host: ${dbHost}, Port: ${dbPort}, User: ${dbUser}, Database: ${targetDb}`);
    process.exit(1);
  } finally {
    await targetClient.end();
  }
}

runMigration();
