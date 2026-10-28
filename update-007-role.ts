import { initDb } from "./db.ts";

async function update007Role() {
  const db = await initDb();
  await db.run("UPDATE users SET role = ? WHERE name = ?", ['editor', '007']);
  const user = await db.get("SELECT * FROM users WHERE name = ?", ['007']);
  console.log("Updated 007:", user);
}

update007Role().catch(console.error);
