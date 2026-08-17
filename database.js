const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'jlcode.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
db.transaction = (operation) => (...args) => {
  db.exec('BEGIN');
  try { const result = operation(...args); db.exec('COMMIT'); return result; }
  catch (error) { db.exec('ROLLBACK'); throw error; }
};

function allowedTechnologies(user) {
  if (user.payment_status !== 'CONFIRMED') return [];
  if (user.plan === 'BETA') return ['HTML'];
  if (user.plan === 'PRO') return ['HTML', 'CSS', 'JAVASCRIPT'];
  return [];
}

function createAccesses(userId, plan) {
  const technologies = plan === 'PRO' ? ['HTML', 'CSS', 'JAVASCRIPT'] : ['HTML'];
  const statement = db.prepare(`INSERT INTO accesses (user_id, course, technology, status)
    VALUES (?, ?, ?, 'ACTIVE') ON CONFLICT(user_id, technology) DO UPDATE SET status = 'ACTIVE'`);
  technologies.forEach((technology) => statement.run(userId, `Curso de ${technology}`, technology));
}

module.exports = { db, allowedTechnologies, createAccesses };
