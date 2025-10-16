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

  // Loot generation endpoint with rate limiting
  app.post("/api/game/generate-loot", (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ 
          error: "Too many requests. Please try again later." 
        });
      }

      const { level, count, rarity, itemType, seed } = req.body;
      
      // Validate level
      if (!level || typeof level !== 'number' || level < 1 || level > 100 || !Number.isInteger(level)) {
        return res.status(400).json({ 
          error: "Invalid level. Must be an integer between 1 and 100." 
        });
      }

      // Validate count
      const itemCount = count || 1;
      if (typeof itemCount !== 'number' || itemCount < 1 || itemCount > 50 || !Number.isInteger(itemCount)) {
        return res.status(400).json({ 
          error: "Invalid count. Must be an integer between 1 and 50." 
        });
      }

      // Validate rarity
      const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      const itemRarity = rarity || 'common';
      if (!validRarities.includes(itemRarity)) {
        return res.status(400).json({ 
          error: `Invalid rarity. Must be one of: ${validRarities.join(', ')}` 
        });
      }

      // Validate item type if provided
      if (itemType) {
        const validTypes = ['weapon', 'armor', 'potion', 'scroll'];
        if (!validTypes.includes(itemType)) {
          return res.status(400).json({ 
            error: `Invalid item type. Must be one of: ${validTypes.join(', ')}` 
          });
        }
      }

      // Validate seed if provided
      if (seed !== undefined && (typeof seed !== 'number' || !Number.isInteger(seed))) {
        return res.status(400).json({ 
          error: "Invalid seed. Must be an integer." 
        });
      }

      const scriptPath = path.join(process.cwd(), "looter_shooter_integration.py");
      const args = [
        '--action', 'generate-loot',
        '--level', level.toString(),
        '--count', itemCount.toString(),
        '--rarity', itemRarity,
        '--compact'
      ];
      
      if (itemType) {
        args.push('--item-type', itemType);
      }
      
      if (seed !== undefined) {
        args.push('--seed', seed.toString());
      }

      const output = execFileSync('python3', [scriptPath, ...args], {
        encoding: 'utf-8',
        timeout: 30000,
        maxBuffer: 10 * 1024 * 1024
      });

      const result = JSON.parse(output);
      res.json(result);
      
    } catch (error: any) {
      console.error("Loot generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate loot",
        message: error.message 
      });
    }
  });

  // Combat simulation endpoint with rate limiting
  app.post("/api/game/simulate-combat", (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ 
          error: "Too many requests. Please try again later." 
        });
      }

      const { playerLevel, enemyLevel, enemyType, seed } = req.body;
      
      // Validate player level
      if (!playerLevel || typeof playerLevel !== 'number' || playerLevel < 1 || playerLevel > 100 || !Number.isInteger(playerLevel)) {
        return res.status(400).json({ 
          error: "Invalid playerLevel. Must be an integer between 1 and 100." 
        });
      }

      // Validate enemy level
      if (!enemyLevel || typeof enemyLevel !== 'number' || enemyLevel < 1 || enemyLevel > 100 || !Number.isInteger(enemyLevel)) {
        return res.status(400).json({ 
          error: "Invalid enemyLevel. Must be an integer between 1 and 100." 
        });
      }

      // Validate enemy type
      const validEnemyTypes = ['zombie', 'skeleton', 'orc', 'demon'];
      const enemy = enemyType || 'zombie';
      if (!validEnemyTypes.includes(enemy)) {
        return res.status(400).json({ 
          error: `Invalid enemyType. Must be one of: ${validEnemyTypes.join(', ')}` 
        });
      }

      // Validate seed if provided
      if (seed !== undefined && (typeof seed !== 'number' || !Number.isInteger(seed))) {
        return res.status(400).json({ 
          error: "Invalid seed. Must be an integer." 
        });
      }

      const scriptPath = path.join(process.cwd(), "looter_shooter_integration.py");
      const args = [
        '--action', 'simulate-combat',
        '--player-level', playerLevel.toString(),
        '--enemy-level', enemyLevel.toString(),
        '--enemy-type', enemy,
        '--compact'
      ];
      
      if (seed !== undefined) {
        args.push('--seed', seed.toString());
      }

      const output = execFileSync('python3', [scriptPath, ...args], {
        encoding: 'utf-8',
        timeout: 30000,
        maxBuffer: 10 * 1024 * 1024
      });

      const result = JSON.parse(output);
      res.json(result);
      
    } catch (error: any) {
      console.error("Combat simulation error:", error);
      res.status(500).json({ 
        error: "Failed to simulate combat",
        message: error.message 
      });
    }
  });

  // Dungeon run simulation endpoint with rate limiting
  app.post("/api/game/simulate-dungeon", (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ 
          error: "Too many requests. Please try again later." 
        });
      }

      const { playerLevel, dungeonLevel, seed } = req.body;
      
      // Validate player level
      if (!playerLevel || typeof playerLevel !== 'number' || playerLevel < 1 || playerLevel > 100 || !Number.isInteger(playerLevel)) {
        return res.status(400).json({ 
          error: "Invalid playerLevel. Must be an integer between 1 and 100." 
        });
      }

      // Validate dungeon level
      if (!dungeonLevel || typeof dungeonLevel !== 'number' || dungeonLevel < 1 || dungeonLevel > 100 || !Number.isInteger(dungeonLevel)) {
        return res.status(400).json({ 
          error: "Invalid dungeonLevel. Must be an integer between 1 and 100." 
        });
      }

      // Validate seed if provided
      if (seed !== undefined && (typeof seed !== 'number' || !Number.isInteger(seed))) {
        return res.status(400).json({ 
          error: "Invalid seed. Must be an integer." 
        });
      }

      const scriptPath = path.join(process.cwd(), "looter_shooter_integration.py");
      const args = [
        '--action', 'simulate-dungeon',
        '--player-level', playerLevel.toString(),
        '--dungeon-level', dungeonLevel.toString(),
        '--compact'
      ];
      
      if (seed !== undefined) {
        args.push('--seed', seed.toString());
      }

      const output = execFileSync('python3', [scriptPath, ...args], {
        encoding: 'utf-8',
        timeout: 30000,
        maxBuffer: 10 * 1024 * 1024
      });

      const result = JSON.parse(output);
      res.json(result);
      
    } catch (error: any) {
      console.error("Dungeon simulation error:", error);
      res.status(500).json({ 
        error: "Failed to simulate dungeon",
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
