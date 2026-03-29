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
