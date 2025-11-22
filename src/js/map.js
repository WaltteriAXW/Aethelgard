/**
 * Map System
 * Enhanced procedural map generation using SimplexNoise and cellular automata
 */

import { CFG } from './config.js';
import { SimplexNoise } from './simplex-noise.js';

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
     * Generate a procedural map using SimplexNoise and cellular automata
     * @returns {Object} Starting position {x, y}
     */
    generate() {
        const noise = new SimplexNoise();
        this.data.fill(this.TILE_VOID);

        // Phase 1: Generate base terrain with noise
        const scale = 0.08; // Lower = more zoomed out
        const threshold = 0.1; // Adjust for more/less open space

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // Use octave noise for more organic patterns
                const value = noise.octaveNoise2D(x * scale, y * scale, 3, 0.5);

                // Create floor where noise is above threshold
                if (value > threshold) {
                    this.set(x, y, this.TILE_FLOOR);
                }
            }
        }

        // Phase 2: Cellular automata smoothing (makes caves more natural)
        this.smoothCaves(2);

        // Phase 3: Add some rooms for variety
        this.addRooms(3);

        // Phase 4: Ensure center is walkable
        this.ensureCenterOpen();

        // Phase 5: Remove isolated areas
        this.removeIsolated();

        // Phase 6: Place walls around floor tiles
        this.generateWalls();

        // Return starting position (center in pixels)
        return {
            x: Math.floor(this.width / 2) * CFG.TILE,
            y: Math.floor(this.height / 2) * CFG.TILE
        };
    }

    /**
     * Smooth caves using cellular automata
     * @param {number} iterations - Number of smoothing passes
     */
    smoothCaves(iterations) {
        for (let iter = 0; iter < iterations; iter++) {
            const newData = new Uint8Array(this.data);

            for (let y = 1; y < this.height - 1; y++) {
                for (let x = 1; x < this.width - 1; x++) {
                    // Count floor neighbors
                    let floorCount = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (this.get(x + dx, y + dy) === this.TILE_FLOOR) {
                                floorCount++;
                            }
                        }
                    }

                    // Apply rules: if 5+ neighbors are floor, become floor
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
     * Add rectangular rooms for variety
     * @param {number} count - Number of rooms to add
     */
    addRooms(count) {
        for (let i = 0; i < count; i++) {
            const roomW = 4 + Math.floor(Math.random() * 6);
            const roomH = 4 + Math.floor(Math.random() * 6);
            const roomX = 3 + Math.floor(Math.random() * (this.width - roomW - 6));
            const roomY = 3 + Math.floor(Math.random() * (this.height - roomH - 6));

            // Carve out room
            for (let y = roomY; y < roomY + roomH; y++) {
                for (let x = roomX; x < roomX + roomW; x++) {
                    this.set(x, y, this.TILE_FLOOR);
                }
            }
        }
    }

    /**
     * Ensure center area is open
     */
    ensureCenterOpen() {
        const cx = Math.floor(this.width / 2);
        const cy = Math.floor(this.height / 2);
        const radius = 3;

        for (let y = cy - radius; y <= cy + radius; y++) {
            for (let x = cx - radius; x <= cx + radius; x++) {
                this.set(x, y, this.TILE_FLOOR);
            }
        }
    }

    /**
     * Remove small isolated floor regions (flood fill)
     */
    removeIsolated() {
        const visited = new Uint8Array(this.width * this.height);
        const cx = Math.floor(this.width / 2);
        const cy = Math.floor(this.height / 2);

        // Flood fill from center to mark main area
        const queue = [[cx, cy]];
        visited[cy * this.width + cx] = 1;

        while (queue.length > 0) {
            const [x, y] = queue.shift();

            // Check 4 directions
            const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
            for (const [dx, dy] of dirs) {
                const nx = x + dx;
                const ny = y + dy;
                const idx = ny * this.width + nx;

                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height &&
                    !visited[idx] && this.get(nx, ny) === this.TILE_FLOOR) {
                    visited[idx] = 1;
                    queue.push([nx, ny]);
                }
            }
        }

        // Remove unvisited floor tiles (isolated areas)
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const idx = y * this.width + x;
                if (this.get(x, y) === this.TILE_FLOOR && !visited[idx]) {
                    this.set(x, y, this.TILE_VOID);
                }
            }
        }
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
                    // Cool blue/purple dungeon floor with checkerboard pattern
                    ctx.fillStyle = ((x + y) % 2) ? '#2a2a3e' : '#252538';
                    ctx.fillRect(pixelX, pixelY, tileSize, tileSize);

                    // Add varied details for more visual interest
                    const detailSeed = x * 17 + y * 13;

                    // Stone cracks/tiles
                    if (detailSeed % 5 === 0) {
                        ctx.fillStyle = '#3e3e5a';
                        ctx.fillRect(pixelX + (detailSeed % 30), pixelY + (detailSeed % 35), 3, 4);
                        ctx.fillRect(pixelX + (detailSeed % 30) + 3, pixelY + (detailSeed % 35), 3, 3);
                    }

                    // Small stones/debris
                    if (detailSeed % 11 === 0) {
                        ctx.fillStyle = '#1a1a28';
                        ctx.fillRect(pixelX + (detailSeed % 40), pixelY + (detailSeed % 40), 2, 2);
                    }

                    // Darker spots (aged stone)
                    if (detailSeed % 13 === 0) {
                        ctx.fillStyle = 'rgba(30, 30, 50, 0.4)';
                        ctx.fillRect(pixelX + (detailSeed % 25), pixelY + (detailSeed % 25), 8, 8);
                    }

                    // Edge darkening for depth
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                    ctx.fillRect(pixelX, pixelY, tileSize, 2);
                    ctx.fillRect(pixelX, pixelY, 2, tileSize);

                } else if (tileType === this.TILE_WALL) {
                    // Cool purple/blue stone wall
                    ctx.fillStyle = '#3e3e5a'; // Cool purple top
                    ctx.fillRect(pixelX, pixelY, tileSize, tileSize);

                    // Darker face for 3D effect
                    ctx.fillStyle = '#2a2a3e';
                    ctx.fillRect(pixelX, pixelY + tileSize - 12, tileSize, 12);

                    // Add cracks and wear
                    const crackSeed = x * 23 + y * 19;
                    if (crackSeed % 7 === 0) {
                        ctx.strokeStyle = '#2a3a10';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(pixelX + (crackSeed % 20), pixelY + (crackSeed % 30));
                        ctx.lineTo(pixelX + (crackSeed % 20) + 8, pixelY + (crackSeed % 30) + 12);
                        ctx.stroke();
                    }

                    // Moss patches
                    if (crackSeed % 9 === 0) {
                        ctx.fillStyle = '#4a5b1f';
                        ctx.fillRect(pixelX + (crackSeed % 35), pixelY + (crackSeed % 35), 4, 3);
                    }

                    // Highlight edge for definition
                    ctx.fillStyle = 'rgba(100, 120, 60, 0.3)';
                    ctx.fillRect(pixelX, pixelY, tileSize, 1);
                    ctx.fillRect(pixelX, pixelY, 1, tileSize);
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
