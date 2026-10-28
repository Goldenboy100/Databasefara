import { initDb } from "./db.ts";

async function fixDevRole() {
  const db = await initDb();
  
  // Find the user with email 'dev'
  const user = await db.get("SELECT * FROM users WHERE email = ?", ['dev']);
  
  if (user) {
    console.log("Found user:", user);
    await db.run("UPDATE users SET role = ? WHERE id = ?", ['developer', user.id]);
    console.log("Role updated to developer for user:", user.email);
  } else {
    console.log("User 'dev' not found.");
    // List all users to debug
    const allUsers = await db.all("SELECT id, name, email, role FROM users");
    console.log("All users:", JSON.stringify(allUsers, null, 2));
  }
}

fixDevRole().catch(console.error);
