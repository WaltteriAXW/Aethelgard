/**
 * Map System
 * Procedural map generation using drunkard's walk algorithm
 */

import { CFG } from './config.js';

export class MapSystem {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = new Uint8Array(width * height);

        // Tile types
        this.TILE_VOID = 0;
        this.TILE_FLOOR = 1;
        this.TILE_WALL = 2;
    }

    /**
     * Generate a procedural map using drunkard's walk
     * @returns {Object} Starting position {x, y}
     */
    generate() {
        this.data.fill(this.TILE_VOID);

        // Start from center
        let x = Math.floor(this.width / 2);
        let y = Math.floor(this.height / 2);
        let floorsCreated = 0;
        const targetFloors = (this.width * this.height) * CFG.MAP_FILL_RATIO;

        // Random walk to create floor tiles
        while (floorsCreated < targetFloors) {
            this.set(x, y, this.TILE_FLOOR);

            // Random direction
            const direction = Math.floor(Math.random() * 4);
            if (direction === 0) y--;
            else if (direction === 1) y++;
            else if (direction === 2) x--;
            else x++;

            // Keep within bounds with padding
            x = Math.max(2, Math.min(this.width - 3, x));
            y = Math.max(2, Math.min(this.height - 3, y));

            if (this.get(x, y) === this.TILE_VOID) {
                floorsCreated++;
            }
        }

        // Place walls around floor tiles
        this.generateWalls();

        // Return starting position (center in pixels)
        return {
            x: Math.floor(this.width / 2) * CFG.TILE,
            y: Math.floor(this.height / 2) * CFG.TILE
        };
    }

    /**
     * Generate walls around floor tiles
     */
    generateWalls() {
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.get(x, y) === this.TILE_VOID) {
                    // Check if adjacent to floor
                    let hasFloorNeighbor = false;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (this.get(x + dx, y + dy) === this.TILE_FLOOR) {
                                hasFloorNeighbor = true;
                                break;
                            }
                        }
                        if (hasFloorNeighbor) break;
                    }

                    if (hasFloorNeighbor) {
                        this.set(x, y, this.TILE_WALL);
                    }
                }
            }
        }
    }

    /**
     * Get tile at position
     * @param {number} x - Tile x coordinate
     * @param {number} y - Tile y coordinate
     * @returns {number} Tile type
     */
    get(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return this.TILE_VOID;
        }
        return this.data[y * this.width + x];
    }

    /**
     * Set tile at position
     * @param {number} x - Tile x coordinate
     * @param {number} y - Tile y coordinate
     * @param {number} value - Tile type
     */
    set(x, y, value) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.data[y * this.width + x] = value;
        }
    }

    /**
     * Draw the map
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera position {x, y}
     */
    draw(ctx, camera) {
        const tileSize = CFG.TILE;
        const x0 = Math.floor(camera.x / tileSize);
        const x1 = x0 + Math.ceil(CFG.W / tileSize) + 2;
        const y0 = Math.floor(camera.y / tileSize);
        const y1 = y0 + Math.ceil(CFG.H / tileSize) + 2;

        for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
                const tileType = this.get(x, y);
                if (tileType === this.TILE_VOID) continue;

                const pixelX = Math.floor(x * tileSize - camera.x);
                const pixelY = Math.floor(y * tileSize - camera.y);

                // Draw shadow below walls
                if (tileType === this.TILE_WALL) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.fillRect(pixelX, pixelY + tileSize, tileSize, tileSize / 2);
                }

                // Draw tile
                if (tileType === this.TILE_FLOOR) {
                    // Grass floor with checkerboard pattern
                    ctx.fillStyle = ((x + y) % 2) ? '#8ab060' : '#81a45a';
                    ctx.fillRect(pixelX, pixelY, tileSize, tileSize);

                    // Add occasional detail
                    if ((x * y) % 7 === 0) {
                        ctx.fillStyle = '#6c8c4a';
                        ctx.fillRect(pixelX + 10, pixelY + 10, 4, 4);
                    }
                } else if (tileType === this.TILE_WALL) {
                    // Wall with mossy texture
                    ctx.fillStyle = '#556b2f'; // Mossy top
                    ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
                    ctx.fillStyle = '#3a4a20'; // Darker face
                    ctx.fillRect(pixelX, pixelY + tileSize - 12, tileSize, 12);
                }
            }
        }
    }

    /**
     * Find a random floor tile position
     * @param {Object} minDistance - Optional minimum distance from point {x, y, distance}
     * @returns {Object} Position {x, y} in pixels
     */
    findRandomFloor(minDistance = null) {
        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            const tileX = Math.floor(Math.random() * this.width);
            const tileY = Math.floor(Math.random() * this.height);

            if (this.get(tileX, tileY) === this.TILE_FLOOR) {
                const pixelX = tileX * CFG.TILE;
                const pixelY = tileY * CFG.TILE;

                if (minDistance) {
                    const dist = Math.hypot(pixelX - minDistance.x, pixelY - minDistance.y);
                    if (dist >= minDistance.distance) {
                        return { x: pixelX, y: pixelY };
                    }
                } else {
                    return { x: pixelX, y: pixelY };
                }
            }

            attempts++;
        }

        // Fallback to center
        return {
            x: Math.floor(this.width / 2) * CFG.TILE,
            y: Math.floor(this.height / 2) * CFG.TILE
        };
    }
}
