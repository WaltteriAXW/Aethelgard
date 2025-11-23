import * as PIXI from 'pixi.js';

/**
 * Texture Generator - Converts ASCII art to Pixi.js Textures
 * This allows us to use the existing pixel art definitions
 * while leveraging GPU acceleration
 */

// Enhanced color palettes - Tier 1 Edition
const palettes = {
  hero: {
    a: '#2c5f8d',  // Rich armor blue
    s: '#ffd7a8',  // Warm skin tone
    c: '#5da5d5',  // Vibrant cape
    h: '#ffffff',  // Bright highlights
    x: '#ffa500',  // Golden emblem
    o: '#1a3a52'   // Dark outline
  },
  skel: {
    a: '#1a1a2e',  // Deep shadow
    b: '#f0f4f8',  // Bright bone white
    r: '#ff2a2a',  // Glowing red eyes
    d: '#8b8b9e',  // Dark bone
    o: '#0f0f1a'   // Black outline
  },
  wraith: {
    a: '#1e1e3f',  // Dark void
    b: '#8257e5',  // Vivid purple
    e: '#c084fc',  // Bright purple glow
    r: '#ff0080',  // Hot pink eyes
    d: '#4a3a6e',  // Dark purple
    o: '#0d0d1f'   // Black outline
  },
  golem: {
    a: '#3a4a52',  // Dark stone
    b: '#5d7d72',  // Medium stone
    c: '#9fbfb0',  // Light stone
    e: '#ff8c00',  // Glowing orange core
    h: '#ffa500',  // Bright orange
    o: '#1f2729'   // Black outline
  },
  loot: {
    g: '#ffd700',  // Pure gold
    w: '#ffffff',  // White shine
    y: '#ffed4e',  // Yellow glow
    o: '#b8860b'   // Dark gold outline
  }
};

// Enhanced sprite definitions (16x16 ASCII art) - Tier 1 Edition
const definitions = {
  hero: [
    '.....oooooo.....',
    '....ohhhhhho....',
    '...ohhssssho....',
    '...ohsshssho....',
    '..ooaaccccao....',
    '..oacxxccxcao...',
    '..oacccccccao...',
    '..oaacccccaao...',
    '...oaccccco.....',
    '...oaa..aao.....',
    '..oaao.oaaao....',
    '..oaa...oaao....',
    '..oaa...oaao....',
    '.oaa.....oaao...',
    '................',
    '................'
  ],
  skel: [
    '.....oooooo.....',
    '....oobbbbo.....',
    '...oobrrrbo.....',
    '...oobbbbboo....',
    '..oodbbbbdoo....',
    '..obbbbbbbbo....',
    '..obbbbbbbbo....',
    '..oobbbbbboo....',
    '...oobbbboo.....',
    '...oad.bdao.....',
    '..oaod.bdoao....',
    '..oao..bdoao....',
    '.oao....aoao....',
    '................',
    '................',
    '................'
  ],
  wraith: [
    '.....oooooo.....',
    '....oobbbbo.....',
    '...oobrrrrbo....',
    '...obeeeeeebo...',
    '..oodbbbbbdoo...',
    '..obbbbbbbbbo...',
    '..obeebbbeebo...',
    '..oobbbbbbbo....',
    '...oobbbboo.....',
    '....oobbbo......',
    '...ood.bbo......',
    '..oao..bdo......',
    '.oao...odo......',
    '..oao.oo........',
    '...ooo..........',
    '................'
  ],
  golem: [
    '....oooooooo....',
    '...oobbbbbbo....',
    '..oobccccccbo...',
    '..obcchhccccbo..',
    '..obcchhhcccbo..',
    '.oobbbccccbbbo..',
    '.obbbbccccbbbo..',
    '..obbbbbbbbbbo..',
    '..oobbbbbbbboo..',
    '...oobbbbbboo...',
    '...oab.bb.bao...',
    '..oaao.bb.oaao..',
    '..oao..bb..oao..',
    '.oao...oo...oao.',
    '................',
    '................'
  ],
  orb: [
    '................',
    '................',
    '....oooooooo....',
    '...oyggggyo.....',
    '...ogywwggo.....',
    '..oygwwwwgyo....',
    '..ogggggggo.....',
    '..oyggggyo......',
    '...oyggyo.......',
    '....oooo........',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................'
  ]
};

/**
 * Convert ASCII art array to Pixi.js Texture
 * @param {string[]} pixelArray - 16x16 array of characters
 * @param {Object} palette - Color mapping {char: hexColor}
 * @param {number} scale - Pixel scale (default 3 for retro look)
 * @returns {PIXI.Texture}
 */
export function createTextureFromAscii(pixelArray, palette, scale = 3) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const baseSize = 16;
  canvas.width = baseSize * scale;
  canvas.height = baseSize * scale;

  // Disable smoothing for crisp pixel art
  ctx.imageSmoothingEnabled = false;

  pixelArray.forEach((row, y) => {
    [...row].forEach((char, x) => {
      if (char !== '.' && palette[char]) {
        ctx.fillStyle = palette[char];
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    });
  });

  return PIXI.Texture.from(canvas);
}

/**
 * Generate all game textures
 * Call this once at startup
 * @returns {Object} Map of sprite name to PIXI.Texture
 */
export function generateAllTextures() {
  const textures = {};

  // Palette mapping (some sprites share palettes)
  const paletteMapping = {
    hero: 'hero',
    skel: 'skel',
    wraith: 'wraith',
    golem: 'golem',
    orb: 'loot', // orb uses loot palette
  };

  for (const [name, definition] of Object.entries(definitions)) {
    const paletteName = paletteMapping[name];
    const palette = palettes[paletteName];

    if (!palette) {
      console.error(`[TextureGen] Missing palette for ${name} (looked for ${paletteName})`);
      continue;
    }

    textures[name] = createTextureFromAscii(definition, palette, 3);
  }

  console.log('[TextureGen] Generated textures:', Object.keys(textures));
  return textures;
}

/**
 * Create a simple tile texture (for map)
 * @param {string} color - Hex color
 * @param {number} size - Tile size in pixels
 * @returns {PIXI.Texture}
 */
export function createTileTexture(color, size = 48) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  // Add subtle border for visibility
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, size, size);

  return PIXI.Texture.from(canvas);
}
