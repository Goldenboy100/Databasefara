import { initDb } from "./db.ts";

async function fixFarajRole() {
  const db = await initDb();
  
  // Update Faraj's role to 'developer'
  await db.run("UPDATE users SET role = ? WHERE name = ?", ['developer', 'Faraj']);
  
  // Verify
  const user = await db.get("SELECT * FROM users WHERE name = ?", ['Faraj']);
  console.log("Updated Faraj:", user);
}

fixFarajRole().catch(console.error);
