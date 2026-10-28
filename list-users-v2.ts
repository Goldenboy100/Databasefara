import { initDb } from "./db.ts";

async function listUsers() {
  const db = await initDb();
  const users = await db.all("SELECT id, name, email, role FROM users");
  console.log("ALL USERS IN DB:", JSON.stringify(users, null, 2));
}

listUsers().catch(console.error);
