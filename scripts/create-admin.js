#!/usr/bin/env node
/* Usage: node scripts/create-admin.js <email> <password>
   Creates a new admin account in SQLite database (data/gng.db) or updates an existing one. */

const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node scripts/create-admin.js <email> <password>');
  process.exit(1);
}

const cleanEmail = email.trim().toLowerCase();
const hash = bcrypt.hashSync(password, 10);
const dbPath = path.join(process.cwd(), 'data', 'gng.db');

if (!fs.existsSync(dbPath)) {
  console.error('Database gng.db not found at', dbPath);
  process.exit(1);
}

const db = new DatabaseSync(dbPath);

// Ensure admins table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

const existing = db.prepare('SELECT * FROM admins WHERE email = ?').get(cleanEmail);

if (existing) {
  db.prepare('UPDATE admins SET password_hash = ? WHERE email = ?').run(hash, cleanEmail);
  console.log(`Successfully updated password for existing admin: ${cleanEmail}`);
} else {
  db.prepare('INSERT INTO admins (email, password_hash, created_at) VALUES (?, ?, ?)').run(cleanEmail, hash, new Date().toISOString());
  console.log(`Successfully created new admin: ${cleanEmail}`);
}
