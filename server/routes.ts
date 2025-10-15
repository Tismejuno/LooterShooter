import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { execFileSync } from "child_process";
import path from "path";

// Rate limiting configuration
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Dungeon generation endpoint with rate limiting
  app.post("/api/dungeon/generate", (req, res) => {
    try {
      // Rate limiting implemented above to prevent DoS attacks
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ 
          error: "Too many requests. Please try again later." 
        });
      }

      const { level, seed } = req.body;
      
      // Strict validation to prevent command injection
      if (!level || typeof level !== 'number' || level < 1 || level > 100 || !Number.isInteger(level)) {
        return res.status(400).json({ 
          error: "Invalid level. Must be an integer between 1 and 100." 
        });
      }

      // Validate seed if provided
      if (seed !== undefined && (typeof seed !== 'number' || !Number.isInteger(seed))) {
        return res.status(400).json({ 
          error: "Invalid seed. Must be an integer." 
        });
      }

      // Use execFileSync instead of execSync to prevent command injection
      const scriptPath = path.join(process.cwd(), "dungeon_integration.py");
      const args = ['--level', level.toString(), '--compact', '--validate'];
      
      if (seed !== undefined) {
        args.push('--seed', seed.toString());
      }

      // Execute Python script securely
      const output = execFileSync('python3', [scriptPath, ...args], {
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
