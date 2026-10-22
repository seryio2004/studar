import { DatabaseSync, backup } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [action, argument] = process.argv.slice(2);
const databasePath = resolve(process.env.DATABASE_PATH || 'data/proyectos.sqlite');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');

try {
  if (!['backup', 'import'].includes(action) || (action === 'import' && !argument)) {
    throw new Error('Uso: npm run db:backup -- [destino.sqlite] | npm run db:import -- origen.sqlite');
  }
  const source = action === 'import' ? resolve(argument) : databasePath;
  const destination = action === 'import'
    ? databasePath
    : resolve(argument || `backups/proyectos-${stamp}.sqlite`);
  if (!existsSync(source)) throw new Error(`No existe la base de datos: ${source}`);
  if (existsSync(destination)) throw new Error(`El destino ya existe; no se sobrescribe: ${destination}`);
  const db = new DatabaseSync(source, { readOnly: true });
  try {
    const check = db.prepare('PRAGMA quick_check').get();
    if (check.quick_check !== 'ok') throw new Error('La comprobación de integridad ha fallado.');
    // Check the application's schema before accepting an imported database.
    db.prepare('SELECT id, payload, revision FROM projects LIMIT 0').all();
    db.prepare('SELECT id, payload FROM ideas LIMIT 0').all();
    db.prepare('SELECT id, project_id, date, title FROM events LIMIT 0').all();
    mkdirSync(dirname(destination), { recursive: true });
    await backup(db, destination);
    console.log(`Base de datos copiada a ${destination}`);
  } finally {
    db.close();
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
