// models/db.js
const { Pool } = require('pg');

const pool = new Pool({
      connectionString: process.env.DATABASE_URL||"postgresql://postgres:GVBDPceRMcCKieAeYBNLQpHCCFqtdULe@trolley.proxy.rlwy.net:51386/railway",  // ✅ use Render-provided URL
  ssl: {
    rejectUnauthorized: false,  // ✅ needed for Render
  },
    // user: 'postgres',
    // host: 'localhost',
    // database: 'annapurna',
    // password: 'Sanju@2004',
    // port: 5432,
});

module.exports = pool;
