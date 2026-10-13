const mysql = require('mysql2/promise');
require('dotenv').config();
const { initializeDatabase } = require('./initDatabase');

// Build database connection options
const buildPoolConfig = () => {
  // If DATABASE_URL is provided (common in Render, Railway, TiDB, Aiven):
  if (process.env.DATABASE_URL) {
    const urlConfig = {
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

    // If DB_SSL is true or required by cloud provider
    if (process.env.DB_SSL === 'true' || process.env.DATABASE_URL.includes('ssl') || !process.env.DATABASE_URL.includes('localhost')) {
      urlConfig.ssl = { rejectUnauthorized: false };
    }
    return urlConfig;
  }

  // Otherwise, use individual environment variables
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fixit_db',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  // Enable SSL if explicitly requested or for remote cloud databases
  if (process.env.DB_SSL === 'true' || (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1')) {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
};

const pool = mysql.createPool(buildPoolConfig());

// Helper function to test DB connectivity and ensure schema
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[DB] Connected successfully to MySQL database "${process.env.DB_NAME || 'fixit_db'}" on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    connection.release();

    // Ensure all tables and seed data exist (self-healing deployment)
    await initializeDatabase(pool);
    return true;
  } catch (error) {
    console.error('[DB] Connection Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('[DB] Check your DB_USER, DB_PASSWORD, or DATABASE_URL in environment variables.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`[DB] Database "${process.env.DB_NAME}" does not exist. Please create it or check your connection string.`);
    }
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
};
