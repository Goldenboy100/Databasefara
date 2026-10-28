import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs/promises';

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_PATH = path.join(DATA_DIR, 'accounting.sqlite');

let db: Database;

export async function initAccountingDb() {
  console.log(`Initializing Accounting DB at: ${DB_PATH}`);
  await fs.mkdir(DATA_DIR, { recursive: true });
  
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS accounting_clients (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT,
      phone TEXT,
      debtUSD REAL DEFAULT 0,
      debtIQD REAL DEFAULT 0,
      debtToman REAL DEFAULT 0,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS accounting_partners (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT,
      sharePercentage REAL DEFAULT 0,
      capitalUSD REAL DEFAULT 0,
      capitalIQD REAL DEFAULT 0,
      capitalToman REAL DEFAULT 0,
      joinedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS accounting_transactions (
      id TEXT PRIMARY KEY,
      userId TEXT,
      type TEXT,
      amount REAL,
      currency TEXT,
      rate REAL,
      totalConverted REAL,
      targetCurrency TEXT,
      clientId TEXT,
      clientName TEXT,
      partnerId TEXT,
      partnerName TEXT,
      senderName TEXT,
      receiverName TEXT,
      destination TEXT,
      category TEXT,
      note TEXT,
      status TEXT,
      date TEXT,
      createdBy TEXT
    );

    CREATE TABLE IF NOT EXISTS accounting_balance (
      id TEXT PRIMARY KEY,
      userId TEXT,
      usd REAL DEFAULT 0,
      iqd REAL DEFAULT 0,
      toman REAL DEFAULT 0,
      lastUpdated TEXT
    );

    CREATE TABLE IF NOT EXISTS accounting_employees (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT,
      email TEXT,
      password TEXT,
      role TEXT,
      createdAt TEXT
    );
  `);

  const tables = ['accounting_clients', 'accounting_partners', 'accounting_transactions', 'accounting_balance', 'accounting_employees'];
  for (const table of tables) {
    const columns = await db.all(`PRAGMA table_info(${table})`);
    const columnNames = columns.map(c => c.name);
    if (!columnNames.includes('userId')) {
      await db.exec(`ALTER TABLE ${table} ADD COLUMN userId TEXT`);
    }
  }

  const txColumns = await db.all(`PRAGMA table_info(accounting_transactions)`);
  const txColumnNames = txColumns.map(c => c.name);
  if (!txColumnNames.includes('employeeId')) {
    await db.exec(`ALTER TABLE accounting_transactions ADD COLUMN employeeId TEXT`);
  }

  const empColumns = await db.all(`PRAGMA table_info(accounting_employees)`);
  const empColumnNames = empColumns.map(c => c.name);
  if (!empColumnNames.includes('password')) {
    await db.exec(`ALTER TABLE accounting_employees ADD COLUMN password TEXT`);
  }

  return db;
}

export function getAccountingDb() {
  return db;
}
