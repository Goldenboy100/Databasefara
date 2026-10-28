import { initDb } from "./db.ts";
import crypto from "crypto";

async function addGoldenUser() {
  const db = await initDb();
  const id = crypto.randomUUID();
  
  await db.run(
    'INSERT INTO users (id, name, businessName, email, password, phone, country, city, address, role, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    id, 'golden', 'Golden Exchange', 'golden', 'golden', '', '', '', '', 'developer', 'approved', new Date().toISOString()
  );
  
  const user = await db.get("SELECT * FROM users WHERE name = ?", ['golden']);
  console.log("Added golden user:", user);
}

addGoldenUser().catch(console.error);
