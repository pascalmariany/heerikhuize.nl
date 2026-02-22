import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/contact", (req, res) => {
    const { email, naam, bericht } = req.body;
    if (!email || !naam || !bericht) {
      return res.status(400).json({ error: "Alle velden zijn verplicht" });
    }
    console.log("Contact form submission:", { email, naam, bericht });
    res.json({ success: true, message: "Bericht ontvangen" });
  });

  return httpServer;
}
