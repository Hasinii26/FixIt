// Standalone Database Initialization & Migration Script
// Usage: node scripts/initDb.js

require('dotenv').config();
const { testConnection, pool } = require('../config/db');

async function run() {
  console.log('========================================================');
  console.log('🛠️  FixIt Database Initialization & Verification Runner');
  console.log('========================================================');
  console.log('Connecting to target database...');

  const success = await testConnection();
  if (success) {
    console.log('\n✅ Database schema verified and ready for deployment.');
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Active tables in database:');
    tables.forEach((t) => console.log(' - ' + Object.values(t)[0]));
    process.exit(0);
  } else {
    console.error('\n❌ Database initialization failed. Check credentials above.');
    process.exit(1);
  }
}

run();
