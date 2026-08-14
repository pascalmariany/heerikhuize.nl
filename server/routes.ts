import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seed } from "./seed";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import { getUncachableResendClient } from "./resend";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// Uploads gaan naar PostgreSQL (tabel uploaded_images) in plaats van naar schijf.
// In productie (Autoscale) is het bestandssysteem tijdelijk én wordt alleen de
// build-map geserveerd — bestanden op schijf verdwijnen daar of zijn onbereikbaar.
// Let op: memoryStorage buffert bestanden in RAM. Houd fileSize × files klein
// genoeg voor een Autoscale-instance; de client uploadt in kleine batches.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 4 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      const err = new Error("Bestandstype niet ondersteund") as Error & { code?: string };
      err.code = "UNSUPPORTED_FILE_TYPE";
      cb(err);
    }
  },
});

const INVALID_IMAGE_MSG =
  "Afbeelding kon niet worden verwerkt. Gebruik een JPG-, PNG- of WebP-bestand.";

function multerErrorMessage(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;
  if (code === "LIMIT_FILE_SIZE") {
    return "Afbeelding is te groot (maximaal 15 MB per foto).";
  }
  if (code === "UNSUPPORTED_FILE_TYPE") {
    return "Bestandstype niet ondersteund. Gebruik JPG, PNG, WebP of GIF.";
  }
  if (code === "LIMIT_UNEXPECTED_FILE" || code === "LIMIT_FILE_COUNT") {
    return "Te veel bestanden in één verzoek (maximaal 4 tegelijk).";
  }
  return "Uploaden mislukt. Probeer het opnieuw.";
}

function uploadSingle(field: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(field)(req, res, (err: unknown) => {
      if (err) {
        return res.status(400).json({ error: multerErrorMessage(err) });
      }
      next();
    });
  };
}

function uploadArray(field: string, maxCount: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(field, maxCount)(req, res, (err: unknown) => {
      if (err) {
        return res.status(400).json({ error: multerErrorMessage(err) });
      }
      next();
    });
  };
}

const MAX_IMAGE_DIMENSION = 2000;

// Comprimeert de afbeelding (max 2000px, EXIF-rotatie genormaliseerd) en slaat
// haar op in de database. Geeft het publieke pad (/uploads/...) terug.
async function processAndStoreImage(file: Express.Multer.File): Promise<string> {
  const ext = path.extname(file.originalname).toLowerCase();
  let data: Buffer;
  let mimeType: string;
  let finalExt: string;

  if (ext === ".gif") {
    // GIF ongewijzigd bewaren zodat animaties intact blijven,
    // maar wel valideren dat het echt een GIF is.
    const meta = await sharp(file.buffer).metadata();
    if (meta.format !== "gif") {
      throw new Error("Bestand is geen geldige GIF");
    }
    data = file.buffer;
    mimeType = "image/gif";
    finalExt = ".gif";
  } else {
    const pipeline = sharp(file.buffer).rotate().resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });
    if (ext === ".png") {
      data = await pipeline.png({ compressionLevel: 9 }).toBuffer();
      mimeType = "image/png";
      finalExt = ".png";
    } else if (ext === ".webp") {
      data = await pipeline.webp({ quality: 82 }).toBuffer();
      mimeType = "image/webp";
      finalExt = ".webp";
    } else {
      data = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      mimeType = "image/jpeg";
      finalExt = ".jpg";
    }
  }

  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${finalExt}`;
  await storage.saveUploadedImage({
    filename,
    mimeType,
    data,
    size: data.length,
  });
  return `/uploads/${filename}`;
}

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

  app.set("trust proxy", 1);

  app.use(
    session({
      store: new PgSession({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    })
  );

  await seed();

  app.post("/api/contact", async (req, res) => {
    const { email, naam, bericht } = req.body;
    if (!email || !naam || !bericht) {
      return res.status(400).json({ error: "Alle velden zijn verplicht" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Voer een geldig e-mailadres in" });
    }
    if (bericht.length > 5000) {
      return res.status(400).json({ error: "Bericht is te lang (maximaal 5000 tekens)" });
    }
    try {
      const { client, fromEmail } = await getUncachableResendClient();
      await client.emails.send({
        from: fromEmail,
        to: "info@heerikhuize.nl",
        subject: `Nieuw contactbericht van ${naam}`,
        text: `Naam: ${naam}\nE-mail: ${email}\n\n${bericht}`,
        replyTo: email,
      });
      res.json({ success: true, message: "Bericht ontvangen" });
    } catch (err) {
      console.error("Resend fout:", err);
      res.status(500).json({ error: "Bericht kon niet worden verstuurd. Probeer het later opnieuw." });
    }
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
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Sessie kon niet worden opgeslagen" });
      }
      res.json({ success: true });
    });
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

  // Geüploade afbeeldingen uit de database serveren (werkt in dev én productie).
  // Oudere bestanden die nog op schijf staan vallen door naar de static handler.
  app.get("/uploads/:filename", async (req, res, next) => {
    const filename = req.params.filename as string;
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(filename)) {
      return next();
    }
    const img = await storage.getUploadedImage(filename);
    if (!img) {
      return next();
    }
    res.setHeader("Content-Type", img.mimeType);
    res.setHeader("Content-Length", String(img.size));
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(img.data);
  });

  const validCategories = ["wonen", "werken", "interieur"];

  app.post("/api/admin/projects", requireAuth, uploadSingle("image"), async (req, res) => {
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
    let imagePath: string;
    try {
      imagePath = await processAndStoreImage(req.file);
    } catch (err) {
      console.error("Afbeelding verwerken mislukt:", err);
      return res.status(400).json({ error: INVALID_IMAGE_MSG });
    }
    const project = await storage.createProject({
      title: title.trim(),
      category,
      image: imagePath,
      description: description || "",
      sortOrder: parseInt(sortOrder) || 0,
    });
    res.json(project);
  });

  app.put("/api/admin/projects/:id", requireAuth, uploadSingle("image"), async (req, res) => {
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
      try {
        updateData.image = await processAndStoreImage(req.file);
      } catch (err) {
        console.error("Afbeelding verwerken mislukt:", err);
        return res.status(400).json({ error: INVALID_IMAGE_MSG });
      }
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

  app.post("/api/admin/projects/:id/images", requireAuth, uploadArray("images", 4), async (req, res) => {
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
    const storedPaths: string[] = [];
    try {
      for (const f of files) {
        storedPaths.push(await processAndStoreImage(f));
      }
    } catch (err) {
      console.error("Afbeelding verwerken mislukt:", err);
      return res.status(400).json({ error: INVALID_IMAGE_MSG });
    }
    const created = [];
    for (let i = 0; i < storedPaths.length; i++) {
      const img = await storage.addProjectImage({
        projectId,
        image: storedPaths[i],
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

  app.post("/api/admin/news", requireAuth, uploadSingle("image"), async (req, res) => {
    const { title, content, categoryId, published } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Titel is verplicht" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Afbeelding is verplicht" });
    }
    let imagePath: string;
    try {
      imagePath = await processAndStoreImage(req.file);
    } catch (err) {
      console.error("Afbeelding verwerken mislukt:", err);
      return res.status(400).json({ error: INVALID_IMAGE_MSG });
    }
    const article = await storage.createNewsArticle({
      title: title.trim(),
      content: content || "",
      image: imagePath,
      categoryId: categoryId ? parseInt(categoryId) : null,
      published: published !== undefined ? parseInt(published) : 1,
    });
    res.json(article);
  });

  app.put("/api/admin/news/:id", requireAuth, uploadSingle("image"), async (req, res) => {
    const id = parseInt(req.params.id as string);
    const { title, content, categoryId, published } = req.body;
    const updateData: Record<string, any> = {};
    if (title) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content;
    if (categoryId !== undefined) updateData.categoryId = categoryId ? parseInt(categoryId) : null;
    if (published !== undefined) updateData.published = parseInt(published);
    if (req.file) {
      try {
        updateData.image = await processAndStoreImage(req.file);
      } catch (err) {
        console.error("Afbeelding verwerken mislukt:", err);
        return res.status(400).json({ error: INVALID_IMAGE_MSG });
      }
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
