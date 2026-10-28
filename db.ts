
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
// Removed INITIAL_RATES import

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Use process.cwd() to ensure we are in the root directory
const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_PATH = path.join(DATA_DIR, 'database.sqlite');

let db: Database;

export async function initDb() {
  console.log(`Initializing DB at: ${DB_PATH}`);
  await fs.mkdir(DATA_DIR, { recursive: true });
  
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // Create Tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      businessName TEXT,
      email TEXT UNIQUE,
      password TEXT,
      phone TEXT,
      country TEXT,
      city TEXT,
      address TEXT,
      role TEXT,
      status TEXT,
      createdAt TEXT,
      expiresAt TEXT,
      avatar TEXT,
      theme TEXT,
      language TEXT,
      activityPoints REAL DEFAULT 0,
      wallet TEXT
    );

    CREATE TABLE IF NOT EXISTS rates (
      id TEXT PRIMARY KEY,
      name TEXT,
      code TEXT,
      symbol TEXT,
      buy REAL,
      sell REAL,
      change24h REAL,
      lastUpdated TEXT,
      change TEXT,
      flag TEXT,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      text TEXT,
      date TEXT,
      active INTEGER
    );

    CREATE TABLE IF NOT EXISTS config (
      id TEXT PRIMARY KEY,
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      userId TEXT,
      itemName TEXT,
      type TEXT,
      amount REAL,
      price REAL,
      total REAL,
      profit REAL,
      image TEXT,
      note TEXT,
      customerName TEXT,
      status TEXT,
      dueDate TEXT,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT,
      defaultPrice REAL,
      costPrice REAL,
      quantity REAL,
      barcode TEXT,
      wholesalePrice REAL,
      expiryDate TEXT,
      socialLink TEXT,
      note TEXT,
      image TEXT,
      category TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      userId TEXT,
      itemId TEXT
    );

    CREATE TABLE IF NOT EXISTS ads (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      image TEXT,
      video TEXT,
      link TEXT,
      active INTEGER,
      aspectRatio TEXT,
      type TEXT,
      url TEXT
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      ticketNumber INTEGER,
      userId TEXT,
      userName TEXT,
      message TEXT,
      status TEXT,
      createdAt TEXT,
      replies TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT,
      message TEXT,
      type TEXT,
      timestamp TEXT,
      readBy TEXT
    );
  `);

  // Ensure new columns exist in users table (Migration)
  const columns = await db.all("PRAGMA table_info(users)");
  const columnNames = columns.map(c => c.name);
  
  if (!columnNames.includes('avatar')) {
    await db.exec("ALTER TABLE users ADD COLUMN avatar TEXT");
  }
  if (!columnNames.includes('theme')) {
    await db.exec("ALTER TABLE users ADD COLUMN theme TEXT");
  }
  if (!columnNames.includes('language')) {
    await db.exec("ALTER TABLE users ADD COLUMN language TEXT");
  }
  if (!columnNames.includes('phone')) {
    await db.exec("ALTER TABLE users ADD COLUMN phone TEXT");
  }
  if (!columnNames.includes('country')) {
    await db.exec("ALTER TABLE users ADD COLUMN country TEXT");
  }
  if (!columnNames.includes('city')) {
    await db.exec("ALTER TABLE users ADD COLUMN city TEXT");
  }
  if (!columnNames.includes('businessName')) {
    await db.exec("ALTER TABLE users ADD COLUMN businessName TEXT");
  }
  if (!columnNames.includes('address')) {
    await db.exec("ALTER TABLE users ADD COLUMN address TEXT");
  }
  if (!columnNames.includes('activityPoints')) {
    await db.exec("ALTER TABLE users ADD COLUMN activityPoints REAL DEFAULT 0");
  }
  if (!columnNames.includes('wallet')) {
    await db.exec("ALTER TABLE users ADD COLUMN wallet TEXT");
  }
  if (!columnNames.includes('fcmToken')) {
    await db.exec("ALTER TABLE users ADD COLUMN fcmToken TEXT");
  }

  const supportColumns = await db.all("PRAGMA table_info(support_tickets)");
  const supportColumnNames = supportColumns.map(c => c.name);
  if (!supportColumnNames.includes('ticketNumber')) {
    await db.exec("ALTER TABLE support_tickets ADD COLUMN ticketNumber INTEGER DEFAULT 0");
  }
  if (!supportColumnNames.includes('replies')) {
    await db.exec("ALTER TABLE support_tickets ADD COLUMN replies TEXT DEFAULT '[]'");
  }

  const favoritesColumns = await db.all("PRAGMA table_info(favorites)");
  const favoritesColumnNames = favoritesColumns.map(c => c.name);
  if (!favoritesColumnNames.includes('userId')) {
    await db.exec("ALTER TABLE favorites ADD COLUMN userId TEXT");
    await db.exec("UPDATE favorites SET userId = 'guest' WHERE userId IS NULL");
  }

  const adsColumns = await db.all("PRAGMA table_info(ads)");
  const adsColumnNames = adsColumns.map(c => c.name);
  if (!adsColumnNames.includes('type')) {
    await db.exec("ALTER TABLE ads ADD COLUMN type TEXT");
  }
  if (!adsColumnNames.includes('url')) {
    await db.exec("ALTER TABLE ads ADD COLUMN url TEXT");
  }

  // Migration from JSON to SQLite
  await migrateFromJson();

  return db;
}

async function migrateFromJson() {
  // Check if database has been initialized before
  const isInitialized = await db.get("SELECT 1 FROM config WHERE id = 'main'");

  if (!isInitialized) {
    console.log("First time setup: Initializing database with default data...");
    const files = [
      { name: "users.json", table: "users" },
      { name: "rates.json", table: "rates" },
      { name: "news.json", table: "news" },
      { name: "config.json", table: "config" },
      { name: "transactions.json", table: "transactions" },
      { name: "products.json", table: "products" },
      { name: "categories.json", table: "categories" },
      { name: "favorites.json", table: "favorites" },
    ];

    for (const file of files) {
      const srcPath = path.join(process.cwd(), 'src', 'data', file.name);
      const rootPath = path.join(DATA_DIR, file.name);
      
      try {
        let data = null;
        try {
          const content = await fs.readFile(srcPath, 'utf-8');
          data = JSON.parse(content);
        } catch (e) {
           try {
             const content = await fs.readFile(rootPath, 'utf-8');
             data = JSON.parse(content);
           } catch (e2) {
             if (file.table === 'rates') data = [];
             else if (file.table === 'config') data = {};
           }
        }

        if (data) {
          if (file.table === 'config') {
            await db.run('INSERT OR IGNORE INTO config (id, data) VALUES (?, ?)', 'main', JSON.stringify(data));
          } else if (Array.isArray(data)) {
            for (const item of data) {
              const keys = Object.keys(item);
              const placeholders = keys.map(() => '?').join(',');
              const values = Object.values(item).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
              await db.run(`INSERT OR IGNORE INTO ${file.table} (${keys.join(',')}) VALUES (${placeholders})`, ...values);
            }
          }
        }
      } catch (err) {
        console.error(`Error initializing ${file.table}:`, err);
      }
    }
    
    // Ensure config 'main' exists to mark as initialized
    await db.run("INSERT OR IGNORE INTO config (id, data) VALUES ('main', '{}')");
  }

  // Update appName in config if it's the old one or missing
  const configRow = await db.get("SELECT data FROM config WHERE id = 'main'");
  if (configRow) {
    try {
      const configData = JSON.parse(configRow.data);
      if (configData.appName === 'Golden Exchange' || !configData.appName) {
        configData.appName = 'دراوي جيهانی';
      }
      
      // Ensure wallet, metals, and accounting are in enabledTabs if it exists
      if (configData.enabledTabs && Array.isArray(configData.enabledTabs)) {
        if (!configData.enabledTabs.includes('wallet')) {
          configData.enabledTabs.push('wallet');
        }
        if (!configData.enabledTabs.includes('metals')) {
          configData.enabledTabs.push('metals');
        }
        if (!configData.enabledTabs.includes('accounting')) {
          configData.enabledTabs.push('accounting');
        }
      }

      await db.run("UPDATE config SET data = ? WHERE id = 'main'", JSON.stringify(configData));
    } catch (e) {
      console.error("Failed to parse config data for migration:", e);
    }
  }

  // Ensure default admin
  const admin = await db.get('SELECT * FROM users WHERE email = ?', 'faraj');
  if (!admin) {
    await db.run(`
      INSERT INTO users (id, name, email, password, role, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, 'admin', 'Developer', 'faraj', 'faraj', 'developer', 'approved', new Date().toISOString());
  }

  // Global rates update removed
}

export function getDb() {
  return db;
}
