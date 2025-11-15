const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // Read and execute migration SQL
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrate.sql'),
      'utf-8'
    );
    
    await pool.query(migrationSQL);
    console.log('✅ Database migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();