/**
 * Example: Using the Dungeon Integration from Node.js/TypeScript
 * 
 * This file demonstrates how to call the Python dungeon generator
 * from Node.js/TypeScript code.
 */

import { execSync } from 'child_process';
import path from 'path';

// Example 1: Generate a dungeon synchronously
function generateDungeon(level: number, seed?: number): any {
  const scriptPath = path.join(process.cwd(), 'dungeon_integration.py');
  let command = `python3 "${scriptPath}" --level ${level} --compact --validate`;
  
  if (seed !== undefined) {
    command += ` --seed ${seed}`;
  }

  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      timeout: 30000, // 30 second timeout
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    return JSON.parse(output);
  } catch (error: any) {
    throw new Error(`Failed to generate dungeon: ${error.message}`);
  }
}

// Example 2: Using the API endpoint with fetch
async function generateDungeonViaAPI(level: number, seed?: number): Promise<any> {
  const response = await fetch('http://localhost:5000/api/dungeon/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ level, seed }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API error: ${error.error || error.message}`);
  }

  return await response.json();
}

// Example usage (if running this file directly)
if (require.main === module) {
  console.log('Example 1: Direct subprocess call');
  const dungeon1 = generateDungeon(3, 42);
  console.log(`Generated dungeon with ${dungeon1.rooms.length} rooms`);

  console.log('\nExample 2: Via API endpoint (requires server running)');
  generateDungeonViaAPI(5)
    .then(dungeon => {
      console.log(`Generated dungeon with ${dungeon.rooms.length} rooms via API`);
    })
    .catch(error => {
      console.error('API call failed:', error.message);
    });
}

export { generateDungeon, generateDungeonViaAPI };
