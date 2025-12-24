import { initDatabase } from './server/db.js';

async function testDatabase() {
  try {
    console.log('Testing MySQL connection and sync...');
    await initDatabase();
    console.log('✅ Database connection and sync successful!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabase();
