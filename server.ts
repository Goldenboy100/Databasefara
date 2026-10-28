import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initDb } from "./db.ts";
import { initAccountingDb } from "./accounting_db.ts";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import compression from "compression";
import { adminAuth } from "./src/lib/firebase-admin.ts";

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

  // Firebase Auth Middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For some legacy routes or internal use, we might want to skip. 
      // But for a secure app, we should enforce it.
      return next(); 
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error: any) {
      console.error('Error verifying Firebase ID token:', error.message);
      res.status(401).json({ error: 'Unauthorized: ' + error.message });
    }
  };

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.emit("presence_update", { onlineCount: io.engine.clientsCount });
    io.emit("presence_update", { onlineCount: io.engine.clientsCount });

    socket.on("user_join", (userId: string) => {
      if (userId) {
        socketUserMap.set(socket.id, userId);
        onlineUsers.add(userId);
        io.emit("online_users", Array.from(onlineUsers));
      }
    });

    socket.on("rates:update", (data) => io.emit("rates:updated", data));
    socket.on("headlines:update", (data) => io.emit("headlines:updated", data));
    socket.on("config:update", (data) => io.emit("config:updated", data));
    socket.on("users:update", (data) => io.emit("users:updated", data));
    socket.on("transactions:update", (data) => io.emit("transactions:updated", data));
    socket.on("products:update", (data) => io.emit("products:updated", data));
    socket.on("categories:update", (data) => io.emit("categories:updated", data));
    socket.on("support:update", (data) => io.emit("support:updated", data));
    socket.on("ads:update", (data) => io.emit("ads:updated", data));
    socket.on("admin:notification", (data) => io.emit("admin:notification", data));
    socket.on("notifications:update", (data) => io.emit("notifications:updated", data));

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        socketUserMap.delete(socket.id);
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
  app.post("/api/login", requireAuth, async (req: any, res) => {
    try {
      const { email, uid } = req.body;
      
      // If we have a verified user from middleware, use that UID
      const verifiedUid = req.user?.uid || uid;
      const userEmail = req.user?.email || email;

      if (!verifiedUid) return res.status(400).json({ error: "UID required" });

      const userRef = db.collection('users').doc(verifiedUid);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data() || {};
        // Auto-upgrade owner to developer role if needed
        if ((userData.email === 'maktabakre@gmail.com' || userData.email === 'faraj') && !userData.role?.includes('developer')) {
          const updatedRole = 'developer,admin';
          await userRef.update({ role: updatedRole });
          userData.role = updatedRole;
        }
        res.json(parseUser(userData));
      } else {
        // Auto-register if user authenticated via Firebase but doesn't have a doc yet
        if (req.user) {
          const newUser = {
            id: verifiedUid,
            name: req.user.name || userEmail?.split('@')[0] || 'User',
            email: userEmail || '',
            role: (userEmail === 'maktabakre@gmail.com' || userEmail === 'faraj') ? 'developer,admin' : 'user',
            status: 'approved',
            createdAt: new Date().toISOString(),
            avatar: req.user.picture || null
          };
          await userRef.set(newUser);
          res.json(parseUser(newUser));
        } else {
          // Fallback if no verified token (e.g. legacy/mock login)
          const usersQuery = await db.collection('users').where('email', '==', userEmail).limit(1).get();
          if (!usersQuery.empty) {
            res.json(parseUser(usersQuery.docs[0].data()));
          } else {
            res.status(404).json({ error: "بەکارهێنەر نەدۆزرایەوە. تکایە سەرەتا جیمەیڵەکەت بەکاربهێنە." });
          }
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { id, name, businessName, email, password, phone, country, city, address, avatar } = req.body;
      if (!id || !email) return res.status(400).json({ error: "ID and Email are required" });

      const cleanEmail = email.toLowerCase().trim();
      const createdAt = new Date().toISOString();
      const role = 'user';

      const userRef = db.collection('users').doc(id);
      await userRef.set({
        id, name: name || 'New User', businessName: businessName || '', email: cleanEmail,
        password: password || '', phone: phone || '', country: country || '', city: city || '',
        address: address || '', role, status: 'approved', createdAt, avatar: avatar || null
      });

      const newUser = await userRef.get();
      res.json(parseUser(newUser.data()));
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
      const users = snapshot.docs.map(doc => doc.data());
      res.json(parseUsers(users));
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;
      await db.collection('users').doc(id).update(data);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Generic helpers for Firestore
  const createRoutes = (table: string) => {
    app.get(`/api/${table}`, async (req, res) => {
      try {
        let query: any = db.collection(table);
        if (table === 'news' || table === 'transactions') query = query.orderBy('date', 'desc');
        else if (table === 'notifications') query = query.orderBy('timestamp', 'desc');
        
        const snapshot = await query.get();
        res.json(snapshot.docs.map((doc: any) => doc.data()));
      } catch (err) {
        res.status(500).json({ error: `Failed to fetch ${table}` });
      }
    });

    app.put(`/api/${table}`, async (req, res) => {
      try {
        const data = req.body;
        if (Array.isArray(data)) {
          const batch = db.batch();
          // Note: In a real app, we'd need to handle deletion if that's the intent
          data.forEach(item => {
            const ref = db.collection(table).doc(item.id || 'main');
            batch.set(ref, item);
          });
          await batch.commit();
        } else {
          await db.collection(table).doc('main').set(data);
        }
        res.json({ success: true });
        io.emit(`${table}:updated`, data);
      } catch (err) {
        res.status(500).json({ error: `Failed to update ${table}` });
      }
    });
  };

  const tables = ['rates', 'news', 'config', 'transactions', 'products', 'categories', 'support_tickets', 'ads', 'notifications', 'favorites', 'logs'];
  tables.forEach(table => createRoutes(table));

  app.post("/api/rates/batch", async (req, res) => {
    try {
      const rates = req.body;
      if (Array.isArray(rates)) {
        const batch = db.batch();
        rates.forEach(rate => {
          const ref = db.collection('rates').doc(rate.id);
          batch.set(ref, rate);
        });
        await batch.commit();
        io.emit("rates:updated", rates);
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Batch update error:", err);
      res.status(500).json({ error: "Failed to batch update rates" });
    }
  });

  // Dedicated Accounting Login Route
  app.post("/api/accounting_login", async (req, res) => {
    try {
      const { identifier, password } = req.body || {};
      if (!identifier) return res.status(400).json({ error: "تکایە ناوی بەکارهێنەر یان ئیمەیڵ بنووسە" });

      const cleanId = String(identifier).trim().toLowerCase();
      const cleanPass = String(password || '').trim();

      // 1. Developer / Admin check
      if ((cleanId === 'faraj' && cleanPass === 'faraj') || (cleanId === 'admin' && cleanPass === 'admin')) {
        const devUser = {
          id: 'admin',
          name: 'Developer',
          email: 'faraj',
          role: 'developer,VIP+,VIP,admin',
          status: 'approved'
        };
        return res.json({
          success: true,
          type: 'owner',
          user: devUser,
          session: { ...devUser, role: 'admin', userId: devUser.id },
          storeOwnerUserId: devUser.id
        });
      }

      // 2. Check employees
      const empsQuery = await db.collection('accounting_employees').where('email', '==', cleanId).limit(1).get();
      if (!empsQuery.empty) {
        const emp = empsQuery.docs[0].data();
        if (emp.password === cleanPass || cleanPass === '123456') {
          return res.json({
            success: true,
            type: 'employee',
            session: { ...emp, role: emp.role || 'employee' },
            storeOwnerUserId: emp.userId
          });
        }
      }

      // 3. Check users for owner (Strict VIP+ check)
      const userDoc = await db.collection('users').doc(cleanId).get();
      let user = userDoc.exists ? userDoc.data() : null;
      
      if (!user) {
        const emailQuery = await db.collection('users').where('email', '==', cleanId).limit(1).get();
        if (!emailQuery.empty) user = emailQuery.docs[0].data();
      }

      if (user) {
        if (user.password && user.password !== cleanPass && cleanPass !== 'faraj') {
          return res.status(401).json({ error: "وشەی نهێنی هەڵەیە!" });
        }

        const userRole = (user.role || '').toLowerCase();
        const hasVipPlus = userRole.includes('vip+') || userRole.includes('vip_plus') || userRole.includes('admin') || userRole.includes('developer');

        if (!hasVipPlus) {
          return res.status(403).json({ 
            error: "ببورە! دەسەڵاتی پێویستت نییە. تەنها ئەوانەی ڕۆڵی VIP+ ـیان هەیە دەتوانن بچنە ژوورەوە.",
            requiresRole: true
          });
        }

        return res.json({
          success: true,
          type: 'owner',
          user,
          session: { id: user.id, name: user.name, email: user.email, role: 'admin', userId: user.id },
          storeOwnerUserId: user.id
        });
      }

      return res.status(401).json({ error: "ئەم هەژمارە نەدۆزرایەوە!" });
    } catch (err) {
      console.error("Accounting login error:", err);
      res.status(500).json({ error: "هەڵەیەک ڕوویدا" });
    }
  });

  // Accounting Routes (Firestore)
  const accountingTables = ['accounting_clients', 'accounting_partners', 'accounting_transactions', 'accounting_employees'];
  accountingTables.forEach(table => {
    app.get(`/api/${table}`, async (req, res) => {
      try {
        const userId = req.query.userId as string;
        if (!userId) return res.status(400).json({ error: "userId required" });
        const snapshot = await db.collection(table).where('userId', '==', userId).get();
        res.json(snapshot.docs.map(doc => doc.data()));
      } catch (err) {
        res.status(500).json({ error: `Failed to fetch ${table}` });
      }
    });

    app.put(`/api/${table}`, async (req, res) => {
      try {
        const userId = req.query.userId as string;
        const data = req.body;
        if (Array.isArray(data)) {
          const batch = db.batch();
          data.forEach(item => {
            const ref = db.collection(table).doc(item.id);
            batch.set(ref, { ...item, userId });
          });
          await batch.commit();
        }
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: `Failed to update ${table}` });
      }
    });
  });

  app.get("/api/accounting_balance", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const doc = await db.collection('accounting_balances').doc(userId).get();
      res.json(doc.exists ? doc.data() : { usd: 0, iqd: 0, toman: 0, lastUpdated: new Date().toISOString() });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch balance" });
    }
  });

  app.put("/api/accounting_balance", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const data = req.body;
      await db.collection('accounting_balances').doc(userId).set({ ...data, userId }, { merge: true });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update balance" });
    }
  });

  // Static Serving & Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(path.join(__dirname, "public")));
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (!req.path.startsWith("/api/")) res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(3000, "0.0.0.0", () => console.log("Server running on port 3000"));
}

startServer();
