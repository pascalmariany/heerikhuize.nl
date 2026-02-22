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

  app.get("/api/project/:id", async (req, res) => {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Ongeldig project ID" });
    }
    const project = await storage.getProject(id);
    if (!project) {
      return res.status(404).json({ error: "Project niet gevonden" });
    }
    const images = await storage.getProjectImages(id);
    res.json({ ...project, images });
  });

  app.get("/api/projects/:category", async (req, res) => {
    const category = req.params.category as string;
    const categoryProjects = await storage.getProjectsByCategory(category);
    res.json(categoryProjects);
  });

  const validCategories = ["wonen", "werken", "interieur"];

  app.post("/api/admin/projects", requireAuth, upload.single("image"), async (req, res) => {
    const { title, category, sortOrder, description } = req.body;
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
      description: description || "",
      sortOrder: parseInt(sortOrder) || 0,
    });
    res.json(project);
  });

  app.put("/api/admin/projects/:id", requireAuth, upload.single("image"), async (req, res) => {
    const id = parseInt(req.params.id as string);
    const { title, category, sortOrder, description } = req.body;
    const updateData: Record<string, any> = {};
    if (title) updateData.title = title.trim();
    if (category) {
      if (!validCategories.includes(category)) {
        return res.status(400).json({ error: "Ongeldige categorie" });
      }
      updateData.category = category;
    }
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
    if (description !== undefined) updateData.description = description;
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
    const id = parseInt(req.params.id as string);
    const success = await storage.deleteProject(id);
    if (!success) {
      return res.status(404).json({ error: "Project niet gevonden" });
    }
    res.json({ success: true });
  });

  app.get("/api/admin/projects/:id/images", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id as string);
    const images = await storage.getProjectImages(id);
    res.json(images);
  });

  app.post("/api/admin/projects/:id/images", requireAuth, upload.array("images", 20), async (req, res) => {
    const projectId = parseInt(req.params.id as string);
    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project niet gevonden" });
    }
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Geen afbeeldingen geüpload" });
    }
    const existing = await storage.getProjectImages(projectId);
    const startOrder = existing.length;
    const created = [];
    for (let i = 0; i < files.length; i++) {
      const img = await storage.addProjectImage({
        projectId,
        image: `/uploads/${files[i].filename}`,
        sortOrder: startOrder + i,
      });
      created.push(img);
    }
    res.json(created);
  });

  app.delete("/api/admin/project-images/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id as string);
    const success = await storage.deleteProjectImage(id);
    if (!success) {
      return res.status(404).json({ error: "Afbeelding niet gevonden" });
    }
    res.json({ success: true });
  });

  // --- News Categories ---
  app.get("/api/news-categories", async (_req, res) => {
    const categories = await storage.getAllNewsCategories();
    res.json(categories);
  });

  app.post("/api/admin/news-categories", requireAuth, async (req, res) => {
    const { name, slug, sortOrder } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: "Naam en slug zijn verplicht" });
    }
    const category = await storage.createNewsCategory({
      name: name.trim(),
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""),
      sortOrder: parseInt(sortOrder) || 0,
    });
    res.json(category);
  });

  app.put("/api/admin/news-categories/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id as string);
    const { name, slug, sortOrder } = req.body;
    const updateData: Record<string, any> = {};
    if (name) updateData.name = name.trim();
    if (slug) updateData.slug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
    const category = await storage.updateNewsCategory(id, updateData);
    if (!category) {
      return res.status(404).json({ error: "Categorie niet gevonden" });
    }
    res.json(category);
  });

  app.delete("/api/admin/news-categories/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id as string);
    const success = await storage.deleteNewsCategory(id);
    if (!success) {
      return res.status(404).json({ error: "Categorie niet gevonden" });
    }
    res.json({ success: true });
  });

  // --- News Articles ---
  app.get("/api/news", async (_req, res) => {
    const articles = await storage.getPublishedNewsArticles();
    const categories = await storage.getAllNewsCategories();
    const articlesWithCategory = articles.map((a) => ({
      ...a,
      category: categories.find((c) => c.id === a.categoryId) || null,
    }));
    res.json(articlesWithCategory);
  });

  app.get("/api/news/:id", async (req, res) => {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Ongeldig artikel ID" });
    }
    const article = await storage.getNewsArticle(id);
    if (!article) {
      return res.status(404).json({ error: "Artikel niet gevonden" });
    }
    const categories = await storage.getAllNewsCategories();
    res.json({
      ...article,
      category: categories.find((c) => c.id === article.categoryId) || null,
    });
  });

  app.get("/api/admin/news", requireAuth, async (_req, res) => {
    const articles = await storage.getAllNewsArticles();
    const categories = await storage.getAllNewsCategories();
    const articlesWithCategory = articles.map((a) => ({
      ...a,
      category: categories.find((c) => c.id === a.categoryId) || null,
    }));
    res.json(articlesWithCategory);
  });

  app.post("/api/admin/news", requireAuth, upload.single("image"), async (req, res) => {
    const { title, content, categoryId, published } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Titel is verplicht" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Afbeelding is verplicht" });
    }
    const article = await storage.createNewsArticle({
      title: title.trim(),
      content: content || "",
      image: `/uploads/${req.file.filename}`,
      categoryId: categoryId ? parseInt(categoryId) : null,
      published: published !== undefined ? parseInt(published) : 1,
    });
    res.json(article);
  });

  app.put("/api/admin/news/:id", requireAuth, upload.single("image"), async (req, res) => {
    const id = parseInt(req.params.id as string);
    const { title, content, categoryId, published } = req.body;
    const updateData: Record<string, any> = {};
    if (title) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content;
    if (categoryId !== undefined) updateData.categoryId = categoryId ? parseInt(categoryId) : null;
    if (published !== undefined) updateData.published = parseInt(published);
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    const article = await storage.updateNewsArticle(id, updateData);
    if (!article) {
      return res.status(404).json({ error: "Artikel niet gevonden" });
    }
    res.json(article);
  });

  app.delete("/api/admin/news/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id as string);
    const success = await storage.deleteNewsArticle(id);
    if (!success) {
      return res.status(404).json({ error: "Artikel niet gevonden" });
    }
    res.json({ success: true });
  });

  return httpServer;
}
