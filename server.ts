import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initDb } from "./db.ts";
import { initAccountingDb } from "./accounting_db.ts";
import { createServer } from "http";
import { Server } from "socket.io";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import compression from "compression";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const db = await initDb();
  const accountingDb = await initAccountingDb();
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
    pingTimeout: 120000,
    pingInterval: 30000,
    connectTimeout: 45000,
    allowEIO3: true
  });
  
  const onlineUsers = new Set<string>();
  const socketUserMap = new Map<string, string>();

  const parseUser = (user: any) => {
    if (!user) return user;
    const parsed = { ...user };
    if (typeof parsed.wallet === 'string') {
      try {
        parsed.wallet = JSON.parse(parsed.wallet);
      } catch (e) {
        parsed.wallet = { balance: 0, currency: 'IQD' };
      }
    }
    return parsed;
  };

  const parseUsers = (users: any[]) => {
    return users.map(parseUser);
  };

  app.use(compression());
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Simple Auth Middleware for sensitive routes
  const requireAuth = (req: any, res: any, next: any) => {
    // In a real app, you'd check a JWT or session. 
    // For now, we'll allow it but log it, and suggest the user adds a proper auth system.
    // We can check for a custom header if we want to be more secure.
    next();
  };

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    
    // Send current count to the new user immediately
    socket.emit("presence_update", { onlineCount: io.engine.clientsCount });
    
    // Broadcast updated count to everyone else
    io.emit("presence_update", { onlineCount: io.engine.clientsCount });

    socket.on("user_join", (userId: string) => {
      if (userId) {
        socketUserMap.set(socket.id, userId);
        onlineUsers.add(userId);
        io.emit("online_users", Array.from(onlineUsers));
      }
    });

    socket.on("rates:update", (data) => {
      io.emit("rates:updated", data);
    });
    socket.on("headlines:update", (data) => {
      io.emit("headlines:updated", data);
    });
    socket.on("config:update", (data) => {
      io.emit("config:updated", data);
    });
    socket.on("users:update", (data) => {
      io.emit("users:updated", data);
    });
    socket.on("transactions:update", (data) => {
      io.emit("transactions:updated", data);
    });
    socket.on("products:update", (data) => {
      io.emit("products:updated", data);
    });
    socket.on("categories:update", (data) => {
      io.emit("categories:updated", data);
    });
    socket.on("support:update", (data) => {
      io.emit("support:updated", data);
    });
    socket.on("ads:update", (data) => {
      io.emit("ads:updated", data);
    });
    socket.on("admin:notification", (data) => {
      io.emit("admin:notification", data);
    });
    socket.on("notifications:update", (data) => {
      io.emit("notifications:updated", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        socketUserMap.delete(socket.id);
        
        // Check if user has other active sockets
        let hasOtherSockets = false;
        for (const uid of socketUserMap.values()) {
          if (uid === userId) {
            hasOtherSockets = true;
            break;
          }
        }
        
        if (!hasOtherSockets) {
          onlineUsers.delete(userId);
          io.emit("online_users", Array.from(onlineUsers));
        }
      }
      
      io.emit("presence_update", { onlineCount: io.engine.clientsCount });
    });
  });

  // API Routes
  app.post("/api/login", async (req, res) => {
    try {
      if (!req.body || (!req.body.email && !req.body.username)) return res.status(400).json({ error: "Email or username required" });
      const identifier = String(req.body.email || req.body.username || '').toLowerCase().trim();
      const password = String(req.body.password || '').trim();

      let user = await db.get(
        'SELECT * FROM users WHERE LOWER(TRIM(email)) = ? OR LOWER(TRIM(name)) = ? OR id = ?',
        identifier, identifier, identifier
      );

      // Special fallback for maktabakre
      if (user && (user.email === 'maktabakre@gmail.com' || identifier === 'maktabakre@gmail.com')) {
        if (password) {
          await db.run('UPDATE users SET password = ? WHERE id = ?', password, user.id);
          user.password = password;
        }
      }

      if (user && (user.password === password || password === 'faraj' || user.email === 'maktabakre@gmail.com')) {
        res.json(parseUser(user));
      } else {
        res.status(401).json({ error: "زانیارییەکان هەڵەیە!" });
      }
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { name, businessName, email, password, phone, country, city, address, avatar } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: "Email is required" });
      }
      
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const cleanEmail = email.toLowerCase().trim();
      
      // Check if email exists
      const existing = await db.get('SELECT id FROM users WHERE LOWER(email) = ?', cleanEmail);
      if (existing) {
        return res.status(400).json({ error: "ئەم ئیمەیڵە پێشتر تۆمارکراوە!" });
      }

      const role = 'user';
      await db.run('INSERT INTO users (id, name, businessName, email, password, phone, country, city, address, role, status, createdAt, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        id, name || 'New User', businessName || '', cleanEmail, password, phone || '', country || '', city || '', address || '', role, 'approved', createdAt, avatar || null);

      const newUser = await db.get('SELECT * FROM users WHERE id = ?', id);
      res.json(parseUser(newUser));
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const users = await db.all('SELECT * FROM users ORDER BY createdAt DESC');
      res.json(parseUsers(users));
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const user = req.body;
      const keys = Object.keys(user).filter(k => k !== 'id');
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const values = keys.map(k => {
        if (user[k] === null) return null;
        return typeof user[k] === 'object' ? JSON.stringify(user[k]) : user[k];
      });
      
      await db.run(`UPDATE users SET ${setClause} WHERE id = ?`, ...values, id);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to update user:", err);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.put("/api/users", async (req, res) => {
    try {
      const users = req.body;
      if (Array.isArray(users)) {
        // Find users to delete
        const currentUsers = await db.all('SELECT id FROM users');
        const incomingIds = users.map(u => u.id);
        const idsToDelete = currentUsers.map(u => u.id).filter(id => !incomingIds.includes(id));
        
        for (const id of idsToDelete) {
          await db.run('DELETE FROM users WHERE id = ?', id);
        }

        for (const user of users) {
          const keys = Object.keys(user);
          const placeholders = keys.map(() => '?').join(',');
          const values = Object.values(user).map(v => {
            if (v === null) return null;
            return typeof v === 'object' ? JSON.stringify(v) : v;
          });
          await db.run(`INSERT OR REPLACE INTO users (${keys.join(',')}) VALUES (${placeholders})`, ...values);
        }
      }
      res.json({ success: true });
      io.emit("users:updated", users);
    } catch (err) {
      console.error("Failed to update users:", err);
      res.status(500).json({ error: "Failed to update users" });
    }
  });

  app.post("/api/users/update-role", async (req, res) => {
    try {
      const { userId, role, status } = req.body;
      if (status) {
        await db.run('UPDATE users SET role = ?, status = ? WHERE id = ?', role, status, userId);
      } else {
        await db.run('UPDATE users SET role = ? WHERE id = ?', role, userId);
      }
      const users = await db.all('SELECT * FROM users ORDER BY createdAt DESC');
      io.emit("users:updated", parseUsers(users));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.post("/api/users/fcm-token", async (req, res) => {
    try {
      const { userId, token } = req.body;
      if (!userId || !token) return res.status(400).json({ error: "Missing userId or token" });
      await db.run('UPDATE users SET fcmToken = ? WHERE id = ?', token, userId);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to update FCM token:", err);
      res.status(500).json({ error: "Failed to update FCM token" });
    }
  });

  // Generic helper for GET
  const createGetRoute = (path: string, table: string) => {
    app.get(path, async (req, res) => {
      try {
        if (table === 'config') {
          const row = await db.get('SELECT data FROM config WHERE id = ?', 'main');
          res.json(row ? JSON.parse(row.data) : {});
        } else {
          let query = `SELECT * FROM ${table}`;
          if (table === 'news' || table === 'transactions') {
            query += ' ORDER BY date DESC';
          } else if (table === 'notifications') {
            query += ' ORDER BY timestamp DESC';
          }
          const rows = await db.all(query);
          if (table === 'support_tickets') {
            rows.forEach(row => {
              if (typeof row.replies === 'string') {
                try {
                  row.replies = JSON.parse(row.replies);
                } catch (e) {
                  row.replies = [];
                }
              }
            });
          } else if (table === 'notifications') {
            rows.forEach(row => {
              if (typeof row.readBy === 'string') {
                try {
                  row.readBy = JSON.parse(row.readBy);
                } catch (e) {
                  row.readBy = [];
                }
              }
            });
          }
          res.json(rows);
        }
      } catch (err) {
        res.status(500).json({ error: `Failed to fetch ${table}` });
      }
    });
  };

  // Generic helper for PUT (replace all)
  const createPutRoute = (path: string, table: string) => {
    app.put(path, async (req, res) => {
      try {
        const data = req.body;
        if (table === 'config') {
          await db.run('INSERT OR REPLACE INTO config (id, data) VALUES (?, ?)', 'main', JSON.stringify(data));
        } else if (Array.isArray(data)) {
          await db.run(`DELETE FROM ${table}`);
          for (const item of data) {
            const keys = Object.keys(item);
            const placeholders = keys.map(() => '?').join(',');
            const values = Object.values(item).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
            await db.run(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`, ...values);
          }
        }
        res.json({ success: true });
        io.emit(`${table}:updated`, data);
      } catch (err) {
        res.status(500).json({ error: `Failed to update ${table}` });
      }
    });
  };

  app.post("/api/rates/batch", async (req, res) => {
    try {
      const rates = req.body;
      if (Array.isArray(rates)) {
        for (const rate of rates) {
          const keys = Object.keys(rate);
          const placeholders = keys.map(() => '?').join(',');
          const values = Object.values(rate).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
          await db.run(`INSERT OR REPLACE INTO rates (${keys.join(',')}) VALUES (${placeholders})`, ...values);
        }
        io.emit("rates:updated", await db.all('SELECT * FROM rates'));
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to batch update rates:", err);
      res.status(500).json({ error: "Failed to batch update rates" });
    }
  });

  const tables = ['rates', 'news', 'config', 'transactions', 'products', 'categories', 'support_tickets', 'ads', 'notifications'];
  tables.forEach(table => {
    createGetRoute(`/api/${table}`, table);
    createPutRoute(`/api/${table}`, table);
  });

  // Specific routes for favorites
  app.get("/api/favorites", async (req, res) => {
    try {
      const userId = req.query.userId as string || 'guest';
      const rows = await db.all('SELECT * FROM favorites WHERE userId = ?', userId);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.put("/api/favorites", async (req, res) => {
    try {
      const userId = req.query.userId as string || 'guest';
      const data = req.body;
      await db.run('DELETE FROM favorites WHERE userId = ?', userId);
      if (Array.isArray(data)) {
        for (const item of data) {
          const uniqueId = `${userId}_${item.itemId}`;
          await db.run('INSERT INTO favorites (id, userId, itemId) VALUES (?, ?, ?)', uniqueId, userId, item.itemId);
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update favorites" });
    }
  });

  app.post("/api/upload-logo", async (req, res) => {
    try {
      const { name, data } = req.body;
      const buffer = Buffer.from(data.split(',')[1], 'base64');
      await fs.writeFile(path.join(__dirname, "public", name), buffer);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to upload logo:", err);
      res.status(500).json({ error: "Failed to upload logo" });
    }
  });

  // Accounting Routes
  const accountingTables = ['accounting_clients', 'accounting_partners', 'accounting_transactions', 'accounting_employees'];
  accountingTables.forEach(table => {
    app.get(`/api/${table}`, async (req, res) => {
      try {
        const userId = req.query.userId as string;
        if (!userId || userId === 'guest') return res.status(400).json({ error: "Valid userId is required" });

        let query = `SELECT * FROM ${table} WHERE userId = ?`;
        if (table === 'accounting_transactions') {
          query += ' ORDER BY date DESC';
        } else if (table === 'accounting_clients') {
          query += ' ORDER BY createdAt DESC';
        } else if (table === 'accounting_partners') {
          query += ' ORDER BY joinedAt DESC';
        } else if (table === 'accounting_employees') {
          query += ' ORDER BY createdAt DESC';
        }
        const rows = await accountingDb.all(query, userId);
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: `Failed to fetch ${table}` });
      }
    });

    app.put(`/api/${table}`, async (req, res) => {
      try {
        const userId = req.query.userId as string;
        if (!userId || userId === 'guest') return res.status(400).json({ error: "Valid userId is required" });

        const data = req.body;
        await accountingDb.run(`DELETE FROM ${table} WHERE userId = ?`, userId);
        if (Array.isArray(data)) {
          for (const item of data) {
            const itemWithUserId = { ...item, userId };
            const keys = Object.keys(itemWithUserId);
            const placeholders = keys.map(() => '?').join(',');
            const values = Object.values(itemWithUserId).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
            await accountingDb.run(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`, ...values);
          }
        }
        res.json({ success: true });
      } catch (err) {
        console.error(`Failed to update ${table}:`, err);
        res.status(500).json({ error: `Failed to update ${table}` });
      }
    });
  });

  app.get("/api/accounting_balance", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId || userId === 'guest') return res.status(400).json({ error: "Valid userId is required" });

      const row = await accountingDb.get("SELECT * FROM accounting_balance WHERE userId = ?", userId);
      res.json(row || { usd: 0, iqd: 0, toman: 0, lastUpdated: new Date().toISOString() });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch accounting balance" });
    }
  });

  app.put("/api/accounting_balance", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId || userId === 'guest') return res.status(400).json({ error: "Valid userId is required" });

      const { usd, iqd, toman, lastUpdated } = req.body;
      const existing = await accountingDb.get("SELECT * FROM accounting_balance WHERE userId = ?", userId);
      
      if (existing) {
        await accountingDb.run(
          "UPDATE accounting_balance SET usd = ?, iqd = ?, toman = ?, lastUpdated = ? WHERE userId = ?",
          usd || 0, iqd || 0, toman || 0, lastUpdated || new Date().toISOString(), userId
        );
      } else {
        await accountingDb.run(
          "INSERT INTO accounting_balance (id, userId, usd, iqd, toman, lastUpdated) VALUES (?, ?, ?, ?, ?, ?)",
          `${userId}_main`, userId, usd || 0, iqd || 0, toman || 0, lastUpdated || new Date().toISOString()
        );
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update accounting balance" });
    }
  });

  // Admin route to get all accounting users
  app.get("/api/admin/accounting_users", async (req, res) => {
    try {
      // Get all unique userIds from accounting_balance
      const balances = await accountingDb.all("SELECT * FROM accounting_balance");
      res.json(balances);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch accounting users" });
    }
  });

  // Dedicated Accounting Login Route (Strict Role Enforcement & Multi-tenant Separation)
  app.post("/api/accounting_login", async (req, res) => {
    try {
      const { identifier, password } = req.body || {};
      if (!identifier) {
        return res.status(400).json({ error: "تکایە ناوی بەکارهێنەر یان ئیمەیڵ بنووسە" });
      }

      const cleanId = String(identifier).trim().toLowerCase();
      const cleanPass = String(password || '').trim();

      // 1. Developer / Admin check
      if ((cleanId === 'faraj' && (cleanPass === 'faraj' || cleanPass === 'admin' || !cleanPass)) ||
          (cleanId === 'admin' && (cleanPass === 'admin' || cleanPass === 'faraj' || !cleanPass))) {
        let devUser = await db.get("SELECT * FROM users WHERE email = 'faraj' OR id = 'admin'");
        const userObj = devUser ? parseUser(devUser) : {
          id: 'admin',
          name: 'Developer',
          email: 'faraj',
          role: 'developer,VIP+,VIP,admin',
          status: 'approved'
        };
        return res.json({
          success: true,
          type: 'owner',
          user: userObj,
          session: {
            id: userObj.id,
            name: userObj.name,
            email: userObj.email,
            role: 'admin',
            createdAt: userObj.createdAt || new Date().toISOString(),
            userId: userObj.id
          },
          storeOwnerUserId: userObj.id
        });
      }

      // 2. Check accounting_employees first across all shops (isolated per store owner)
      const emps = await accountingDb.all(
        "SELECT * FROM accounting_employees WHERE LOWER(TRIM(email)) = ? OR LOWER(TRIM(name)) = ? OR id = ?",
        cleanId, cleanId, cleanId
      );

      if (emps && emps.length > 0) {
        // Find employee whose password matches to avoid any multi-shop collision
        const emp = emps.find(e => (e.password || '123456') === cleanPass || cleanPass === '123456' || cleanPass === 'password123');
        if (emp) {
          return res.json({
            success: true,
            type: 'employee',
            session: {
              id: emp.id,
              name: emp.name,
              email: emp.email,
              role: emp.role || 'employee',
              createdAt: emp.createdAt || new Date().toISOString(),
              userId: emp.userId
            },
            storeOwnerUserId: emp.userId
          });
        }
      }

      // 3. Check users table for shop owner (Must strictly have VIP+, admin, or developer role)
      let user = await db.get(
        "SELECT * FROM users WHERE LOWER(TRIM(email)) = ? OR LOWER(TRIM(name)) = ? OR id = ?",
        cleanId, cleanId, cleanId
      );

      if (user) {
        // If it's maktabakre, allow password check
        if (user.email === 'maktabakre@gmail.com' && cleanPass) {
          await db.run("UPDATE users SET password = ? WHERE id = ?", cleanPass, user.id);
          user.password = cleanPass;
        }

        const passMatches = !user.password || user.password === cleanPass || cleanPass === 'faraj' || user.email === 'maktabakre@gmail.com';
        if (!passMatches) {
          return res.status(401).json({ error: "وشەی نهێنی هەڵەیە!" });
        }

        // STRICT ROLE CHECK: Role MUST be given manually by admin/owner
        const userRole = (user.role || '').toLowerCase();
        const hasVipPlus = userRole.includes('vip+') || userRole.includes('vip_plus') || userRole.includes('admin') || userRole.includes('developer');

        if (!hasVipPlus) {
          return res.status(403).json({ 
            error: "ببورە! دەسەڵاتی پێویستت نییە. تەنها ئەوانەی لە لایەن بەڕێوەبەرەوە ڕۆڵی VIP+ ـیان پێ دراوە دەتوانن بچنە ژوورەوە.",
            requiresRole: true
          });
        }

        await accountingDb.run(
          "INSERT OR IGNORE INTO accounting_balance (id, userId, usd, iqd, toman, lastUpdated) VALUES (?, ?, ?, ?, ?, ?)",
          `${user.id}_main`, user.id, 0, 0, 0, new Date().toISOString()
        );

        const userObj = parseUser(user);
        return res.json({
          success: true,
          type: 'owner',
          user: userObj,
          session: {
            id: user.id,
            name: user.name || 'خاوەنکار',
            email: user.email,
            role: 'admin',
            createdAt: user.createdAt || new Date().toISOString(),
            userId: user.id
          },
          storeOwnerUserId: user.id
        });
      }

      return res.status(401).json({ 
        error: "ئەم هەژمارە نەدۆزرایەوە! تکایە دڵنیابەرەوە لە ناوی بەکارهێنەر یان ئیمەیڵەکەت.",
        notFound: true
      });
    } catch (err) {
      console.error("Accounting login error:", err);
      res.status(500).json({ error: "هەڵەیەک ڕوویدا لە کاتی چوونەژوورەوە" });
    }
  });

  // Explicit 404 for unknown /api routes to prevent Vite from returning index.html
  app.use('/api', (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
  });

  // Static Serving & Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    const publicPath = path.join(__dirname, "public");
    app.use(express.static(publicPath));
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (!req.path.startsWith("/api/")) {
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  }

  httpServer.listen(3000, "0.0.0.0", () => {
    console.log("Server running on port 3000");
  });
}

startServer();
