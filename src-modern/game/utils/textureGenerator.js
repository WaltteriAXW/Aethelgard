import * as PIXI from 'pixi.js';

/**
 * Modern Texture Generator - High-quality detailed sprites
 * 32x32 resolution with advanced shading and detail
 */

// Modern color palettes with gradients and shading
const palettes = {
  hero: {
    // Armor
    a1: '#1a3a52', // Darkest armor shadow
    a2: '#2c5f8d', // Dark armor
    a3: '#4a7fa8', // Medium armor
    a4: '#6b9fc4', // Light armor
    a5: '#8fb9d9', // Brightest armor highlight
    // Skin
    s1: '#d4a574', // Shadow skin
    s2: '#ffd7a8', // Base skin
    s3: '#ffebb8', // Light skin
    // Cape
    c1: '#3d6b99', // Dark cape
    c2: '#5da5d5', // Medium cape
    c3: '#7ec4f0', // Light cape
    // Gold/Emblem
    g1: '#b8860b', // Dark gold
    g2: '#ffa500', // Medium gold
    g3: '#ffd700', // Bright gold
    // Highlights
    h: '#ffffff',  // White highlights
    o: '#0a0a0a'   // Black outline
  },
  skel: {
    // Bone
    b1: '#8b8b9e', // Shadow bone
    b2: '#c0c0d4', // Dark bone
    b3: '#e0e0f0', // Medium bone
    b4: '#f0f4f8', // Light bone
    b5: '#ffffff', // Bright bone
    // Eyes
    r1: '#cc0000', // Dark red
    r2: '#ff2a2a', // Bright red
    r3: '#ff6666', // Glow red
    // Shadow
    a1: '#0f0f1a', // Darkest shadow
    a2: '#1a1a2e', // Medium shadow
    o: '#000000'   // Black outline
  },
  wraith: {
    // Purple body
    p1: '#2a1f3d', // Darkest purple
    p2: '#4a3a6e', // Dark purple
    p3: '#6b5499', // Medium purple
    p4: '#8257e5', // Bright purple
    p5: '#a67bf5', // Light purple
    p6: '#c084fc', // Brightest purple glow
    // Eyes
    r1: '#cc0055', // Dark pink
    r2: '#ff0080', // Hot pink
    r3: '#ff66b3', // Light pink glow
    // Ethereal effect
    e1: '#9f7aea', // Glow 1
    e2: '#b794f4', // Glow 2
    e3: '#d6bcfa', // Glow 3
    o: '#0d0d1f'   // Black outline
  },
  golem: {
    // Stone
    s1: '#1f2729', // Darkest stone
    s2: '#3a4a52', // Dark stone
    s3: '#4d5d65', // Medium-dark stone
    s4: '#5d7d72', // Medium stone
    s5: '#7a9a8a', // Medium-light stone
    s6: '#9fbfb0', // Light stone
    s7: '#c0d9c9', // Lightest stone
    // Core
    c1: '#cc5500', // Dark orange
    c2: '#ff6600', // Medium orange
    c3: '#ff8c00', // Bright orange
    c4: '#ffa500', // Yellow-orange
    c5: '#ffcc00', // Golden glow
    o: '#000000'   // Black outline
  },
  loot: {
    g1: '#8b6914', // Dark gold
    g2: '#b8860b', // Medium-dark gold
    g3: '#daa520', // Medium gold
    g4: '#ffd700', // Bright gold
    g5: '#ffed4e', // Yellow glow
    w: '#ffffff',  // White shine
    o: '#5a4a0a'   // Dark outline
  }
};

// Modern 32x32 detailed sprite definitions
const definitions = {
  hero: [
    '................................',
    '................................',
    '..........oooooooooo............',
    '........ooh4h4h4h4h4oo..........',
    '.......oh4s3s3s2s2s3s3o.........',
    '......oh4s3s2s2s2s2s2s3o........',
    '.....ooh4s2s2s2s2s2s2s2ho.......',
    '.....oh4s2s2s3s3s2s2s2s2o.......',
    '....ooa3a4a4c3c2c2c3a4a3oo......',
    '....oa2a3c2c2g3g2g2c2c3a2o......',
    '...ooa2c2c2c2c2c2c2c2c2c2oo.....',
    '...oa2c2c2c2c2c2c2c2c2c2a2o.....',
    '...oa2c2c2c2c2c2c2c2c2c2a2o.....',
    '..ooa2a3c2c2c2c2c2c2c2c3a2oo....',
    '..oa1a2a3c2c2c2c2c2c2c3a2a1o....',
    '...ooa2a2c2c2c2c2c2c2c2a2oo.....',
    '....ooa2a2c2c2c2c2c2c2a2oo......',
    '.....ooa2a3a3a3a3a3a3a2oo.......',
    '......ooa2a2a2a2a2a2a2oo........',
    '.......ooa2a2oooooa2a2oo........',
    '.......ooa2a2o....oa2a2o........',
    '......ooa2a3a2o..oa2a3a2oo......',
    '.....ooa1a2a2o....oa2a2a1oo.....',
    '.....oa1a2a2o......oa2a2a1o.....',
    '....ooa1a2a2o......oa2a2a1oo....',
    '....oa1a1a2o........oa2a1a1o....',
    '...ooa1a1a2o........oa2a1a1oo...',
    '...oa1a1a1o..........oa1a1a1o...',
    '..ooa1a1a1o..........oa1a1a1oo..',
    '..oa1a1ooo............oooa1a1o..',
    '................................',
    '................................'
  ],
  skel: [
    '................................',
    '................................',
    '..........oooooooooo............',
    '.........ob4b4b4b4b4o...........',
    '........ob4b5b4b4b5b4o..........',
    '.......oob3r2r2oor2r2b3oo.......',
    '......oob3r3r3r1or3r3r1b3o......',
    '.....oob3b4r2r2oor2r2b4b3oo.....',
    '.....ob2b3b4b4b4b4b4b4b3b2o.....',
    '....oob2b3b4b5b4b4b5b4b3b2oo....',
    '....oa2b2b3b4b4b4b4b4b3b2a2o....',
    '...ooa2b2b3b4b4b4b4b4b3b2a2oo...',
    '...oa2b2b3b4b4b4b4b4b4b3b2a2o...',
    '...oa2b2b3b4b5b4b4b5b4b3b2a2o...',
    '..ooa2b2b3b4b4b4b4b4b4b3b2a2oo..',
    '..oa2b2b3b4b4b4b4b4b4b4b3b2a2o..',
    '...ooa2b2b3b4b4b4b4b4b3b2a2oo...',
    '....ooa2b2b3b4b4b4b4b3b2a2oo....',
    '.....ooa2b2b3b4b4b4b3b2a2oo.....',
    '......ooa2b2b3b4b4b3b2a2oo......',
    '.......oooa2b2b3b3b2a2ooo.......',
    '........ooa2b2b3b3b2a2oo........',
    '........ooa2b1oooob1a2oo........',
    '.......ooa2b2b1o.ob1b2a2oo......',
    '......ooa1a2b2o...ob2a2a1oo.....',
    '.....ooa1a2b2b1o.ob1b2a2a1oo....',
    '.....oa1a2b2o.....ob2a2a1o......',
    '....ooa1a2b2o.....ob2a2a1oo.....',
    '....oa1a1a2o.......oa2a1a1o.....',
    '...ooa1a1a1o.......oa1a1a1oo....',
    '................................',
    '................................'
  ],
  wraith: [
    '................................',
    '..........oooooooooo............',
    '.........op5p5p5p5p5o...........',
    '........op4p5p6e3e3p5p4o........',
    '.......oop4p5r2r2oor2r2p5p4oo...',
    '......oop3p4r3r3r1or3r3r1p4p3oo.',
    '.....oop3p4p5r2r2oor2r2p5p4p3oo.',
    '.....op2p3p4p5p5p5p5p5p5p4p3p2o.',
    '....oop2p3p4e2e2e3e3e2e2p4p3p2oo',
    '....op1p2p3p4p5p6e3e3p6p5p4p3p2o',
    '...oop1p2p3p4p5p5p5p5p5p4p3p2p1o',
    '...op1p2p3p4p5p5p5p5p5p5p4p3p2o.',
    '...op1p2p3p4e2p5p5p5p5e2p4p3p2o.',
    '..oop1p2p3p4p5e2e2e2e2p5p4p3p2oo',
    '..op1p2p3p4p5p5p5p5p5p5p4p3p2o..',
    '...oop1p2p3p4p5p5p5p5p4p3p2p1oo.',
    '....oop1p2p3p4p5p5p5p4p3p2p1oo..',
    '.....oop1p2p3p4p5p5p4p3p2p1oo...',
    '......oop1p2p3p4p5p4p3p2p1oo....',
    '.......oooop1p2p4p4p2p1oooo.....',
    '........oooop1p3p3p1oooo........',
    '.........oooop2p2p2ooo..........',
    '..........oooop2p2oo............',
    '..........oooop1p2p1oo..........',
    '.........oooop1p2p2ooo..........',
    '........oooop1p2p1ooo...........',
    '.......ooooop1p2oooo............',
    '......ooooop1p2ooo..............',
    '.....ooooop1p1oooo..............',
    '....oooooop1oooo................',
    '................................',
    '................................'
  ],
  golem: [
    '................................',
    '............oooooooooo..........',
    '..........oos5s6s6s6s5oo........',
    '.........oos4s5s6s7s6s5s4oo.....',
    '........oos3s4s5s6s6s5s4s3oo....',
    '.......oos3s4s5s6s6s6s5s4s3oo...',
    '......oos2s3s4s5s6s7s6s5s4s3oo..',
    '.....oos2s3s4c4c5c5c4c4s4s3s2oo.',
    '.....os2s3s4c3c4c5c5c4c3s4s3s2o.',
    '....oos2s3s4c3c4c5c4c3c3s4s3s2o.',
    '....os1s2s3s4s5c4c4c4s5s4s3s2oo.',
    '...oos1s2s3s4s5s6s6s6s5s4s3s2s1o',
    '...os1s2s3s4s5s6s6s6s6s5s4s3s2o.',
    '..oos1s2s3s4s5s6s7s7s6s5s4s3s2oo',
    '..os1s2s3s4s5s6s6s6s6s6s5s4s3s2o',
    '..os1s2s3s4s5s6s6s6s6s6s5s4s3s2o',
    '.oos1s2s3s4s5s6s6s6s6s6s5s4s3s2o',
    '.os1s2s3s4s5s6s6s6s6s6s6s5s4s3o.',
    '.oos1s2s3s4s5s6s6s6s6s6s5s4s3oo.',
    '..oos1s2s3s4s5s6s6s6s6s5s4s3oo..',
    '...ooos1s2s3s4s5s6s6s5s4s3s2ooo.',
    '....oos1s2s3s4s5s6s6s5s4s3s2oo..',
    '.....oos1s2s3s4s5s5s5s4s3s2oo...',
    '......ooos1s2s3s4s4s4s3s2s1ooo..',
    '.......ooos2s2s3s4s4s3s2s2ooo...',
    '........oos1s2s2ooos2s2s1oo.....',
    '.........oos1s2s1oos1s2s1oo.....',
    '........oos1s2s2o.os2s2s1oo.....',
    '.......oos1s2s2o...os2s2s1oo....',
    '......oos1s1s2o.....os2s1s1oo...',
    '.....ooos1s1ooo.....ooos1s1ooo..',
    '................................'
  ],
  orb: [
    '................................',
    '................................',
    '............oooooooooo..........',
    '..........oog4g5g5g5g4oo........',
    '.........oog3g4g5wg5g4g3oo......',
    '........oog2g3g4g5g5g4g3g2oo....',
    '.......oog2g3g4g5wg5g4g3g2oo....',
    '......oog1g2g3g4g5g5g4g3g2g1oo..',
    '.....oog1g2g3g4g5g5g5g4g3g2g1oo.',
    '.....og1g2g3g4wwg5g5wwg4g3g2g1o.',
    '....oog1g2g3g4g5g5g5g5g4g3g2g1o.',
    '....og1g2g3g4g5g5g5g5g5g4g3g2oo.',
    '...oog1g2g3g4g5g5g5g5g5g4g3g2o..',
    '...og1g2g3g4g4g4g4g4g4g4g3g2g1o.',
    '..oog1g2g3g4g4g4g4g4g4g3g3g2g1o.',
    '..og1g2g3g3g3g4g4g4g4g3g3g2g1oo.',
    '..oog1g2g3g3g3g3g3g3g3g3g2g1oo..',
    '...oog1g2g3g3g3g3g3g3g3g2g1oo...',
    '....oog1g2g2g3g3g3g3g3g2g1oo....',
    '.....oog1g2g2g2g3g3g3g2g1oo.....',
    '......oogg1g2g2g2g2g2g1gooo.....',
    '.......oooog1g2g2g2g1goooo......',
    '........oooogg1g2g1ggoooo.......',
    '.........oooogg1g1ggooo.........',
    '..........oooggggggoo...........',
    '...........ooogggooo............',
    '............ooooooo.............',
    '............................................',
    '................................',
    '................................',
    '................................',
    '................................'
  ]
};

/**
 * Convert high-res ASCII art array to Pixi.js Texture
 * Now supports 32x32 sprites for more detail
 */
export function createTextureFromAscii(pixelArray, palette, scale = 2) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const baseSize = pixelArray.length; // Auto-detect size (32x32 or 16x16)
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
 * Now creates high-resolution modern sprites
 */
export function generateAllTextures() {
  const textures = {};

  // Palette mapping
  const paletteMapping = {
    hero: 'hero',
    skel: 'skel',
    wraith: 'wraith',
    golem: 'golem',
    orb: 'loot',
  };

  for (const [name, definition] of Object.entries(definitions)) {
    const paletteName = paletteMapping[name];
    const palette = palettes[paletteName];

    if (!palette) {
      console.error(`[TextureGen] Missing palette for ${name}`);
      continue;
    }

    // Use scale 2 for 32x32 sprites (makes them 64x64 final)
    textures[name] = createTextureFromAscii(definition, palette, 2);
  }

  console.log('[TextureGen] Generated modern textures:', Object.keys(textures));
  return textures;
}

/**
 * Create a simple tile texture (for map)
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
