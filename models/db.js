// models/db.js
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'annapurna',
    password: 'Sanju@2004',
    port: 5432,
});

module.exports = pool;
