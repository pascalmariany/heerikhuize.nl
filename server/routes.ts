import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seed } from "./seed";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertProjectSchema } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const uploadsDir = path.join(process.cwd(), "client", "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`);
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Niet ingelogd" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgSession = connectPg(session);

  app.use(
    session({
      store: new PgSession({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    })
  );

  await seed();

  app.post("/api/contact", (req, res) => {
    const { email, naam, bericht } = req.body;
    if (!email || !naam || !bericht) {
      return res.status(400).json({ error: "Alle velden zijn verplicht" });
    }
    console.log("Contact form submission:", { email, naam, bericht });
    res.json({ success: true, message: "Bericht ontvangen" });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email en wachtwoord zijn verplicht" });
    }
    const user = await storage.getUserByUsername(email);
    if (!user) {
      return res.status(401).json({ error: "Ongeldige inloggegevens" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Ongeldige inloggegevens" });
    }
    req.session.userId = user.id;
    res.json({ success: true });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Niet ingelogd" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "Gebruiker niet gevonden" });
    }
    res.json({ id: user.id, username: user.username });
  });

  app.get("/api/projects", async (_req, res) => {
    const allProjects = await storage.getAllProjects();
    res.json(allProjects);
  });

  app.get("/api/projects/:category", async (req, res) => {
    const { category } = req.params;
    const categoryProjects = await storage.getProjectsByCategory(category);
    res.json(categoryProjects);
  });

  const validCategories = ["wonen", "werken", "interieur"];

  app.post("/api/admin/projects", requireAuth, upload.single("image"), async (req, res) => {
    const { title, category, sortOrder } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: "Titel en categorie zijn verplicht" });
    }
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Ongeldige categorie" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Afbeelding is verplicht" });
    }
    const project = await storage.createProject({
      title: title.trim(),
      category,
      image: `/uploads/${req.file.filename}`,
      sortOrder: parseInt(sortOrder) || 0,
    });
    res.json(project);
  });

  app.put("/api/admin/projects/:id", requireAuth, upload.single("image"), async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, category, sortOrder } = req.body;
    const updateData: Record<string, any> = {};
    if (title) updateData.title = title.trim();
    if (category) {
      if (!validCategories.includes(category)) {
        return res.status(400).json({ error: "Ongeldige categorie" });
      }
      updateData.category = category;
    }
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    const project = await storage.updateProject(id, updateData);
    if (!project) {
      return res.status(404).json({ error: "Project niet gevonden" });
    }
    res.json(project);
  });

  app.delete("/api/admin/projects/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteProject(id);
    if (!success) {
      return res.status(404).json({ error: "Project niet gevonden" });
    }
    res.json({ success: true });
  });

  app.post("/api/admin/upload", requireAuth, upload.single("image"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Geen afbeelding geüpload" });
    }
    res.json({ path: `/uploads/${req.file.filename}` });
  });

  return httpServer;
}
