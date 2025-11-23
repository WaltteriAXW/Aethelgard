import * as PIXI from 'pixi.js';

/**
 * Texture Generator - Converts ASCII art to Pixi.js Textures
 * This allows us to use the existing pixel art definitions
 * while leveraging GPU acceleration
 */

// Color palettes from original game
const palettes = {
  hero: {
    a: '#1d3557',  // Armor blue
    s: '#ffcb9a',  // Skin
    c: '#457b9d',  // Cape/cloth
    h: '#f1faee',  // Highlights
    x: '#ffb703'   // Emblem/accent
  },
  skel: {
    a: '#1d3557',  // Shadow
    b: '#e1e5f2',  // Bone white
    r: '#e63946'   // Red eyes
  },
  wraith: {
    a: '#1d1d3a',  // Dark purple shadow
    b: '#6a4c93',  // Purple body
    e: '#b185db',  // Light purple
    r: '#ff006e'   // Pink eyes
  },
  golem: {
    a: '#2f3e46',  // Dark rock
    b: '#52796f',  // Medium rock
    c: '#84a98c',  // Light rock
    e: '#f77f00'   // Orange core/eyes
  },
  loot: {
    g: '#ffb703',  // Gold
    w: '#fff'      // White shine
  }
};

// Sprite definitions (16x16 ASCII art)
const definitions = {
  hero: [
    '......aaaa......',
    '.....ahhhha.....',
    '....ahhsshha....',
    '....ahssssaa....',
    '...aacccccaa....',
    '..aaccxxccca....',
    '..acccxxccca....',
    '..aacccccaaa....',
    '...haccccah.....',
    '...ha.aa.ah.....',
    '..aaa..aaaa.....',
    '..aa....aa......',
    '..aa....aa......',
    '.aa......aa.....',
    '................',
    '................'
  ],
  skel: [
    '......aaaa......',
    '.....abbbba.....',
    '....abrrbba.....',
    '....abbbbba.....',
    '...aabbbbbaa....',
    '..aabbbbbbba....',
    '..abbbbbbbba....',
    '..aabbbbbaa.....',
    '....abbbba......',
    '...aa.bb.aa.....',
    '..aa..bb..aa....',
    '..aa..aa..aa....',
    '.aa....aa...aa..',
    '................',
    '................',
    '................'
  ],
  wraith: [
    '......aaaa......',
    '.....abbbba.....',
    '....abrrrbba....',
    '....abeeeeba....',
    '...aabbbbbaa....',
    '..aabbbbbbba....',
    '..abbeebbeea....',
    '..aabbbbbba.....',
    '...aabbbaa......',
    '....abbba.......',
    '...aa.bba.......',
    '..aa..ba........',
    '.aa...aa........',
    '..aa.aa.........',
    '...aaa..........',
    '................'
  ],
  golem: [
    '.....aaaaaa.....',
    '....abbbbba.....',
    '...abbcccbba....',
    '..abbceeecba....',
    '..abcceeeccba...',
    '.abbbbccccbba...',
    '.abbbccccccba...',
    '..abbbbbbbba....',
    '..aabbbbbbaa....',
    '...aabbbbaa.....',
    '...aa.bb.aa.....',
    '..aa..bb..aa....',
    '..aa..aa..aa....',
    '.aa....aa...aa..',
    '................',
    '................'
  ],
  orb: [
    '................',
    '................',
    '.....gggg.......',
    '....ggwwgg......',
    '...ggwwwwgg.....',
    '..gggwwwwggg....',
    '..ggggggggg.....',
    '...gggggggg.....',
    '....gggggg......',
    '.....gggg.......',
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
