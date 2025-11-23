/**
 * Map System - Tier 1 Edition
 * Simplified procedural generation for Pixi.js rendering
 */

export class MapSystem {
  constructor(width = 50, height = 50) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height);

    // Tile constants
    this.TILE_VOID = 0;
    this.TILE_FLOOR = 1;
    this.TILE_WALL = 2;

    this.TILE_SIZE = 48;
  }

  /**
   * Get tile at position
   */
  get(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return this.TILE_WALL; // Treat out of bounds as wall
    }
    return this.data[y * this.width + x];
  }

  /**
   * Set tile at position
   */
  set(x, y, value) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.data[y * this.width + x] = value;
    }
  }

  /**
   * Generate map using simple noise
   */
  generate() {
    // Fill with void
    this.data.fill(this.TILE_VOID);

    // Create a simple cave-like structure
    // Start with random noise
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (Math.random() > 0.45) {
          this.set(x, y, this.TILE_FLOOR);
        }
      }
    }

    // Smooth with cellular automata
    this.smoothCaves(2);

    // Create a guaranteed center area
    const cx = Math.floor(this.width / 2);
    const cy = Math.floor(this.height / 2);
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        this.set(cx + dx, cy + dy, this.TILE_FLOOR);
      }
    }

    // Generate walls around floors
    this.generateWalls();

    // Return starting position in pixels
    return {
      x: cx * this.TILE_SIZE,
      y: cy * this.TILE_SIZE
    };
  }

  /**
   * Cellular automata smoothing
   */
  smoothCaves(iterations) {
    for (let iter = 0; iter < iterations; iter++) {
      const newData = new Uint8Array(this.data);

      for (let y = 1; y < this.height - 1; y++) {
        for (let x = 1; x < this.width - 1; x++) {
          let floorCount = 0;

          // Count floor neighbors
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (this.get(x + dx, y + dy) === this.TILE_FLOOR) {
                floorCount++;
              }
            }
          }

          // Smoothing rules
          if (floorCount >= 5) {
            newData[y * this.width + x] = this.TILE_FLOOR;
          } else if (floorCount <= 3) {
            newData[y * this.width + x] = this.TILE_VOID;
          }
        }
      }

      this.data = newData;
    }
  }

  /**
   * Place walls around floor tiles
   */
  generateWalls() {
    const tempData = new Uint8Array(this.data);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.get(x, y) === this.TILE_FLOOR) {
          // Check neighbors for void
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                if (tempData[ny * this.width + nx] === this.TILE_VOID) {
                  tempData[ny * this.width + nx] = this.TILE_WALL;
                }
              }
            }
          }
        }
      }
    }

    this.data = tempData;
  }

  /**
   * Find a random walkable position
   */
  findRandomFloor(minDistance = { x: 0, y: 0, distance: 0 }) {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);

      if (this.get(x, y) === this.TILE_FLOOR) {
        const dx = x * this.TILE_SIZE - minDistance.x;
        const dy = y * this.TILE_SIZE - minDistance.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist >= minDistance.distance) {
          return {
            x: x * this.TILE_SIZE,
            y: y * this.TILE_SIZE
          };
        }
      }

      attempts++;
    }

    // Fallback: return center
    return {
      x: Math.floor(this.width / 2) * this.TILE_SIZE,
      y: Math.floor(this.height / 2) * this.TILE_SIZE
    };
  }
}
