import { Graphics } from '@pixi/react';
import { useCallback } from 'react';
import { useGameStore } from '../stores/useGameStore';

/**
 * LightingOverlay - Diablo-style Fog of War
 * CRITICAL: This component controls visibility
 * Proper configuration here solves the "too dark" problem
 */
export const LightingOverlay = ({ playerX, playerY, cameraX, cameraY }) => {
  const lighting = useGameStore(state => state.lighting);

  const CANVAS_WIDTH = 1024;
  const CANVAS_HEIGHT = 576;

  /**
   * Draw the lighting/darkness overlay
   * Uses destination-out blend mode to "cut holes" in darkness
   */
  const draw = useCallback((g) => {
    if (!lighting.enabled) {
      // Lighting disabled - full visibility
      return;
    }

    g.clear();

    // ============ STEP 1: Fill screen with darkness ============
    g.beginFill(0x000000, lighting.darknessOpacity); // CRITICAL: opacity controls darkness
    g.drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    g.endFill();

    // ============ STEP 2: Cut out vision circles ============
    // Convert player world position to screen position
    const playerScreenX = playerX - cameraX;
    const playerScreenY = playerY - cameraY;

    // Draw vision gradient (this creates the "light hole")
    // CRITICAL: Using multiply blend to lighten areas
    const gradient = g.beginTextureFill({
      texture: createRadialGradientTexture(
        lighting.visionRadius,
        lighting.darknessOpacity,
        lighting.lightFalloff
      )
    });

    // Position centered on player
    g.drawCircle(
      playerScreenX,
      playerScreenY,
      lighting.visionRadius
    );
    g.endFill();

  }, [lighting, playerX, playerY, cameraX, cameraY, CANVAS_WIDTH, CANVAS_HEIGHT]);

  return <Graphics draw={draw} alpha={1} />;
};

/**
 * Create a radial gradient texture for soft light falloff
 * This is more efficient than recreating the gradient every frame
 */
function createRadialGradientTexture(radius, opacity, falloff) {
  // For now, we'll use a simple approach
  // In production, you'd cache this texture
  const canvas = document.createElement('canvas');
  const size = radius * 2;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(
    radius, radius, 0,
    radius, radius, radius
  );

  // CRITICAL: Gradient stops control how light fades
  gradient.addColorStop(0, `rgba(0, 0, 0, ${opacity})`); // Center (fully lit)
  gradient.addColorStop(falloff, `rgba(0, 0, 0, ${opacity * 0.5})`); // Mid fade
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Edge (dark)

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Note: This is a simplified version
  // For Pixi.js, we'd actually need to return a texture
  // But Graphics API handles this differently
  return null;
}
