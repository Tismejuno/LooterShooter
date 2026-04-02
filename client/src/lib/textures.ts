/**
 * textures.ts
 *
 * Centralised texture library.  Every material that needs a map, normalMap, or
 * emissiveMap should import from here so textures are created once and reused.
 *
 * All heavy textures are loaded as real PNG asset files from /textures/*.
 * Lightweight procedural textures (glow gradient, etc.) are generated via
 * THREE.CanvasTexture and cached.
 */
import * as THREE from "three";

// ─── Pre-load pool ────────────────────────────────────────────────────────────
// We cache every texture by key so the same image is never decoded twice.
const cache = new Map<string, THREE.Texture>();

/**
 * Load a PNG from /textures/<name> and return a cached THREE.Texture.
 * repeat sets the UV repeat count on both axes.
 */
export function loadTex(
  name: string,
  repeat = 1,
  filter: THREE.MinificationTextureFilter = THREE.LinearMipmapLinearFilter
): THREE.Texture {
  const key = `${name}@${repeat}`;
  if (cache.has(key)) return cache.get(key)!;

  const loader = new THREE.TextureLoader();
  const tex = loader.load(`/textures/${name}`);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.minFilter = filter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  // Anisotropy of 4 is supported by virtually all WebGL hardware (WebGL2 min is 16).
  // Clamping to 4 rather than maxAnisotropy avoids over-sampling on weaker GPUs.
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

// ─── Named convenience accessors ─────────────────────────────────────────────

/** Brushed steel – player armour, weapon blade, chest plate */
export const metalTex  = (repeat = 2) => loadTex("metal.png",   repeat);

/** Cross-hatch leather – belt, weapon grip, boot strap */
export const leatherTex = (repeat = 2) => loadTex("leather.png", repeat);

/** Purple/blue magic swirl – potions, scrolls, magic effects */
export const magicTex  = (repeat = 1) => loadTex("magic.png",   repeat);

/** Faceted blue crystal – gems, ice items */
export const crystalTex = (repeat = 1) => loadTex("crystal.png", repeat);

/** Rough stone wall – rune tablets, dungeon surfaces */
export const stoneTex  = (repeat = 2) => loadTex("stone_wall.png", repeat);

/** Polished gold – rings, artifact trim, pauldrons */
export const goldTex   = (repeat = 1) => loadTex("gold.png",    repeat);

/** Sickly zombie skin – enemy humanoid bodies */
export const zombieSkinTex = () => loadTex("zombie_skin.png", 1);

/** Glowing rune inscription – rune tablet face */
export const runeInscriptionTex = () => loadTex("rune_inscription.png", 1);

/** Lava cracks – lava biome surfaces */
export const lavaTex   = (repeat = 2) => loadTex("lava.png",    repeat);

/** Snow / icy glitter – snow biome surfaces */
export const snowIceTex = (repeat = 3) => loadTex("snow_ice.png", repeat);

/** Dark wood planks – dungeon chests, floor boards */
export const woodPlankTex = (repeat = 2) => loadTex("wood_plank.png", repeat);

/** Radial glow gradient (white → transparent) for aura overlays */
export const glowGradientTex = () => loadTex("glow_gradient.png", 1);

// ─── Procedural canvas textures ──────────────────────────────────────────────
// These are generated at runtime so no external PNG is required.

const proceduralCache = new Map<string, THREE.Texture>();

function makeProceduralTex(key: string, draw: (ctx: CanvasRenderingContext2D) => void, size = 256): THREE.Texture {
  if (proceduralCache.has(key)) return proceduralCache.get(key)!;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  proceduralCache.set(key, tex);
  return tex;
}

/** Dark shadowy void surface with subtle purple noise – Shadowfell biome */
export const shadowVoidTex = (repeat = 2): THREE.Texture => {
  const tex = makeProceduralTex('shadowVoid', (ctx) => {
    const s = ctx.canvas.width;
    ctx.fillStyle = '#050010';
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * s;
      const y = Math.random() * s;
      const r = Math.random() * 3 + 0.5;
      const alpha = Math.random() * 0.4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${80 + Math.floor(Math.random() * 60)},0,${120 + Math.floor(Math.random() * 80)},${alpha})`;
      ctx.fill();
    }
  });
  tex.repeat.set(repeat, repeat);
  return tex;
};

/** Deep abyssal ocean floor texture – dark blues with bioluminescent spots */
export const abyssTex = (repeat = 2): THREE.Texture => {
  const tex = makeProceduralTex('abyss', (ctx) => {
    const s = ctx.canvas.width;
    ctx.fillStyle = '#000810';
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * s;
      const y = Math.random() * s;
      const r = Math.random() * 2 + 0.3;
      const g = Math.floor(Math.random() * 180);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,${g},${100 + Math.floor(Math.random() * 155)},${Math.random() * 0.5 + 0.1})`;
      ctx.fill();
    }
    // Bioluminescent streaks
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * s;
      const y = Math.random() * s;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30);
      ctx.strokeStyle = `rgba(0,${100 + Math.floor(Math.random() * 155)},${200 + Math.floor(Math.random() * 55)},0.3)`;
      ctx.lineWidth = 0.5 + Math.random();
      ctx.stroke();
    }
  });
  tex.repeat.set(repeat, repeat);
  return tex;
};

/** Eternal Forge floor – glowing iron with lava cracks and hammer marks */
export const forgeTex = (repeat = 2): THREE.Texture => {
  const tex = makeProceduralTex('forge', (ctx) => {
    const s = ctx.canvas.width;
    ctx.fillStyle = '#1a0800';
    ctx.fillRect(0, 0, s, s);
    // Iron plate texture
    for (let x = 0; x < s; x += 32) {
      for (let y = 0; y < s; y += 32) {
        const brightness = 30 + Math.floor(Math.random() * 20);
        ctx.fillStyle = `rgb(${brightness},${Math.floor(brightness * 0.6)},0)`;
        ctx.fillRect(x + 1, y + 1, 30, 30);
      }
    }
    // Glowing lava cracks
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * s, Math.random() * s);
      ctx.lineTo(Math.random() * s, Math.random() * s);
      ctx.strokeStyle = `rgba(255,${60 + Math.floor(Math.random() * 100)},0,0.6)`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.stroke();
    }
    // Hammer marks (circular dents)
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * s;
      const y = Math.random() * s;
      ctx.beginPath();
      ctx.arc(x, y, 4 + Math.random() * 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
  tex.repeat.set(repeat, repeat);
  return tex;
};
