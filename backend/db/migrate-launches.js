const pool = require('./config');

const sql = `
  CREATE TABLE IF NOT EXISTS launches (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_marathi VARCHAR(255),
    description TEXT NOT NULL,
    special_price DECIMAL(10, 2),
    launch_date DATE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_launches_product ON launches(product_id);
  CREATE INDEX IF NOT EXISTS idx_launches_seller ON launches(seller_id);
  CREATE INDEX IF NOT EXISTS idx_launches_date ON launches(launch_date);
`;

async function migrateLaunches() {
  try {
    await pool.query(sql);
    const published = await pool.query(
      "UPDATE products SET status = 'approved' WHERE status = 'pending'"
    );
    console.log(`Launches table ready. Published ${published.rowCount} existing product(s).`);
  } finally {
    await pool.end();
  }
}

migrateLaunches().catch((error) => {
  console.error('Launch migration failed:', error.message);
  process.exitCode = 1;
});
