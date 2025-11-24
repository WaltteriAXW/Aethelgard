import * as PIXI from 'pixi.js';
import { generateAllTextures } from './textureGenerator';

/**
 * AdvancedTextureLoader - AAA Graphics System
 * Loads high-quality image sprites with fallback to ASCII art
 */

const ASSET_PATHS = {
  sprites: {
    hero: '/assets/sprites/hero.png',
    hero_idle: '/assets/sprites/hero_idle.png',
    hero_walk: '/assets/sprites/hero_walk.png',
    hero_attack: '/assets/sprites/hero_attack.png',
    skel: '/assets/sprites/skeleton.png',
    wraith: '/assets/sprites/wraith.png',
    golem: '/assets/sprites/golem.png',
  },
  effects: {
    slash: '/assets/effects/slash.png',
    hit: '/assets/effects/hit.png',
    blood: '/assets/effects/blood.png',
    sparkle: '/assets/effects/sparkle.png',
    explosion: '/assets/effects/explosion.png',
  },
  tiles: {
    floor: '/assets/tiles/floor.png',
    wall: '/assets/tiles/wall.png',
  },
};

/**
 * Check if an image exists
 */
async function imageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Load a texture from URL with error handling
 */
async function loadTexture(url) {
  try {
    const exists = await imageExists(url);
    if (!exists) {
      console.log(`[TextureLoader] Image not found: ${url}`);
      return null;
    }

    const texture = await PIXI.Assets.load(url);
    console.log(`[TextureLoader] ✓ Loaded: ${url}`);
    return texture;
  } catch (error) {
    console.warn(`[TextureLoader] Failed to load ${url}:`, error);
    return null;
  }
}

/**
 * Create animated sprite from spritesheet
 * @param {PIXI.Texture} texture - The spritesheet texture
 * @param {number} frameWidth - Width of each frame
 * @param {number} frameHeight - Height of each frame
 * @param {number} frameCount - Number of frames
 * @returns {PIXI.Texture[]} Array of frame textures
 */
function createAnimationFrames(texture, frameWidth, frameHeight, frameCount) {
  const frames = [];

  for (let i = 0; i < frameCount; i++) {
    const x = (i * frameWidth) % texture.width;
    const y = Math.floor((i * frameWidth) / texture.width) * frameHeight;

    const frame = new PIXI.Texture({
      source: texture.source,
      frame: new PIXI.Rectangle(x, y, frameWidth, frameHeight),
    });

    frames.push(frame);
  }

  return frames;
}

/**
 * Load all game textures with fallback system
 * Priority: High-quality images → ASCII art fallback
 */
export async function loadAllTextures() {
  console.log('[TextureLoader] 🎨 Loading AAA graphics...');

  const textures = {};
  const animations = {};
  let loadedCount = 0;
  let fallbackCount = 0;

  // Try to load sprite images
  for (const [name, path] of Object.entries(ASSET_PATHS.sprites)) {
    const texture = await loadTexture(path);

    if (texture) {
      textures[name.split('_')[0]] = texture; // Remove animation suffix
      loadedCount++;

      // Check if it's an animation spritesheet
      if (name.includes('_')) {
        const baseName = name.split('_')[0];
        const animType = name.split('_')[1];

        if (!animations[baseName]) animations[baseName] = {};

        // Detect frame count based on texture width/height
        const frameSize = 64; // Assuming 64x64 frames
        const frameCount = Math.floor(texture.width / frameSize);

        if (frameCount > 1) {
          animations[baseName][animType] = createAnimationFrames(
            texture,
            frameSize,
            frameSize,
            frameCount
          );
          console.log(`[TextureLoader] ✓ Created ${frameCount} frames for ${baseName}.${animType}`);
        }
      }
    }
  }

  // Try to load effect images
  for (const [name, path] of Object.entries(ASSET_PATHS.effects)) {
    const texture = await loadTexture(path);
    if (texture) {
      textures[`effect_${name}`] = texture;
      loadedCount++;
    }
  }

  // Try to load tile images
  for (const [name, path] of Object.entries(ASSET_PATHS.tiles)) {
    const texture = await loadTexture(path);
    if (texture) {
      textures[`tile_${name}`] = texture;
      loadedCount++;
    }
  }

  // Generate ASCII art fallbacks for missing sprites
  const asciiTextures = generateAllTextures();

  for (const [name, texture] of Object.entries(asciiTextures)) {
    if (!textures[name]) {
      textures[name] = texture;
      fallbackCount++;
    }
  }

  console.log(`[TextureLoader] 📊 Loaded ${loadedCount} images, ${fallbackCount} ASCII fallbacks`);
  console.log('[TextureLoader] ✅ Texture loading complete!');

  return { textures, animations };
}

/**
 * Apply visual enhancements to textures
 * Adds glow, outline, and other AAA effects
 */
export function enhanceTexture(texture, options = {}) {
  const {
    glow = false,
    glowColor = 0xffffff,
    glowStrength = 0.5,
    outline = false,
    outlineColor = 0x000000,
    outlineWidth = 2,
  } = options;

  // Create a render texture for effects
  const sprite = new PIXI.Sprite(texture);
  const bounds = sprite.getBounds();

  const padding = outline ? outlineWidth * 2 : glow ? 10 : 0;
  const renderTexture = PIXI.RenderTexture.create({
    width: bounds.width + padding * 2,
    height: bounds.height + padding * 2,
  });

  const renderer = PIXI.autoDetectRenderer();
  const container = new PIXI.Container();

  // Add outline if enabled
  if (outline) {
    for (let x = -outlineWidth; x <= outlineWidth; x++) {
      for (let y = -outlineWidth; y <= outlineWidth; y++) {
        if (x === 0 && y === 0) continue;
        const outlineSprite = new PIXI.Sprite(texture);
        outlineSprite.x = padding + x;
        outlineSprite.y = padding + y;
        outlineSprite.tint = outlineColor;
        container.addChild(outlineSprite);
      }
    }
  }

  // Add glow if enabled
  if (glow) {
    const glowSprite = new PIXI.Sprite(texture);
    glowSprite.x = padding;
    glowSprite.y = padding;
    glowSprite.tint = glowColor;
    glowSprite.alpha = glowStrength;
    glowSprite.scale.set(1.2);
    container.addChild(glowSprite);
  }

  // Add main sprite
  sprite.x = padding;
  sprite.y = padding;
  container.addChild(sprite);

  renderer.render(container, { renderTexture });

  return renderTexture;
}
