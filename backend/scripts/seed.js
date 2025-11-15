const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runSeed() {
  try {
    console.log('Starting database seeding...');
    
    // Read and execute seed SQL
    const seedSQL = fs.readFileSync(
      path.join(__dirname, 'seed.sql'),
      'utf-8'
    );
    
    await pool.query(seedSQL);
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('Admin: admin@company.com / password123');
    console.log('Area Manager: john.manager@company.com / password123');
    console.log('Store Manager: sarah.store@company.com / password123');
    console.log('Sales Rep: mike.sales@company.com / password123');
    console.log('Sales Rep: lisa.sales@company.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();