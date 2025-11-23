import { Container, Graphics } from '@pixi/react';
import { useCallback } from 'react';

/**
 * Map Component - Renders the tilemap
 * Uses Pixi Graphics API for efficient tile rendering
 */
export const Map = ({ mapSystem, cameraX, cameraY }) => {
  const TILE_SIZE = 48;
  const CANVAS_WIDTH = 1024;
  const CANVAS_HEIGHT = 576;

  /**
   * Draw the map tiles
   * Only renders tiles visible in the camera viewport for performance
   */
  const draw = useCallback((g) => {
    g.clear();

    // Calculate visible tile range
    const startX = Math.max(0, Math.floor(cameraX / TILE_SIZE) - 1);
    const endX = Math.min(mapSystem.width, Math.ceil((cameraX + CANVAS_WIDTH) / TILE_SIZE) + 1);
    const startY = Math.max(0, Math.floor(cameraY / TILE_SIZE) - 1);
    const endY = Math.min(mapSystem.height, Math.ceil((cameraY + CANVAS_HEIGHT) / TILE_SIZE) + 1);

    // Draw tiles
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = mapSystem.get(x, y);
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        if (tile === mapSystem.TILE_FLOOR) {
          // Moss green floor
          g.beginFill(0x3d5a40);
          g.drawRect(px, py, TILE_SIZE, TILE_SIZE);
          g.endFill();

          // Subtle tile border
          g.lineStyle(1, 0x2d4a30, 0.3);
          g.drawRect(px, py, TILE_SIZE, TILE_SIZE);
        } else if (tile === mapSystem.TILE_WALL) {
          // Dark stone wall
          g.beginFill(0x2b2d42);
          g.drawRect(px, py, TILE_SIZE, TILE_SIZE);
          g.endFill();

          // Wall highlight for depth
          g.lineStyle(2, 0x3d3f5a, 0.5);
          g.moveTo(px, py);
          g.lineTo(px + TILE_SIZE, py);
          g.lineTo(px + TILE_SIZE, py + TILE_SIZE);
        }
      }
    }
  }, [mapSystem, cameraX, cameraY, TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT]);

  return <Graphics draw={draw} />;
};
