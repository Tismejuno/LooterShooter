import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { execSync } from "child_process";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Dungeon generation endpoint
  app.post("/api/dungeon/generate", (req, res) => {
    try {
      const { level, seed } = req.body;
      
      if (!level || typeof level !== 'number' || level < 1 || level > 100) {
        return res.status(400).json({ 
          error: "Invalid level. Must be a number between 1 and 100." 
        });
      }

      // Build command
      const scriptPath = path.join(process.cwd(), "dungeon_integration.py");
      let command = `python3 "${scriptPath}" --level ${level} --compact --validate`;
      
      if (seed !== undefined && typeof seed === 'number') {
        command += ` --seed ${seed}`;
      }

      // Execute Python script
      const output = execSync(command, {
        encoding: 'utf-8',
        timeout: 30000, // 30 second timeout
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      const dungeon = JSON.parse(output);
      res.json(dungeon);
      
    } catch (error: any) {
      console.error("Dungeon generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate dungeon",
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
