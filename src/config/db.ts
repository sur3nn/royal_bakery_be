import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'royal_bakery',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+05:30',
  dateStrings: true,
});

// Make MySQL's NOW() / CURRENT_TIMESTAMP use IST on every new connection
pool.pool.on('connection', (conn) => {
  conn.query("SET time_zone = '+05:30'");
});

export default pool;