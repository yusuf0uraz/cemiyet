import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './pool';

async function migrate() {
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('✓ Migration tamamlandı');
  } catch (err) {
    console.error('Migration hatası:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
